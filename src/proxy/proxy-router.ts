import type { Request, Response, NextFunction } from "express";
import { resolveTarget } from "../config/routes.config.js";

// Headers that are specific to a single hop and must not be blindly
// forwarded to (or copied back from) the upstream service.

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

/**
 * Resolves the target service from the route table, forwards the request
 * with `fetch`, and streams the response status/headers/body back to the
 * client. Built on the platform fetch API (Bun/Node 18+ both ship it)
 * instead of a proxy library, to keep the actual forwarding mechanics --
 * header filtering, method/body passthrough -- visible rather than hidden
 * behind a dependency.
 */

export async function proxyRouteMiddleWare(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const route = resolveTarget(req.path);
  if (!route) {
    res
      .status(404)
      .json({ error: "Not found", message: "No service registered" });
    return;
  }
  const targetUrl = new URL(req.originalUrl, route.target);
  const forwardHeaders = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || HOP_BY_HOP_HEADERS.has(key.toLowerCase()))
      continue;
    forwardHeaders.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  forwardHeaders.set("x-forwarded-for", req.ip ?? "unknown");
  forwardHeaders.set("x-forwarded-host", req.headers.host ?? "");
  forwardHeaders.set("x-gateway", "sentinel");
  const hasBody =
    !["GET", "HEAD"].includes(req.method) &&
    req.body &&
    Object.keys(req.body).length > 0;
  if (hasBody) {
    forwardHeaders.set("content-type", "application/json");
  }
  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    res.status(upstreamResponse.status);
    upstreamResponse.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const responseBody = await upstreamResponse.text();
    res.send(responseBody);
  } catch (err) {
    next(err);
  }
}
