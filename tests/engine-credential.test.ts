import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { Express } from "express";
import type { Server } from "http";
import type { AddressInfo } from "net";

import { makeApp, signIn } from "./helpers";

/**
 * "Connected" has to mean the engine will take our key.
 *
 * The engine's /health carries no credential -- it answers "ok" to anybody who
 * can open a socket to it. So an address with a revoked key, a key from
 * another deployment, or no key at all reported reachable, the Settings screen
 * had nothing to say about it, and the penetration-testing screen lit its
 * Start button. The operator found out at dispatch, when the scan came back
 * 401, having been told twice that the engine was connected.
 *
 * These drive a stub that speaks the two routes the check uses, in process on
 * loopback, so they run everywhere rather than being skipped without an
 * engine. A skipped test proves nothing about the code that talks to the
 * thing it skipped.
 */

/** An engine that answers /health to anyone and gates the operator route. */
async function stubEngine(
  probe: (key: string | undefined) => { status: number; body: unknown },
): Promise<{ server: Server; url: string; asked: string[] }> {
  const http = await import("http");
  const asked: string[] = [];
  const server = http.createServer((req, res) => {
    asked.push(req.url ?? "");
    const send = (status: number, body: unknown) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(body));
    };
    if (req.url === "/health") {
      // Deliberately unauthenticated, exactly as the engine's is.
      return send(200, { status: "ok", engine_mode: "full" });
    }
    const key = req.headers["x-api-key"];
    const answer = probe(typeof key === "string" ? key : undefined);
    return send(answer.status, answer.body);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  return { server, url: `http://127.0.0.1:${port}`, asked };
}

async function appAgainst(
  url: string,
  key: string | undefined,
): Promise<{ app: Express; agent: Awaited<ReturnType<typeof signIn>> }> {
  // Its own module registry, so the settings cache from a previous case does
  // not decide this one's answer.
  vi.resetModules();
  process.env.ATHENA_ENGINE_URL = url;
  if (key === undefined) delete process.env.ATHENA_ENGINE_KEY;
  else process.env.ATHENA_ENGINE_KEY = key;
  const app = await makeApp();
  return { app, agent: await signIn(app) };
}

describe("what \"connected\" means", () => {
  const servers: Server[] = [];

  afterAll(async () => {
    delete process.env.ATHENA_ENGINE_URL;
    delete process.env.ATHENA_ENGINE_KEY;
    for (const server of servers) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("does not call an engine that answers /health connected when no key is set", async () => {
    const stub = await stubEngine(() => ({ status: 401, body: { detail: "no key" } }));
    servers.push(stub.server);
    const { agent } = await appAgainst(stub.url, undefined);

    const status = (await agent.get("/api/engine/status")).body;
    expect(status.reachable).toBe(true);
    expect(status.authorized).toBe(false);
    // The sentence has to say what to do, not that something is wrong.
    expect(status.detail).toContain("no operator key is set");

    // And it did not spend a request finding out what it already knew.
    expect(stub.asked).toEqual(["/health"]);
  });

  it("reports a key the engine refuses, quoting the engine", async () => {
    const stub = await stubEngine((key) =>
      key === "ce_op_right"
        ? { status: 200, body: { active: [] } }
        : { status: 401, body: { detail: "unknown api key" } },
    );
    servers.push(stub.server);
    const { agent } = await appAgainst(stub.url, "ce_op_wrong");

    const status = (await agent.get("/api/engine/status")).body;
    expect(status.configured).toBe(true);
    expect(status.reachable).toBe(true);
    expect(status.authorized).toBe(false);
    expect(status.detail).toContain("rejected the operator key");
    expect(status.detail).toContain("unknown api key");
    expect(stub.asked).toContain("/api/scans/active");
  });

  it("reports authorized only when the engine took the key", async () => {
    const stub = await stubEngine((key) =>
      key === "ce_op_right"
        ? { status: 200, body: { active: [] } }
        : { status: 401, body: { detail: "unknown api key" } },
    );
    servers.push(stub.server);
    const { agent } = await appAgainst(stub.url, "ce_op_right");

    const status = (await agent.get("/api/engine/status")).body;
    expect(status.reachable).toBe(true);
    expect(status.authorized).toBe(true);
    expect(status.health).toMatchObject({ status: "ok", engine_mode: "full" });
  });

  it("says it could not tell, rather than guessing, against an engine without the route", async () => {
    // An engine older than the route this asks on. Answering "bad key" here
    // would send an operator to re-issue a credential that was fine.
    const stub = await stubEngine(() => ({ status: 404, body: { detail: "Not Found" } }));
    servers.push(stub.server);
    const { agent } = await appAgainst(stub.url, "ce_op_whatever");

    const status = (await agent.get("/api/engine/status")).body;
    expect(status.reachable).toBe(true);
    expect(status.authorized).toBeNull();
    expect(status.detail).toContain("could not be checked");
  });

  it("does not claim a key is bad when the engine stops answering mid-check", async () => {
    // /health answered, then the engine went away. That is a fact about the
    // engine, not a verdict about the credential.
    const stub = await stubEngine(() => ({ status: 200, body: { active: [] } }));
    const asked: string[] = stub.asked;
    stub.server.close();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const { agent } = await appAgainst(stub.url, "ce_op_something");

    const status = (await agent.get("/api/engine/status")).body;
    // Nothing answered at all, so this is unreachable rather than unauthorized.
    expect(status.reachable).toBe(false);
    expect(asked).toEqual([]);
  });
});
