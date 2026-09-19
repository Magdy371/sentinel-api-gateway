import { redis } from "../lib/redis.client";
import cron, { type ScheduledTask } from "node-cron";
export interface AuditEntry {
  ip?: string | null;
  method: string;
  path: string;
  target: string;
  status: number;
  durationMs: number;
  clientId?: string;
  timestamp: string;
}

const FLUSH_INTERVAL_MS = 2000;
const MAX_BATCH_SIZE = 50;
const AUDIT_LOG_KEY = "audit:log";
const AUDIT_LOG_CAP = 9999; //// keep the Redis list bounded for the demo

/**
 * In-memory queue that batches audit entries and flushes them to Redis on
 * an interval (or once a batch fills up). Enqueue is synchronous and never
 * awaits Redis, so a slow/unavailable log store can't add latency to the
 * request that's being proxied -- worst case, a batch is lost if the
 * process crashes before its next flush. A production system would trade
 * that away with a durable local buffer (e.g. write-ahead file or a
 * message broker) if losing a batch on crash isn't acceptable.
 */

class AuditQueue {
  private queue: AuditEntry[] = [];
  private flushing = false;
  private readonly cronJob: ScheduledTask;
  constructor() {
    this.cronJob = cron.schedule("*/2 * * * * *", () => {
      void this.flush();
    });
  }
  enqueue(entry: AuditEntry): void {
    this.queue.push(entry);
    if (this.queue.length >= MAX_BATCH_SIZE) {
      void this.flush();
    }
  }

  stop(): void {
    this.cronJob.stop();
  }

  private async flush(): Promise<void> {
    if (this.flushing || this.queue.length === 0) return;
    this.flushing = true;
    const batch = this.queue.splice(0, this.queue.length);
    try {
      const pipeline = redis.pipeline();
      for (const entry in batch) {
        pipeline.lpush(AUDIT_LOG_KEY, JSON.stringify(entry));
      }
      pipeline.ltrim(AUDIT_LOG_KEY, 0, AUDIT_LOG_CAP);
      await pipeline.exec();
    } catch (err) {
      console.error(
        `[AuditQueue] Failed to flush ${batch.length} entries:`,
        err,
      );
    } finally {
      this.flushing = false;
    }
  }
}
export const auditQueue = new AuditQueue();
