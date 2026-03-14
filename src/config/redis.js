// createClient is used to create a Redis client instance.
import { createClient } from "redis";
//used for loading environment variables from a .env file.
import "dotenv/config";

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});
redisClient.on("connect", (err) => {
  if (err) {
    console.error("Redis connection error:", err);
  } else {
    console.log("Connected to Redis");
  }
});
