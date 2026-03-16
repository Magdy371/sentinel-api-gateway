import { redisClient } from '../config/redis.js';

export const rateLimiter = async (req, res, next) => {
  // Identify the user by their API key, falling back to their IP address
  const identifier = req.headers['x-api-key'] || req.ip;
  const redisKey = `rate_limit:${identifier}`;

  const LIMIT = 10; // Max requests allowed
  const WINDOW_IN_SECONDS = 60; // Timeframe

  try {
    // INCR creates the key if it doesn't exist, and increments it by 1
    const requestCount = await redisClient.incr(redisKey);

    // If this is the first request, set the expiration timer for the window
    if (requestCount === 1) {
      await redisClient.expire(redisKey, WINDOW_IN_SECONDS);
    }

    if (requestCount > LIMIT) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'You have exceeded your rate limit. Please try again in a minute.'
      });
    }

    // Attach the current count to the response headers (Good API practice)
    res.setHeader('X-RateLimit-Limit', LIMIT);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, LIMIT - requestCount));

    next();
  } catch (error) {
    console.error('🔴 Redis Rate Limiter Error:', error);
    // "Fail open" - If Redis crashes, let the request through so the API doesn't go down entirely
    next();
  }
};