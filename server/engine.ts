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

export async function status(): Promise<EngineStatus> {
  const url = baseUrl();
  if (!url) {
    return {
      configured: false,
      reachable: false,
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
        url,
        detail: `the engine answered ${response.status}: ${await body(response)}`,
      };
    }
    return {
      configured: true,
      reachable: true,
      url,
      detail: "the engine answered",
      health: await response.json().catch(() => null),
    };
  } catch (cause) {
    return {
      configured: true,
      reachable: false,
      url,
      detail: cause instanceof Error ? cause.message : String(cause),
    };
  }
}

export interface ScanRequest {
  target: string;
  /** The engagement this scan is being run under. The engine records it. */
  engagementRef: string;
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
