import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import { makeApp, signIn } from "./helpers";

/**
 * The audit found that every write returned an error after saving, every
 * DELETE crashed the process, and typed columns round-tripped incorrectly.
 * These tests cover the whole write path for one entity plus the field types
 * that were broken.
 */
describe("CRUD round trip", () => {
  let app: Express;
  let agent: Awaited<ReturnType<typeof signIn>>;

  beforeAll(async () => {
    app = await makeApp();
    agent = await signIn(app);
  });

  it("creates, reads, updates and deletes a client, writing an audit entry each time", async () => {
    const before = (await agent.get("/api/logs")).body.length;

    const created = await agent
      .post("/api/clients")
      .send({ name: "Acme", company: "Acme Corp", email: "sec@acme.test" });
    expect(created.status).toBe(201);
    const id = created.body.id;

    const read = await agent.get(`/api/clients/${id}`);
    expect(read.status).toBe(200);
    expect(read.body.name).toBe("Acme");

    const updated = await agent.patch(`/api/clients/${id}`).send({ status: "inactive" });
    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe("inactive");

    const removed = await agent.delete(`/api/clients/${id}`);
    expect(removed.status).toBe(200);

    expect(await agent.get(`/api/clients/${id}`).then((r) => r.status)).toBe(404);

    const after = (await agent.get("/api/logs")).body.length;
    expect(after).toBe(before + 3);
  });

  it("returns 404, not a crash, when deleting something that does not exist", async () => {
    const res = await agent.delete("/api/clients/missing-id");
    expect(res.status).toBe(404);
  });

  it("round-trips booleans, dates and JSON through storage", async () => {
    const client = await agent
      .post("/api/clients")
      .send({ name: "Types", company: "Types Ltd", email: "t@types.test" });

    const completedAt = "2026-01-15T10:30:00.000Z";
    const test = await agent.post("/api/tests").send({
      clientId: client.body.id,
      testType: "penetration-test",
      status: "completed",
      severity: "high",
      findings: { details: "one finding", count: 1 },
      completedAt,
      vulnerabilitiesFound: 3,
    });
    expect(test.status).toBe(201);
    // JSON survives as an object, not a re-encoded string.
    expect(test.body.findings).toEqual({ details: "one finding", count: 1 });
    expect(new Date(test.body.startedAt).toString()).not.toBe("Invalid Date");
    expect(new Date(test.body.completedAt).toISOString()).toBe(completedAt);

    const fetched = await agent.get(`/api/tests/${test.body.id}`);
    expect(fetched.body.findings).toEqual({ details: "one finding", count: 1 });
    expect(new Date(fetched.body.startedAt).toString()).not.toBe("Invalid Date");

    // Booleans: the seeded users must come back as real booleans.
    const users = await agent.get("/api/users");
    expect(typeof users.body[0].isActive).toBe("boolean");
  });

  it("filters by clientId and also serves the unfiltered list", async () => {
    const client = await agent
      .post("/api/clients")
      .send({ name: "Filter", company: "Filter Inc", email: "f@filter.test" });

    await agent.post("/api/documents").send({
      clientId: client.body.id,
      title: "Report",
      documentType: "Report",
    });

    const filtered = await agent.get(`/api/documents?clientId=${client.body.id}`);
    expect(filtered.status).toBe(200);
    expect(filtered.body).toHaveLength(1);

    // Without clientId the route now lists everything instead of returning 400.
    const all = await agent.get("/api/documents");
    expect(all.status).toBe(200);
    expect(all.body.length).toBeGreaterThanOrEqual(1);

    const sites = await agent.get("/api/sites");
    expect(sites.status).toBe(200);
  });

  it("creates and updates a site, which was entirely non-functional before", async () => {
    const client = await agent
      .post("/api/clients")
      .send({ name: "Sites", company: "Sites Co", email: "s@sites.test" });

    const site = await agent
      .post("/api/sites")
      .send({ clientId: client.body.id, url: "https://example.test", name: "Prod" });
    expect(site.status).toBe(201);
    expect(site.body.id).toBeTruthy();

    const updated = await agent.patch(`/api/sites/${site.body.id}`).send({ environment: "staging" });
    expect(updated.body.environment).toBe("staging");
  });

  it("persists the AI control kill switch", async () => {
    const on = await agent.patch("/api/ai-control").send({ killSwitchEnabled: true, systemStatus: "shutdown" });
    expect(on.status).toBe(200);
    expect(on.body.killSwitchEnabled).toBe(true);

    const readBack = await agent.get("/api/ai-control");
    expect(readBack.body.killSwitchEnabled).toBe(true);
    expect(readBack.body.systemStatus).toBe("shutdown");

    const off = await agent.patch("/api/ai-control").send({ killSwitchEnabled: false, systemStatus: "active" });
    expect(off.body.killSwitchEnabled).toBe(false);
  });

  it("returns AI health metrics newest first", async () => {
    const base = { cpuUsage: 10, memoryUsage: 20, successRate: 99, averageResponseTime: 120, detectionAccuracy: 95, falsePositiveRate: 2 };
    await agent.post("/api/ai-health").send({ ...base, cpuUsage: 11 }).expect(201);
    await new Promise((r) => setTimeout(r, 5));
    await agent.post("/api/ai-health").send({ ...base, cpuUsage: 22 }).expect(201);

    const latest = await agent.get("/api/ai-health/latest");
    expect(latest.body.cpuUsage).toBe(22);

    const list = await agent.get("/api/ai-health?limit=1");
    expect(list.body).toHaveLength(1);
    expect(list.body[0].cpuUsage).toBe(22);
  });

  it("rejects a body over the size limit", async () => {
    const res = await agent
      .post("/api/clients")
      .send({ name: "x".repeat(200_000), company: "y", email: "a@b.co" });
    expect(res.status).toBe(413);
  });

  it("reports validation errors as 400 with field detail", async () => {
    const res = await agent.post("/api/clients").send({ name: "", company: "", email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(Array.isArray(res.body.issues)).toBe(true);
  });
});
