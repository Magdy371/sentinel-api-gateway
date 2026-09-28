import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.config.js";

/**
 * Express recognizes this as an error handler purely by arity (4 params),
 * so the unused ones still have to be declared. Must be registered last,
 * after every route/middleware. Express 5 auto-forwards rejected promises
 * from async middleware here, so proxyRouterMiddleware's fetch() failures
 * land in this one place instead of needing a try/catch at every call site.
 */

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(
    `[Sentinel] Unhandled error on ${req.method} ${req.path}:`,
    err,
  );
  if (res.headersSent) {
    return;
  }
  res.status(502).json({
    error: "Bad Gateway",
    message: env.IS_PROD
      ? "The upstream service failed to respond."
      : err.message,
  });
}
