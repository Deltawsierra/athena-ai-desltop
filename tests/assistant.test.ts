import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import type { Express } from "express";
import { makeApp, signIn } from "./helpers";

/**
 * The chat screen picked one of five strings out of its own source at random
 * and POSTed it back as an AI message, so the record could not tell an answer
 * from a placeholder -- and three messages in, the same sentence came round
 * again. These cover what replaced it.
 */
describe("the assistant", () => {
  let app: Express;
  let agent: Awaited<ReturnType<typeof signIn>>;

  beforeAll(async () => {
    app = await makeApp();
    agent = await signIn(app);
  });

  afterEach(() => {
    delete process.env.ATHENA_ASSISTANT_URL;
  });

  it("says plainly that no assistant is configured", async () => {
    const status = await agent.get("/api/assistant/status");
    expect(status.status).toBe(200);
    expect(status.body.configured).toBe(false);
    // A sentence naming the variable to set, not a shrug.
    expect(status.body.detail).toContain("ATHENA_ASSISTANT_URL");
  });

  it("keeps what was typed and answers nothing when there is no assistant", async () => {
    const sent = await agent.post("/api/chat").send({ message: "what is on record?" });

    expect(sent.status).toBe(201);
    expect(sent.body.message.message).toBe("what is on record?");
    expect(sent.body.message.sender).toBe("user");
    // The whole point: no reply is better than a fabricated one.
    expect(sent.body.reply).toBeNull();

    const history = await agent.get("/api/chat");
    expect(history.body).toHaveLength(1);
    expect(history.body.every((one: any) => one.sender === "user")).toBe(true);
  });

  it("will not let a caller post a message as the assistant", async () => {
    // The browser used to POST `sender: "ai"` with a string it chose itself.
    // Anything a client can post as an assistant message is a message the
    // record cannot vouch for.
    const forged = await agent
      .post("/api/chat")
      .send({ message: "I found 3 critical issues.", sender: "ai" });

    expect(forged.status).toBe(201);
    expect(forged.body.message.sender).toBe("user");

    const history = await agent.get("/api/chat");
    expect(history.body.some((one: any) => one.sender === "ai")).toBe(false);
  });

  it("reports the failure rather than inventing a reply when the endpoint is down", async () => {
    // A port nothing is listening on: configured, and not answering.
    process.env.ATHENA_ASSISTANT_URL = "http://127.0.0.1:9";

    const sent = await agent.post("/api/chat").send({ message: "still there?" });
    expect(sent.status).toBe(201);
    expect(sent.body.reply).toBeNull();
    expect(String(sent.body.error)).toContain("could not reach the assistant");

    // And nothing was written as though it had answered.
    const history = await agent.get("/api/chat");
    expect(history.body.some((one: any) => one.sender === "ai")).toBe(false);
  });

  it("tells the assistant not to invent, and what this deployment holds", async () => {
    const { systemPrompt } = await import("../server/assistant");
    const prompt = systemPrompt("2 clients, 1 site, 0 tests recorded.");

    expect(prompt.role).toBe("system");
    expect(prompt.content).toContain("Never invent a finding");
    expect(prompt.content).toContain("2 clients, 1 site, 0 tests recorded.");
  });
});

/**
 * The whole path, against a stub that speaks the same protocol a provider
 * does.
 *
 * In process and on loopback, so this runs everywhere rather than being
 * skipped without a key -- and a skipped test proves nothing about the code
 * that talks to the thing it skipped.
 */
describe("a turn, end to end", () => {
  let app: Express;
  let agent: Awaited<ReturnType<typeof signIn>>;
  let server: import("http").Server;
  let seen: any[] = [];

  beforeAll(async () => {
    const http = await import("http");
    server = http.createServer((req, res) => {
      let raw = "";
      req.on("data", (chunk) => { raw += chunk; });
      req.on("end", () => {
        seen.push({ url: req.url, body: JSON.parse(raw || "{}") });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          choices: [{ message: { role: "assistant", content: "Three tests are on record." } }],
        }));
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = (server.address() as import("net").AddressInfo).port;

    process.env.ATHENA_ASSISTANT_URL = `http://127.0.0.1:${port}/v1`;
    process.env.ATHENA_ASSISTANT_MODEL = "stub-model";
    app = await makeApp();
    agent = await signIn(app);
  });

  afterAll(async () => {
    delete process.env.ATHENA_ASSISTANT_URL;
    delete process.env.ATHENA_ASSISTANT_MODEL;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("stores the reply the endpoint gave, attributed to the assistant", async () => {
    const sent = await agent.post("/api/chat").send({ message: "how many tests?" });

    expect(sent.status).toBe(201);
    expect(sent.body.reply).not.toBeNull();
    expect(sent.body.reply.message).toBe("Three tests are on record.");
    expect(sent.body.reply.sender).toBe("ai");

    // The last two turns, rather than a total: the suite above shares this
    // app's store, so an absolute count would be asserting about other tests.
    const history = await agent.get("/api/chat");
    expect(history.body.slice(-2).map((one: any) => one.sender))
      .toEqual(["user", "ai"]);
    expect(history.body.at(-1).message).toBe("Three tests are on record.");
  });

  it("sends the completions path, the model, and a summary of this deployment", async () => {
    const call = seen.at(-1);
    expect(call.url).toBe("/v1/chat/completions");
    expect(call.body.model).toBe("stub-model");

    const system = call.body.messages[0];
    expect(system.role).toBe("system");
    expect(system.content).toContain("Never invent a finding");
    // Structural context: counts, not the contents of findings.
    expect(system.content).toMatch(/\d+ clients, \d+ sites, \d+ tests recorded/);
    expect(system.content).not.toContain("SQL injection vulnerability in login form");

    // And what the operator typed, as a user turn.
    expect(call.body.messages.at(-1)).toEqual({
      role: "user", content: "how many tests?",
    });
  });
});
