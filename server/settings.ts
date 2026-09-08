/**
 * Where this deployment talks to, and with what.
 *
 * Both outward-facing clients -- server/engine.ts and server/assistant.ts --
 * read `process.env` directly, which is fine for a server and useless for a
 * desktop application: a packaged Electron build has no shell to set
 * variables in, so the engine and the assistant shipped permanently
 * disconnected with no way in the product to connect them. This is the way
 * in.
 *
 * Stored values win over the environment. The environment is what a server
 * deployment or a first run brings, and the stored value is what an operator
 * can see and change -- so a change made in the settings screen has to take
 * effect, or the screen is decoration. Where a value came from is reported,
 * so nobody has to guess why a field looks the way it does.
 *
 * Held in memory and refreshed on write. The alternative is making every
 * accessor async and threading a promise through both clients, for a
 * single-process desktop application reading five short strings; this is
 * loaded once at boot and again whenever somebody saves.
 */

import { storage } from "./storage-unified";
import type { ConnectionSetting, UpdateConnectionSettings } from "@shared/schema";

/** A setting, its environment fallback, and whether it is a credential. */
export const FIELDS = {
  engineUrl: { env: "ATHENA_ENGINE_URL", secret: false },
  engineKey: { env: "ATHENA_ENGINE_KEY", secret: true },
  assistantUrl: { env: "ATHENA_ASSISTANT_URL", secret: false },
  assistantKey: { env: "ATHENA_ASSISTANT_KEY", secret: true },
  assistantModel: { env: "ATHENA_ASSISTANT_MODEL", secret: false },
} as const;

export type Field = keyof typeof FIELDS;

/** Where a value in force came from, which the settings screen shows. */
export type Source = "stored" | "environment" | "unset";

let cache: ConnectionSetting | undefined;
let loaded = false;

/** Read the stored row once, at boot. Safe to call more than once. */
export async function load(): Promise<void> {
  try {
    cache = await storage.getConnectionSettings();
  } catch {
    // A database that cannot be read yet is not a reason to refuse to boot;
    // the environment still applies and the settings screen will say so.
    cache = undefined;
  }
  loaded = true;
}

function stored(field: Field): string {
  return (cache?.[field] ?? "").toString().trim();
}

function fromEnvironment(field: Field): string {
  return (process.env[FIELDS[field].env] ?? "").trim();
}

/** The value in force: what was stored, else what the environment brought. */
export function get(field: Field): string {
  return stored(field) || fromEnvironment(field);
}

export function sourceOf(field: Field): Source {
  if (stored(field)) return "stored";
  if (fromEnvironment(field)) return "environment";
  return "unset";
}

export function isLoaded(): boolean {
  return loaded;
}

/**
 * What the settings screen is told.
 *
 * A secret is reported as set or not set and never as its value. There is no
 * benign version of an API key on the wire: it reaches a browser, a devtools
 * network tab, and whatever is between -- and the one thing the screen needs
 * to know is whether somebody has to type one, which a boolean answers.
 */
export function readable(): Array<{
  field: Field;
  secret: boolean;
  source: Source;
  set: boolean;
  value: string | null;
  env: string;
}> {
  return (Object.keys(FIELDS) as Field[]).map((field) => {
    const secret = FIELDS[field].secret;
    const value = get(field);
    return {
      field,
      secret,
      source: sourceOf(field),
      set: value !== "",
      value: secret ? null : value || null,
      env: FIELDS[field].env,
    };
  });
}

/**
 * Save, and make the change live.
 *
 * An empty string clears a field rather than being ignored, because "remove
 * the key I pasted in by mistake" has to be expressible. A field the caller
 * did not mention is left alone.
 */
export async function save(
  updates: UpdateConnectionSettings, updatedBy: string | null,
): Promise<void> {
  const cleaned: Record<string, string | null> = {};
  for (const [key, raw] of Object.entries(updates)) {
    if (raw === undefined) continue;
    const value = (raw ?? "").toString().trim();
    cleaned[key] = value === "" ? null : value;
  }
  cache = await storage.updateConnectionSettings(cleaned as UpdateConnectionSettings, updatedBy);
}
