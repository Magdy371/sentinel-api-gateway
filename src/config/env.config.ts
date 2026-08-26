import "dotenv/config";
import { z } from "zod";

/**
 * Every env var is parsed through a Zod schema once at boot,
 * so a missing or malformed value fails immediately on startup instead of 
 * surfacing as a confusing runtime error three requests later.
*/
const envSchema = z.object({
    PORT: z.string().default("8080"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    REDIS_URL: z.string().default("redis://localhost:6379"),
    API_KEYS: z.string().default(""),
    RATE_LIMIT_WINDOW_MS: z.string().default("60000"),
    RATE_LIMIT_MAX_REQUESTS: z.string().default("100"),
    MAX_PAYLOAD_SIZE: z.string().default("1mb"),
})

const parsed = envSchema.parse(process.env);

export const env = {
    PORT: Number(parsed.PORT),
    NODE_ENV: parsed.NODE_ENV,
    REDIS_URL: parsed.REDIS_URL,
    RATE_LIMIT_WINDOW_MS: Number(parsed.RATE_LIMIT_WINDOW_MS),
    RATE_LIMIT_MAX_REQUESTS: Number(parsed.RATE_LIMIT_MAX_REQUESTS),
    MAX_PAYLOAD_SIZE: parsed.MAX_PAYLOAD_SIZE,
    IS_PROD: parsed.NODE_ENV === "production",
}

export const validApiKey = new Map<string, string>(
    parsed.API_KEYS.split(",").filter(Boolean).map((pair) => {
        const [key, client] = pair.split(":");
        return [key ?? "", client || "unknown"] as [string, string];
    })
        .filter(([key]) => key.length > 0)
);

