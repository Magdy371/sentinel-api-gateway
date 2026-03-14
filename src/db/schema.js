import { pgTable, serial, varchar, timestamp, text } from "drizzle-orm/pg-core";
// Table to store valid API keys and who they belong to
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Table to store our permanent audit logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  apiKeyId: serial("api_key_id").references(() => apiKeys.id),
  targetUrl: text("target_url").notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  statusCode: serial("status_code"),
  ipAddress: varchar("ip_address", { length: 45 }),
  timestamp: timestamp("timestamp").defaultNow(),
});
