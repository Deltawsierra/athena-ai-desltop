import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
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

/**
 * The engagement's scope, sent to the engine.
 *
 * The engine's fallback, given no scope, is the target's own host -- so its
 * check can only ever refuse the thing it derived the scope from, which is
 * not a check. Athena holds the client's site list, so Athena is the side
 * that can make it mean something.
 */
describe("what authorises a scan", () => {
  let app: Express;
  let agent: Awaited<ReturnType<typeof signIn>>;
  let server: import("http").Server;
  let sent: Array<Record<string, unknown>> = [];

  beforeAll(async () => {
    const http = await import("http");
    server = http.createServer((req, res) => {
      let raw = "";
      req.on("data", (chunk) => { raw += chunk; });
      req.on("end", () => {
        if (req.url === "/health") {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ status: "ok" }));
        }
        if (req.url === "/api/scan") sent.push(JSON.parse(raw || "{}"));
        res.writeHead(202, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ run_id: "run-1", state: "running" }));
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = (server.address() as import("net").AddressInfo).port;
    process.env.ATHENA_ENGINE_URL = `http://127.0.0.1:${port}`;
    process.env.ATHENA_ENGINE_KEY = "ce_op_test";
    vi.resetModules();
    app = await makeApp();
    agent = await signIn(app);
  });

  afterAll(async () => {
    delete process.env.ATHENA_ENGINE_URL;
    delete process.env.ATHENA_ENGINE_KEY;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("sends the client's recorded sites as the scope", async () => {
    sent = [];
    const client = await agent.post("/api/clients")
      .send({ name: "Scoped", company: "Scoped Ltd", email: "s@example.test" });
    await agent.post("/api/sites")
      .send({ clientId: client.body.id, name: "One", url: "https://one.example" });
    await agent.post("/api/sites")
      .send({ clientId: client.body.id, name: "Two", url: "https://two.example" });

    const started = await agent.post("/api/scans")
      .send({ clientId: client.body.id, target: "https://one.example/login" });
    expect(started.status).toBe(201);

    expect(sent).toHaveLength(1);
    expect(sent[0].scope).toEqual(["one.example", "two.example"]);
    expect(sent[0].engagement_ref).toBe(client.body.id);
  });

  it("narrows the scope to one site when one was chosen", async () => {
    sent = [];
    const client = await agent.post("/api/clients")
      .send({ name: "Narrow", company: "Narrow Ltd", email: "n@example.test" });
    const site = await agent.post("/api/sites")
      .send({ clientId: client.body.id, name: "Only", url: "https://only.example" });
    await agent.post("/api/sites")
      .send({ clientId: client.body.id, name: "Other", url: "https://other.example" });

    await agent.post("/api/scans").send({
      clientId: client.body.id, siteId: site.body.id, target: "https://only.example/",
    }).expect(201);

    // Choosing a site is a narrowing, so the other site is not in scope for
    // this run even though the same client owns it.
    expect(sent[0].scope).toEqual(["only.example"]);
  });

  it("refuses to scan for a client with no site on record", async () => {
    sent = [];
    const client = await agent.post("/api/clients")
      .send({ name: "Bare", company: "Bare Ltd", email: "b@example.test" });

    const started = await agent.post("/api/scans")
      .send({ clientId: client.body.id, target: "https://anything.example/" });

    // Nothing on record authorises any host, and scanning on the strength of
    // the target somebody just typed is the unfalsifiable check one layer up.
    expect(started.status).toBe(400);
    expect(started.body.error).toContain("no site is recorded");
    expect(sent).toEqual([]);
  });

  it("reads a host out of a site recorded without a scheme", async () => {
    sent = [];
    const client = await agent.post("/api/clients")
      .send({ name: "Bare URL", company: "Bare Ltd", email: "bu@example.test" });
    await agent.post("/api/sites")
      .send({ clientId: client.body.id, name: "Typed", url: "shop.example.test" });

    await agent.post("/api/scans")
      .send({ clientId: client.body.id, target: "https://shop.example.test/" })
      .expect(201);

    expect(sent[0].scope).toEqual(["shop.example.test"]);
  });
});
