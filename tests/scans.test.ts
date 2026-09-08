import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { Express } from "express";
import { makeApp, signIn } from "./helpers";

/**
 * The penetration-testing screen counted a progress bar to a hundred over five
 * seconds and printed two findings that were written into the source. These
 * cover the route that replaced it: an engagement it will not scan without, an
 * engine it will not pretend to have, and counts taken from what came back.
 */
describe("dispatching a scan", () => {
  let app: Express;
  let agent: Awaited<ReturnType<typeof signIn>>;
  let clientId: string;
  let otherClientId: string;
  let siteId: string;
  let foreignSiteId: string;

  beforeAll(async () => {
    app = await makeApp();
    agent = await signIn(app);

    const client = await agent
      .post("/api/clients")
      .send({ name: "Acme", company: "Acme Corp", email: "sec@acme.test" });
    clientId = client.body.id;

    const other = await agent
      .post("/api/clients")
      .send({ name: "Globex", company: "Globex", email: "sec@globex.test" });
    otherClientId = other.body.id;

    const site = await agent
      .post("/api/sites")
      .send({ clientId, name: "Storefront", url: "https://shop.acme.test" });
    siteId = site.body.id;

    const foreign = await agent
      .post("/api/sites")
      .send({ clientId: otherClientId, name: "Portal", url: "https://globex.test" });
    foreignSiteId = foreign.body.id;
  });

  afterEach(() => {
    delete process.env.ATHENA_ENGINE_URL;
  });

  it("says plainly that no engine is configured rather than reporting a failure", async () => {
    const status = await agent.get("/api/engine/status");
    expect(status.status).toBe(200);
    expect(status.body.configured).toBe(false);
    expect(status.body.reachable).toBe(false);
    // A sentence an operator can act on, naming the variable to set.
    expect(status.body.detail).toContain("ATHENA_ENGINE_URL");
  });

  it("answers 503 for a scan with no engine, because nothing is broken", async () => {
    const response = await agent
      .post("/api/scans")
      .send({ clientId, target: "https://shop.acme.test" });

    expect(response.status).toBe(503);
    expect(response.body.error).toContain("no engine is configured");
  });

  it("refuses a scan against a client that does not exist", async () => {
    const response = await agent
      .post("/api/scans")
      .send({ clientId: "nope", target: "https://shop.acme.test" });
    expect(response.status).toBe(404);
  });

  it("refuses a site that belongs to a different client", async () => {
    // The engagement is the client and the site together. A site from
    // somebody else's engagement is not a narrower scope, it is a different
    // customer.
    const response = await agent
      .post("/api/scans")
      .send({ clientId, siteId: foreignSiteId, target: "https://shop.acme.test" });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("different client");
  });

  it("refuses a scan with no target at all", async () => {
    const response = await agent.post("/api/scans").send({ clientId });
    expect(response.status).toBe(400);
  });

  it("reports an engine that is configured and not answering as unreachable", async () => {
    // A port nothing is listening on: configured, and not there.
    process.env.ATHENA_ENGINE_URL = "http://127.0.0.1:9";
    const status = await agent.get("/api/engine/status");

    expect(status.body.configured).toBe(true);
    expect(status.body.reachable).toBe(false);
    // Two different claims, and they used to share an answer.
    expect(status.body.detail.length).toBeGreaterThan(0);
  });

  it("keeps the site chosen for the engagement", async () => {
    process.env.ATHENA_ENGINE_URL = "http://127.0.0.1:9";
    const response = await agent
      .post("/api/scans")
      .send({ clientId, siteId, target: "https://shop.acme.test" });

    // The engine is unreachable, so this is a 503 -- but it got past the
    // engagement checks, which is what this asserts.
    expect(response.status).toBe(503);
  });
});
