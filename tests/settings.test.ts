import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { Express } from "express";
import request from "supertest";
import { makeApp, signIn } from "./helpers";

/**
 * The engine's address and the assistant's endpoint were environment
 * variables and nothing else, so a packaged desktop build -- which has no
 * shell to set them in -- shipped both permanently disconnected with no way
 * in the product to connect them.
 *
 * These cover what replaced that, and what it must never do: hand a key back.
 */
describe("connection settings", () => {
  let app: Express;
  let admin: Awaited<ReturnType<typeof signIn>>;

  async function plainUser() {
    const username = `plain-${Math.random().toString(36).slice(2, 10)}`;
    await admin
      .post("/api/users")
      .send({ username, password: "plain-password", role: "user", email: null });
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ username, password: "plain-password" });
    return agent;
  }

  beforeAll(async () => {
    app = await makeApp();
    admin = await signIn(app);
  });

  afterEach(async () => {
    delete process.env.ATHENA_ENGINE_URL;
    await admin.patch("/api/settings/connections").send({
      engineUrl: "", engineKey: "", assistantUrl: "", assistantKey: "",
      assistantModel: "",
    });
  });

  it("never sends a key back, only whether one is set", async () => {
    await admin
      .patch("/api/settings/connections")
      .send({ engineKey: "an-operator-key-nobody-should-see" });

    const read = await admin.get("/api/settings/connections");
    expect(read.status).toBe(200);

    // The whole body, not just the field: a key must not be anywhere in it.
    expect(JSON.stringify(read.body)).not.toContain("an-operator-key-nobody-should-see");

    const key = read.body.fields.find((one: any) => one.field === "engineKey");
    expect(key.secret).toBe(true);
    expect(key.set).toBe(true);
    expect(key.value).toBeNull();
  });

  it("sends a non-secret value back, because the screen has to show it", async () => {
    await admin
      .patch("/api/settings/connections")
      .send({ engineUrl: "https://engine.internal:8099" });

    const read = await admin.get("/api/settings/connections");
    const url = read.body.fields.find((one: any) => one.field === "engineUrl");
    expect(url.value).toBe("https://engine.internal:8099");
    expect(url.source).toBe("stored");
  });

  it("keeps a non-admin away from both reading and writing", async () => {
    // These fields decide which engine scans a customer and which third party
    // sees a summary of what was found.
    const user = await plainUser();
    expect((await user.get("/api/settings/connections")).status).toBe(403);
    expect(
      (await user.patch("/api/settings/connections").send({ engineUrl: "https://x.test" })).status,
    ).toBe(403);
  });

  it("refuses an address that is not one", async () => {
    const bad = await admin
      .patch("/api/settings/connections")
      .send({ engineUrl: "engine.internal:8099" });
    expect(bad.status).toBe(400);
  });

  it("says when a value is in force from the environment, and lets it be overridden", async () => {
    process.env.ATHENA_ENGINE_URL = "http://from-the-environment:8099";

    const before = await admin.get("/api/settings/connections");
    const fromEnv = before.body.fields.find((one: any) => one.field === "engineUrl");
    expect(fromEnv.source).toBe("environment");
    expect(fromEnv.value).toBe("http://from-the-environment:8099");

    // A change made in the app has to take effect, or the screen is decoration.
    await admin
      .patch("/api/settings/connections")
      .send({ engineUrl: "https://chosen-here.test" });

    const after = await admin.get("/api/settings/connections");
    const stored = after.body.fields.find((one: any) => one.field === "engineUrl");
    expect(stored.source).toBe("stored");
    expect(stored.value).toBe("https://chosen-here.test");
  });

  it("takes effect without a restart", async () => {
    // The clients read through the settings layer rather than process.env, so
    // saving here changes what the next request does.
    expect((await admin.get("/api/engine/status")).body.configured).toBe(false);

    await admin
      .patch("/api/settings/connections")
      .send({ engineUrl: "http://127.0.0.1:9" });

    const status = await admin.get("/api/engine/status");
    expect(status.body.configured).toBe(true);
    expect(status.body.url).toBe("http://127.0.0.1:9");
  });

  it("clears a key when asked, so one pasted in by mistake is not permanent", async () => {
    await admin.patch("/api/settings/connections").send({ assistantKey: "wrong-key" });
    expect(
      (await admin.get("/api/settings/connections")).body.fields
        .find((one: any) => one.field === "assistantKey").set,
    ).toBe(true);

    await admin.patch("/api/settings/connections").send({ assistantKey: "" });
    expect(
      (await admin.get("/api/settings/connections")).body.fields
        .find((one: any) => one.field === "assistantKey").set,
    ).toBe(false);
  });

  it("records which fields changed and never what they changed to", async () => {
    await admin
      .patch("/api/settings/connections")
      .send({ engineKey: "another-key-nobody-should-see" });

    const logs = await admin.get("/api/logs");
    const entry = logs.body.find(
      (one: any) => one.entityType === "connection_settings",
    );
    expect(entry).toBeTruthy();
    expect(entry.details.fields).toContain("engineKey");
    // An audit log that records a credential is a second place it lives.
    expect(JSON.stringify(entry)).not.toContain("another-key-nobody-should-see");
  });
});
