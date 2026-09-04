import crypto from "crypto";

/**
 * Password hashing for Athena.
 *
 * Current format:  scrypt$<hex salt>$<hex hash>
 * Legacy format:   64 hex chars (unsalted SHA-256) — accepted on login and
 *                  transparently re-hashed, so existing databases keep working.
 */

const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const LEGACY_SHA256 = /^[0-9a-f]{64}$/i;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export interface VerifyResult {
  ok: boolean;
  /** True when the stored hash uses the legacy scheme and should be replaced. */
  needsRehash: boolean;
}

export function verifyPassword(password: string, stored: string | null | undefined): VerifyResult {
  if (!stored) return { ok: false, needsRehash: false };

  if (stored.startsWith("scrypt$")) {
    const parts = stored.split("$");
    if (parts.length !== 3) return { ok: false, needsRehash: false };
    const [, salt, hex] = parts;
    const expected = Buffer.from(hex, "hex");
    const candidate = crypto.scryptSync(password, salt, expected.length);
    const ok = candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
    return { ok, needsRehash: false };
  }

  if (LEGACY_SHA256.test(stored)) {
    const expected = Buffer.from(stored, "hex");
    const candidate = crypto.createHash("sha256").update(password).digest();
    const ok = crypto.timingSafeEqual(candidate, expected);
    return { ok, needsRehash: ok };
  }

  return { ok: false, needsRehash: false };
}

export function isHashedPassword(value: string): boolean {
  return value.startsWith("scrypt$") || LEGACY_SHA256.test(value);
}
