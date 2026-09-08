/**
 * The client for the Mythos engine.
 *
 * Athena records what was tested; the engine does the testing. Until now the
 * two had never been introduced, so the penetration-testing screen counted a
 * progress bar to a hundred over five seconds and printed two findings that
 * were written into the source. That is the single worst thing in the app to
 * put in front of somebody: it is a lie, it is the first screen a technical
 * visitor asks about, and the question they ask is "what did it actually
 * scan?"
 *
 * So this is small and it is honest about its own absence. When no engine is
 * configured, every call answers `configured: false` with a reason, the UI
 * says so in words, and nothing invents a finding. An engine that is not
 * there is a fact about the deployment, not an excuse for fiction.
 */

import * as settings from "./settings";

const ENGINE_URL = settings.FIELDS.engineUrl.env;
const ENGINE_KEY = settings.FIELDS.engineKey.env;

/** How long any single call to the engine may take. */
const TIMEOUT_MS = 20_000;

/** The most of the engine's error body we will quote back. */
const MAX_ERROR_BODY = 500;

export interface EngineStatus {
  configured: boolean;
  reachable: boolean;
  /**
   * Whether the engine accepted the operator key.
   *
   * Separate from `reachable`, because the engine's /health takes no
   * credential at all: it answers "ok" to anybody who can open a socket to
   * it. Reporting that as connected meant an address with a wrong key, or no
   * key, showed a green light and lit the Start button, and the operator
   * found out at dispatch when the scan came back 401.
   *
   * `null` means nobody could tell -- the engine is too old to have the route
   * this asks on. Not knowing is a third state and it is not "yes".
   */
  authorized: boolean | null;
  url: string | null;
  detail: string;
  /** What the engine says about itself, when it answered. */
  health?: unknown;
}

export interface EngineScan {
  runId: string | null;
  state: string;
  findings: unknown[];
  detail: string;
  /** The engine's own refusal, when it refused. Shown verbatim. */
  refused?: string;
}

export class EngineUnavailable extends Error {}

function baseUrl(): string | null {
  // From the settings row if an operator saved one, else from the
  // environment. Read through settings rather than process.env so a change
  // made in the app takes effect without a restart -- a desktop build has no
  // shell to set a variable in, and a settings screen whose changes need one
  // is a settings screen that does not work.
  const raw = settings.get("engineUrl");
  return raw ? raw.replace(/\/+$/, "") : null;
}

export function isConfigured(): boolean {
  return baseUrl() !== null;
}

function headers(): Record<string, string> {
  const key = settings.get("engineKey");
  const out: Record<string, string> = { "Content-Type": "application/json" };
  // The engine's operator routes want this; the scan route wants it too. An
  // unset key is not an error here -- the engine will say so itself, and its
  // refusal is more accurate than a guess made from this side.
  if (key) out["X-API-Key"] = key;
  return out;
}

