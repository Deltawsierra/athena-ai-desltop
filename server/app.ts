import express, { type Express, type ErrorRequestHandler } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { ZodError } from "zod";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { registerRoutes } from "./routes";

const SESSION_COOKIE = "athena.sid";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Session secret, in priority order:
 *   1. SESSION_SECRET env var
 *   2. a per-install secret persisted under ATHENA_USER_DATA (Electron)
 *   3. a random per-process secret in development
 * Production without any of the above is a configuration error.
 */
const MIN_SECRET_LENGTH = 32;

export function resolveSessionSecret(): string {
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv) {
    // The persisted-file path already enforced a length; the environment
    // variable was taken at any length, so SESSION_SECRET=x was accepted in
    // production.
    if (fromEnv.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters (got ${fromEnv.length})`,
      );
    }
    return fromEnv;
  }

  const userData = process.env.ATHENA_USER_DATA;
  if (userData) {
    const file = path.join(userData, "session-secret");
    try {
      const existing = fs.readFileSync(file, "utf8").trim();
      if (existing.length >= MIN_SECRET_LENGTH) return existing;
    } catch {
      // fall through and create one
    }
    const secret = crypto.randomBytes(32).toString("hex");
    fs.mkdirSync(userData, { recursive: true });
    fs.writeFileSync(file, secret, { mode: 0o600 });
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return crypto.randomBytes(32).toString("hex");
}

export function createApp(): Express {
  const app = express();
  const MemoryStore = createMemoryStore(session);

  app.disable("x-powered-by");

  app.use(
    session({
      name: SESSION_COOKIE,
      secret: resolveSessionSecret(),
      store: new MemoryStore({ checkPeriod: 24 * 60 * 60 * 1000 }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        // The renderer is served by this server, so requests are same-site and
        // a Lax cookie is attached to them.
        sameSite: "lax",
        secure: process.env.COOKIE_SECURE === "true",
        maxAge: SEVEN_DAYS_MS,
      },
    }),
  );

  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false }));

  // Request log for API calls: method, path, status, duration. No bodies.
  app.use((req, res, next) => {
    if (!req.path.startsWith("/api")) return next();
    const start = Date.now();
    res.on("finish", () => {
      console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
    });
    next();
  });

  registerRoutes(app);
  return app;
}

/**
 * Central error handler. Validation errors are 400 with field detail; anything
 * else is logged server-side and returned as a generic 500 so driver messages
 * never leak to clients.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return;
  }

  if (err && typeof err === "object" && "type" in err && (err as { type?: string }).type === "entity.too.large") {
    res.status(413).json({ message: "Request body too large" });
    return;
  }

  // The body parser's own message was echoed verbatim, which is the one place
  // an internal error string reached a client.
  if (err && typeof err === "object" && "type" in err && (err as { type?: string }).type === "entity.parse.failed") {
    res.status(400).json({ message: "Malformed JSON body" });
    return;
  }

  if (err && typeof err === "object" && "code" in err && String((err as { code?: string }).code).startsWith("SQLITE_CONSTRAINT")) {
    res.status(409).json({ message: "Conflicts with an existing record" });
    return;
  }

  const status = typeof (err as { status?: unknown })?.status === "number" ? (err as { status: number }).status : 500;
  if (status >= 500) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
  res.status(status).json({ message: (err as Error).message || "Request failed" });
};
