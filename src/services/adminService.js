import crypto from "crypto";
import { db } from "../db/index.js";
import { apiKeys } from "../db/schema.js";
/**
 * Generates a secure API key and saves it to the database.
 * @param {string} clientName - The name of the client.
 * @param {string} role - The role assigned to the key.
 * @returns {Promise<Object>} The inserted database record.
 */
export const createApiKey = async (clientName, role = "user") => {
  // Generate a secure, 48-character hex string prefixed with 'sk_'
  const rawKey = crypto.randomBytes(24).toString("hex");
  const newKey = `sk_${rawKey}`;
  //Insert into postgres via drizzle
  const [insertRecord] = await db
    .insert(apiKeys)
    .values({ key: newKey, clientName, role })
    .returning();
  return insertRecord;
};
export default createApiKey;