async function call(path: string, init?: RequestInit): Promise<Response> {
  const base = baseUrl();
  if (!base) {
    throw new EngineUnavailable(
      `no engine is configured; set ${ENGINE_URL} to the engine's address`,
    );
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${base}${path}`, {
      ...init,
      headers: { ...headers(), ...(init?.headers ?? {}) },
      signal: controller.signal,
    });
  } catch (cause) {
    // A hostname, a port and a refusal are all the operator needs; the stack
    // is not, and this string reaches a browser.
    const why = cause instanceof Error ? cause.message : String(cause);
    throw new EngineUnavailable(`could not reach the engine at ${base}: ${why}`);
  } finally {
    clearTimeout(timer);
  }
}

async function body(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, MAX_ERROR_BODY);
  } catch {
    return "";
  }
}

/**
 * The cheapest thing on the engine that requires an operator key.
 *
 * It has to cost the engine nothing, because this runs on a poll: /health
 * /guards re-runs the whole boot canary and verify walks the record chain,
 * so neither belongs on a timer. This one reaps stale rows and lists what is
 * running, which the engine does anyway.
 */
const CREDENTIAL_PROBE = "/api/scans/active";

/**
 * Does the engine accept our key?
 *
 * Returns what is true, including "could not tell". A 404 here means the
 * engine predates this route, not that the key is bad, and answering "bad
 * key" to that would send an operator to re-issue a credential that was
 * fine.
 */
async function credentialCheck(): Promise<{ authorized: boolean | null; detail: string }> {
  if (!settings.get("engineKey")) {
    return {
      authorized: false,
      detail:
        `the engine answered, but no operator key is set, so it will refuse ` +
        `to scan. Issue one on the engine (tools/start_engine.py prints one) ` +
        `and set it on the Settings screen, or as ${ENGINE_KEY}.`,
    };
  }
  let response: Response;
  try {
    response = await call(CREDENTIAL_PROBE);
  } catch (cause) {
    // Reached /health a moment ago and cannot reach this: report the fact,
    // do not convert it into a verdict about the key.
    return {
      authorized: null,
      detail: `the engine answered, but the key could not be checked: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    };
  }
  if (response.status === 401 || response.status === 403) {
    return {
      authorized: false,
      detail: `the engine rejected the operator key (${response.status}): ${await body(response)}`,
    };
  }
  if (response.status === 404) {
    return {
      authorized: null,
      detail:
        `the engine answered, but it has no ${CREDENTIAL_PROBE} route, so the ` +
        `operator key could not be checked from here. A scan will be the ` +
        `first thing to find out whether it works.`,
    };
  }
  if (!response.ok) {
    return {
      authorized: null,
      detail: `the engine answered ${response.status} when the key was checked: ${await body(response)}`,
    };
  }
  return { authorized: true, detail: "the engine answered and accepted the operator key" };
}

export async function status(): Promise<EngineStatus> {
  const url = baseUrl();
  if (!url) {
    return {
      configured: false,
      reachable: false,
      authorized: false,
      url: null,
      detail:
        `no engine is configured, so nothing on this screen can scan anything. ` +
        `Set its address and an operator key on the Settings screen, or ` +
        `${ENGINE_URL} and ${ENGINE_KEY} in the environment.`,
    };
  }
  try {
    const response = await call("/health");
    if (!response.ok) {
      return {
        configured: true,
        reachable: false,
        authorized: false,
        url,
        detail: `the engine answered ${response.status}: ${await body(response)}`,
      };
    }
    const health = await response.json().catch(() => null);
    const credential = await credentialCheck();
    return {
      configured: true,
      reachable: true,
      authorized: credential.authorized,
      url,
      detail: credential.detail,
      health,
    };
  } catch (cause) {
    return {
      configured: true,
      reachable: false,
      authorized: false,
      url,
      detail: cause instanceof Error ? cause.message : String(cause),
    };
  }
}

export interface ScanRequest {
  target: string;
  /** The engagement this scan is being run under. The engine records it. */
  engagementRef: string;
  /**
   * The hosts this engagement authorises.
   *
   * Sent because the engine's fallback, given none, is the target's own host
   * -- which makes its scope check unfalsifiable, since the only host it can
   * refuse is the one it derived the scope from. Athena is the side that
   * holds the client's site list, so Athena is the side that can make that
   * check mean something.
   */
  scope: string[];
}

/**
 * Ask the engine to scan a target.
 *
 * A refusal is a result, not an exception: the engine refuses a target its
 * egress policy will not reach, and that refusal -- with its reason -- is
 * exactly what an operator needs to see. Swallowing it into "scan failed"
 * would throw away the only useful sentence.
 */
