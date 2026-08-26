import Redis from "ioredis";
import { env } from "../config/env.config"

export const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 100, 3000),
})
redis.on("connect",()=>{
    console.log("[Redis] Connected");
})

redis.on("error", (err) => console.error("[Redis] Connection error:", err.message));