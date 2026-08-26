import type { Request, Response, NextFunction } from 'express';
import { validApiKey } from '../config/env.config'

/**
 * Validates the x-api-key header against the known-clients map and attaches
 * the resolved clientId to the request for downstream middleware (rate
 * limiting keys on it, audit logging records it).
 */

export function authGuardMiddleware(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || typeof apiKey !== "string") {
        res.status(401).json({
            error: "Unauthorized",
            message: "Missing x-api key headers"
        });
        return;
    }
    const clientId = validApiKey.get(apiKey);
    if (!clientId) {
        res.status(401).json({ error: "Unauthorized", message: "Invalid API key" });
        return;
    }
    req.clientId = clientId;
    next();
}