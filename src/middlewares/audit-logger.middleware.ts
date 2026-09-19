import type { Request, Response, NextFunction } from "express";
import { auditQueue } from "../services/audit-log.service";
import { resolveTarget } from "../config/routes.config.js";
import type { AuditEntry } from "../services/audit-log.service.js";
//bunx prettier --write .
export function auditLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startTime = Date.now();
  res.on("finish", () => {
    const route = resolveTarget(req.path);
    auditQueue.enqueue({
      ip: req.ip,
      method: req.method,
      path: req.path,
      target: route?.target ?? "unresolved",
      status: res.statusCode,
      durationMs: Date.now() - startTime,
      clientId: req.clientId,
      timestamp: new Date().toISOString(),
    } as AuditEntry);
  });
}
