/**
 * The client for the assistant behind the chat screen.
 *
 * What this replaced: the page picked one of five strings written into its
 * own source, at random, and wrote it into the database as an AI message.
 *
 *   const responses = ["I'm analyzing the security data you provided…", …];
 *   sendMutation.mutate({ message: responses[Math.floor(Math.random() * 5)],
 *                         sender: "ai" });
 *
 * That is worse than the fake progress bar it sits next to, for two reasons.
 * The lie is persisted -- it goes into the chat history and stays there, so
 * afterwards nobody can tell which messages an assistant produced and which
 * the app invented. And it repeats: three messages in, the same sentence
 * comes back.
 *
 * So this talks to an OpenAI-compatible endpoint, and when there is not one
 * it says so and answers nothing. The same shape as server/engine.ts, on
 * purpose: there should be one way this app talks to something outside
 * itself, and one way it behaves when that thing is absent.
 */

const ASSISTANT_URL = "ATHENA_ASSISTANT_URL";
const ASSISTANT_KEY = "ATHENA_ASSISTANT_KEY";
const ASSISTANT_MODEL = "ATHENA_ASSISTANT_MODEL";

/** How long one completion may take before the operator gets an answer. */
const TIMEOUT_MS = 45_000;

/** The most of an error body we will quote back into a browser. */
const MAX_ERROR_BODY = 500;

/**
 * How much of the conversation goes back with each turn.
 *
 * Bounded because the history is unbounded: a chat somebody has been using
 * for a month would otherwise grow the request until the endpoint refused it,
 * and the failure would arrive as a wall of provider JSON.
 */
const MAX_HISTORY = 20;

/** A reply longer than this is not an answer, it is a runaway. */
const MAX_REPLY_CHARS = 4_000;

export class AssistantUnavailable extends Error {}

export interface AssistantStatus {
  configured: boolean;
  reachable: boolean;
  model: string | null;
  detail: string;
}

export interface Turn {
  role: "system" | "user" | "assistant";
  content: string;
}

function baseUrl(): string | null {
  const raw = (process.env[ASSISTANT_URL] ?? "").trim();
  return raw ? raw.replace(/\/+$/, "") : null;
}

function model(): string {
  return (process.env[ASSISTANT_MODEL] ?? "").trim() || "gpt-4o-mini";
}

export function isConfigured(): boolean {
  return baseUrl() !== null;
}

/**
 * What the assistant is told about this deployment, and what it is told not
 * to do.
 *
 * The instruction to refuse rather than guess is the load-bearing half. An
 * assistant inside a security product that invents a finding is the same
 * defect as the five canned strings, arriving by a more expensive route --
 * and a plausible invented finding is harder to catch than a repeated one.
 */
export function systemPrompt(context: string): Turn {
  return {
    role: "system",
    content: [
      "You are the assistant inside Athena, a penetration-testing and security",
      "record product. You are talking to the operator who runs it.",
      "",
      "Answer only from the deployment summary below and from what the",
      "operator tells you. If you are asked something the summary does not",
      "cover -- the contents of a finding, what a scan concluded, whether a",
      "system is vulnerable -- say you do not have it and name the screen that",
      "would. Never invent a finding, a severity, a CVE, or a number. A made-up",
      "answer here becomes part of a customer's security record.",
      "",
      "Be brief. The operator is working.",
      "",
      "Deployment summary:",
      context,
    ].join("\n"),
  };
}

async function body(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, MAX_ERROR_BODY);
  } catch {
    return "";
  }
}

async function call(path: string, init?: RequestInit): Promise<Response> {
  const base = baseUrl();
  if (!base) {
    throw new AssistantUnavailable(
      `no assistant is configured; set ${ASSISTANT_URL} to an ` +
        `OpenAI-compatible endpoint and ${ASSISTANT_KEY} to its key`,
    );
  }
  const key = (process.env[ASSISTANT_KEY] ?? "").trim();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    });
  } catch (cause) {
    const why = cause instanceof Error ? cause.message : String(cause);
    throw new AssistantUnavailable(`could not reach the assistant: ${why}`);
  } finally {
    clearTimeout(timer);
  }
}

export async function status(): Promise<AssistantStatus> {
  if (!isConfigured()) {
    return {
      configured: false,
      reachable: false,
      model: null,
      detail:
        `no assistant is configured, so this screen keeps a record of what you ` +
        `type and answers nothing. Set ${ASSISTANT_URL} to an OpenAI-compatible ` +
        `endpoint and ${ASSISTANT_KEY} to its key.`,
    };
  }
  // Deliberately not a live probe. A completions endpoint has no free health
  // check -- asking one costs a request and a token bill on every page load --
  // so this reports what is configured and lets the first message find out
  // whether it answers. The failure, when it comes, is shown in full.
  return {
    configured: true,
    reachable: true,
    model: model(),
    detail: `messages are sent to the configured endpoint as ${model()}`,
  };
}

/**
 * One turn. Returns the assistant's reply, or raises.
 *
 * Raising rather than returning a placeholder is the whole point: there is no
 * string this can return that is honest when the endpoint did not answer.
 */
export async function reply(history: Turn[], context: string): Promise<string> {
  const messages = [systemPrompt(context), ...history.slice(-MAX_HISTORY)];

  const response = await call("/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: model(),
      messages,
      temperature: 0.2,
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    throw new AssistantUnavailable(
      `the assistant answered ${response.status}: ${await body(response)}`,
    );
  }

  const payload = (await response.json()) as Record<string, any>;
  const text = payload?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || text.trim() === "") {
    // An empty completion is not an answer. Storing one would put a blank
    // message in the record with `sender: "ai"` beside it.
    throw new AssistantUnavailable(
      "the assistant returned nothing this app could read as a reply",
    );
  }
  return text.trim().slice(0, MAX_REPLY_CHARS);
}
