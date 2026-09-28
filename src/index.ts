import express from "express";
import { env } from "./config/env.config.js";
import { securityHeadersMiddleware } from "./middlewares/security-headers.middleware.js";
import { payloadGuardMiddleware } from "./middlewares/payload-guard.middleware.js";
import { authGuardMiddleware } from "./middlewares/auth-guard.middleware.js";
import { rateLimiterMiddleWare } from "./middlewares/rate-limiter.middleware.js";
import { auditLoggerMiddleware } from "./middlewares/audit-logger.middleware.js";
import { proxyRouteMiddleWare } from "./proxy/proxy-router.js";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware.js";

const app = express();
app.use(express.json({ limit: env.MAX_PAYLOAD_SIZE }));
app.use(securityHeadersMiddleware);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "sentinel" });
});

// Pipeline order matters. Audit logging goes first (right after the health
// check) because it only registers a listener on the response's "finish"
// event -- it doesn't short-circuit anything -- so mounting it first means
// it captures the final status of EVERY request, including ones a later
// middleware rejects (a 401 from authGuard, a 429 from the rate limiter).
// Mounting it later would silently drop exactly the events -- auth
// failures, throttled clients -- a security gateway most needs on record.
// Auth then runs before the rate limiter so throttling can key on
// clientId instead of falling back to a shared IP.

app.use(auditLoggerMiddleware);
app.use(payloadGuardMiddleware);
app.use(authGuardMiddleware);
app.use(rateLimiterMiddleWare);
app.use(proxyRouteMiddleWare);

// Must be registered last -- Express only treats a 4-arg function as an
// error handler, and only errors from middleware registered before it.
app.use(errorHandlerMiddleware);

app.listen(env.PORT, () => {
  console.log(
    `Sentinel gateway listening on port ${env.PORT} [${env.NODE_ENV}]`,
  );
});
