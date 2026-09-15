import type { Request, Response, NextFunction } from "express";
import { checkRateLimit } from "../services/rate-limit.service";
/**
 * Keys the limit on the authenticated clientId when available (set by
 * authGuardMiddleware, which must run first), falling back to req.ip for
 * any route that isn't key-gated. Redis failures fail OPEN -- an outage in
 * the rate-limit store degrades to "unlimited" rather than taking the
 * whole gateway down. Flip this to fail-closed (return 503) if abuse
 * protection matters more than availability for your use case.
 */
export async function rateLimiterMiddleWare(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const identifier = req.clientId ?? req.ip ?? "unknown";
  try {
    const { allowed, remaining, limit, resetAt } =
      await checkRateLimit(identifier);
    res.setHeader("X-RateLimit-Limit", String(limit));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", new Date(resetAt).toISOString());
    if (!allowed) {
      //Return too many requests
      res.status(429).json({
        error: "too many requests",
        message: "Rate limit exceeded. Please try again later.",
      });
      return;
    }
    next();
  } catch (error) {
    console.error("[RateLimiter] Redis error, failing open:", error);
    next();
  }
}
