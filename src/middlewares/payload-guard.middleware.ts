import type { Request, Response, NextFunction } from 'express';
const METHOD_WITH_BODY  = new Set(["POST","PATCH","PUT"]);

/**
 * Gateway-level payload sanity checks. Sentinel doesn't know each
 * downstream service's business schema (that validation belongs in the
 * microservice itself) -- its job is the generic stuff: reject bodies on
 * methods that shouldn't have one's missing/wrong content-type, and rely
 * on express.json()'s built-in size limit + parse-error handling upstream
 * of this middleware for the rest.
 */

export function payloadGuardMiddleware(req:Request, res:Response, next:NextFunction): void{
    if(!METHOD_WITH_BODY.has(req.method)){
        next();
        return;
    }
    const contentType = req.headers["content-type"]
    const hasBody = req.headers["content-length"] && req.headers["content-length"] !== "0";
    if(hasBody && (!contentType || !contentType.includes("application/json"))){
        res.status(415).json({
            error:"Unsupported Media Type",
            message:"Sentinel only forwards JSON payloads. Set Content-Type: application/json."
        });
        return ;
    }
    next();
}