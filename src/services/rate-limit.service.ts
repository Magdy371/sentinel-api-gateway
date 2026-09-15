import { redis } from "../lib/redis.client";
import { env } from "../config/env.config";
import type { EnumValues } from "zod/v3";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
}
/**
 * Sliding-window-log rate limiter backed by a Redis sorted set.
 *
 * Each request is recorded as a member scored by its own timestamp. On every
 * check we trim members older than the window, then count what's left.
 * This avoids the "burst at the window boundary" problem a fixed window
 * counter has (e.g. 100 requests at 0:59 + 100 more at 1:01 both passing
 * because they land in different fixed buckets) at the cost of an
 * O(log N) sorted-set write per request instead of a single INCR.
 */

export async function checkRateLimit(
  identifier: string,
  windowMs: number = env.RATE_LIMIT_WINDOW_MS,
  maxRequest: number = env.RATE_LIMIT_MAX_REQUESTS,
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`; //Redis key will be used for search
  const now = Date.now();
  const windowStart = now - windowMs;
  const pipeline = redis.pipeline();
  //Discard old request
  pipeline.zremrangebyscore(key, 0, windowStart); //evict entries outside the window
  //record the new request
  pipeline.zadd(key, now, `${now}-${Math.random().toString(36).slice(2)}`);
  //count recent rquest
  pipeline.zcard(key); //count requests still in the window
  //Clean up key later
  pipeline.expire(key, windowMs);
  const results = await pipeline.exec();
  if (!results) {
    throw new Error("Redis pipeline return no result");
  }
  const zcardResult = results[2];
  if (!zcardResult || zcardResult[0]) {
    throw zcardResult?.[0] ?? new Error("Redis pipeline zcard step failed");
  }
  const count = zcardResult[1] as number;
  return {
    allowed: count <= maxRequest,
    remaining: Math.max(0, maxRequest - count),
    limit: maxRequest,
    resetAt: now + windowMs,
  };
}
