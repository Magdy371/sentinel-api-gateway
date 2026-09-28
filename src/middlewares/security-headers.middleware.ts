import type { Request, Response, NextFunction } from "express";

/**
 * Hand-rolled security headers rather than pulling in helmet, so the
 * gateway's baseline hardening is visible and easy to reason about.
 * Swap for `helmet()` in a real deployment if you want the wider,
 * actively-maintained header set.
 */
export function securityHeadersMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains",
  );
  res.removeHeader("X-Powered-By");
  next();
}
