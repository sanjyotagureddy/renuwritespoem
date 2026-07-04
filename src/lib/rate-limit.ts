import { headers } from "next/headers";

type RateLimitRecord = {
  timestamps: number[];
};

const tracker = new Map<string, RateLimitRecord>();
let lastCleanTime = Date.now();

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
  cleanTrackerMap();

  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";
  
  const key = `${prefix}:${ip}`;
  const now = Date.now();
  
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
