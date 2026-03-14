//express used for creating server
import express from "express";
//heltmet is a security middleware for express
import helmet from "helmet";

const app = express();

// Security middleware to set HTTP response headers
app.use(helmet());

// Parse incoming JSON requests
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Sentinel Gateway is active" });
});

export default app;
