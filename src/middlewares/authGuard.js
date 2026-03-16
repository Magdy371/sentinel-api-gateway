//in express Gurad is a middleware that checks if the user is authenticated before allowing access to certain routes.
//  It can be used to protect routes that require authentication.
import { db } from "../db/index.js";
import { apiKeys } from "../db/schema.js";
import { eq } from "drizzle-orm";

//Function Expression
export const authGuard = async (req, res, next) => {
    try {
        const providedKey = req.headers['x-api-key'];
        if (!providedKey) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Missing x-api-key header'
            });
        }
        // Query Postgres via Drizzle to see if the key exists
        const [keyRecord] = await db
            .select()
            .from(apiKeys)
            .where(eq(apiKeys.key, providedKey));

        if (!keyRecord) {
            return res.status(404).json({
                error: 'not found',
                message: 'Invalid API Key'
            });
        }
        req.clientInfo = {
            id: keyRecord.id,
            name: keyRecord.clientName,
            role: keyRecord.role
        };
        next();
    } catch (error) {
        console.error('🔴 Auth Guard Error:', error);
        res.status(500).json({ error: 'Internal Server Error during authentication' });
    }
}