export async function startScan(request: ScanRequest): Promise<EngineScan> {
  const response = await call("/api/scan", {
    method: "POST",
    // No tenant is sent. The engine binds a credential to a tenant and
    // resolves it from the key, and Athena's client id is not that tenant --
    // sending it got "this credential is bound to a different tenant", which
    // was the engine being right. What Athena knows is the engagement, and
    // that is what it says.
    body: JSON.stringify({
      target: request.target,
      engagement_ref: request.engagementRef,
      scope: request.scope,
    }),
  });

  if (response.status === 403 || response.status === 409) {
    return {
      runId: null,
      state: "refused",
      findings: [],
      detail: "the engine refused this scan",
      refused: await body(response),
    };
  }
  if (!response.ok) {
    throw new EngineUnavailable(
      `the engine answered ${response.status}: ${await body(response)}`,
    );
  }

  const payload = (await response.json()) as Record<string, unknown>;
  return {
    runId: (payload.run_id as string) ?? null,
    state: (payload.state as string) ?? "running",
    findings: Array.isArray(payload.results) ? payload.results : [],
    detail: "the engine accepted the scan",
  };
}

/**
 * What the engine's CVE classifier made of a piece of text.
 *
 * `informative` is the field that matters. The model knows five classes, so
 * an input it has no signal for comes back at exactly the floor -- one fifth
 * -- carrying whichever label wins the tie-break, which is always `rce`.
 * Measured: an empty string, "zzzz", "csrf token missing" and "xxe external
 * entity" all answer `rce` at 0.200, because CSRF and XXE are not among the
 * five. Rendering that as a classification would replace the constant this
 * screen used to print with a different untruth.
 */
export interface CveClassification {
  label: string | null;
  confidence: number;
  /** False when the model expressed no preference and the label is a tie-break. */
  informative: boolean;
  /** The no-information floor, 1/classes, as the engine computed it. */
  baseline: number | null;
  /** Every label this model can return, so a caller can say what it cannot. */
  classes: string[];
  engineVersion: string | null;
  /** The engine's own words when the model is not loaded at all. */
  unavailable: string | null;
}

/**
 * Ask the engine to classify a vulnerability description.
 *
 * This screen once answered "SQL Injection, 92% confident" to every input,
 * both constants. It then said no classification route existed, which was
 * wrong -- `/api/classify-cve` has been there all along. This calls it.
 */
export async function classifyCve(text: string): Promise<CveClassification> {
  const response = await call("/api/classify-cve", {
    method: "POST",
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new EngineUnavailable(
      `the engine answered ${response.status}: ${await body(response)}`,
    );
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const classes = Array.isArray(payload.classes)
    ? payload.classes.filter((one): one is string => typeof one === "string")
    : [];

  return {
    label: typeof payload.label === "string" ? payload.label : null,
    confidence: typeof payload.confidence === "number" ? payload.confidence : 0,
    // Absent means false. An older engine that does not send this field has
    // not told us the answer was informative, and assuming it was is how the
    // floor case gets rendered as a finding.
    informative: payload.informative === true,
    baseline: typeof payload.baseline === "number" ? payload.baseline : null,
    classes,
    engineVersion:
      typeof payload.engine_version === "string" ? payload.engine_version : null,
    unavailable: typeof payload.error === "string" ? payload.error : null,
  };
}

/** Where a run has got to. */
export async function runState(runId: string): Promise<EngineScan> {
  const response = await call(`/api/scans/${encodeURIComponent(runId)}`);
  if (!response.ok) {
    throw new EngineUnavailable(
      `the engine answered ${response.status}: ${await body(response)}`,
    );
  }
  const payload = (await response.json()) as Record<string, unknown>;
  const result = (payload.result ?? {}) as Record<string, unknown>;
  return {
    runId,
    state: (payload.state as string) ?? "unknown",
    findings: Array.isArray(result.results) ? result.results : [],
    detail: (payload.reason as string) ?? "",
  };
}

/** Ask a running scan to stop. */
export async function abort(runId: string): Promise<boolean> {
  const response = await call(`/api/scans/${encodeURIComponent(runId)}/abort`, {
    method: "POST",
  });
  return response.ok;
}
