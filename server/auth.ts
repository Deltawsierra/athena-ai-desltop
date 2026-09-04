import type { Request, RequestHandler } from "express";
import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    username?: string;
    role?: string;
  }
}

/** Rejects the request with 401 unless a logged-in session is present. */
export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.session?.userId) {
    next();
    return;
  }
  res.status(401).json({ message: "Authentication required" });
};

/** Rejects with 401 when anonymous and 403 when the session is not an admin. */
export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.session?.userId) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  if (req.session.role !== "admin") {
    res.status(403).json({ message: "Admin role required" });
    return;
  }
  next();
};

/** Who is acting, for activity-log attribution. */
export function actor(req: Request): { userId: string | null; ipAddress: string | null } {
  return {
    userId: req.session?.userId ?? null,
    ipAddress: req.ip ?? null,
  };
}

type AsyncHandler = (req: Request, res: import("express").Response, next: import("express").NextFunction) => Promise<unknown>;

/**
 * Express 4 does not forward rejected promises to the error handler; an
 * unhandled rejection in a route would crash the process. Wrap every async
 * handler so failures reach the central error middleware instead.
 */
export function asyncHandler(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
