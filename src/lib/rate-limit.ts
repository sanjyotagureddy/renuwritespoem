import { headers } from "next/headers";
import { Redis } from "@upstash/redis";

type RateLimitRecord = {
  timestamps: number[];
};

const tracker = new Map<string, RateLimitRecord>();
let lastCleanTime = Date.now();

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const isRedisConfigured = Boolean(url && token);
const redis = isRedisConfigured ? new Redis({ url: url!, token: token! }) : null;

function isDynamicServerError(err: unknown): boolean {
  if (err instanceof Error) {
    return (
      err.message.includes("Dynamic server usage") ||
      err.name === "DynamicServerError" ||
      ("digest" in err && err.digest === "DYNAMIC_SERVER_USAGE")
    );
  }
  return false;
}

function cleanTrackerMap() {
  const now = Date.now();
  if (now - lastCleanTime < 300000) return; // limit scans to at most once per 5 minutes
  
  lastCleanTime = now;
  for (const [key, record] of tracker.entries()) {
    const latest = record.timestamps[record.timestamps.length - 1];
    if (!latest || now - latest > 3600000) {
      tracker.delete(key);
    }
  }
}

export async function rateLimit(
  prefix: string,
  limit: number,
  windowMs: number
): Promise<{ limited: boolean; remaining: number; resetTime: number }> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";
  
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  // If Upstash Redis is configured, run sliding window rate limiter on Redis
  if (redis) {
    try {
      const minTimestamp = now - windowMs;
      const pipeline = redis.pipeline();
      
      pipeline.zremrangebyscore(key, 0, minTimestamp);
      pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
      pipeline.zcard(key);
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      
      const results = await pipeline.exec();
      const currentCount = results[2] as number;
      
      const resetTime = now + windowMs;
      if (currentCount > limit) {
        return {
          limited: true,
          remaining: 0,
          resetTime,
        };
      }
      
      return {
        limited: false,
        remaining: limit - currentCount,
        resetTime,
      };
    } catch (err) {
      if (isDynamicServerError(err)) {
        throw err;
      }
      console.warn("Upstash Redis rate limit failed, falling back to memory:", err);
    }
  }

  // Memory fallback
  cleanTrackerMap();
  
  let record = tracker.get(key);
  if (!record) {
    record = { timestamps: [] };
    tracker.set(key, record);
  }

  // Filter out timestamps outside of the window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    return {
      limited: true,
      remaining: 0,
      resetTime,
    };
  }

  record.timestamps.push(now);
  return {
    limited: false,
    remaining: limit - record.timestamps.length,
    resetTime: now + windowMs,
  };
}
