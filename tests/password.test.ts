import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { hashPassword, verifyPassword } from "../server/password";

describe("password hashing", () => {
  it("produces a salted scrypt hash, not a bare digest", () => {
    const hash = hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(hash.split("$")).toHaveLength(3);
  });

  it("salts, so the same password hashes differently each time", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });

  it("verifies the right password and rejects the wrong one", () => {
    const hash = hashPassword("s3cret-password");
    expect(verifyPassword("s3cret-password", hash).ok).toBe(true);
    expect(verifyPassword("wrong", hash).ok).toBe(false);
  });

  it("accepts a legacy unsalted SHA-256 hash and asks for a rehash", () => {
    const legacy = crypto.createHash("sha256").update("admin123").digest("hex");
    const result = verifyPassword("admin123", legacy);
    expect(result.ok).toBe(true);
    expect(result.needsRehash).toBe(true);
  });

  it("rejects a wrong password against a legacy hash", () => {
    const legacy = crypto.createHash("sha256").update("admin123").digest("hex");
    expect(verifyPassword("nope", legacy).ok).toBe(false);
  });

  it("handles missing or malformed stored hashes without throwing", () => {
    expect(verifyPassword("x", null).ok).toBe(false);
    expect(verifyPassword("x", "").ok).toBe(false);
    expect(verifyPassword("x", "scrypt$only-two-parts").ok).toBe(false);
    expect(verifyPassword("x", "not-a-hash").ok).toBe(false);
  });
});
