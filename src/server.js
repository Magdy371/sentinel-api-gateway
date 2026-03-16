import app from "./app.js";
import { redisClient } from "./config/redis.js";
import "./config/env.js";
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await redisClient.connect();
    app.listen(PORT, (err) => {
      if (err) {
        console.error("Error starting server:", err);
        return;
      }
      console.log(`Sentinel API Gateway listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}
startServer();
