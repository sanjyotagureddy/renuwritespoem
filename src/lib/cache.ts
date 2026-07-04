import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const isRedisConfigured = Boolean(url && token);
const redis = isRedisConfigured ? new Redis({ url: url!, token: token! }) : null;

type MemoryCacheEntry = {
  value: string;
  expiresAt: number;
};

const memoryCache = new Map<string, MemoryCacheEntry>();

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

export async function getCache<T>(key: string): Promise<T | null> {
  if (redis) {
    try {
      const val = await redis.get<T>(key);
      return val;
    } catch (err) {
      if (isDynamicServerError(err)) {
        throw err;
      }
      console.warn("Upstash Redis getCache failed, falling back to memory:", err);
    }
  }

  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  try {
    return JSON.parse(entry.value) as T;
  } catch {
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600
): Promise<void> {
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
      return;
    } catch (err) {
      if (isDynamicServerError(err)) {
        throw err;
      }
      console.warn("Upstash Redis setCache failed, falling back to memory:", err);
    }
  }

  const expiresAt = Date.now() + ttlSeconds * 1000;
  memoryCache.set(key, {
    value: JSON.stringify(value),
    expiresAt,
  });
}

export async function invalidateCache(keys: string[] | string): Promise<void> {
  const keysArray = Array.isArray(keys) ? keys : [keys];
  if (keysArray.length === 0) return;

  if (redis) {
    try {
      await redis.del(...keysArray);
      return;
    } catch (err) {
      if (isDynamicServerError(err)) {
        throw err;
      }
      console.warn("Upstash Redis invalidateCache failed, falling back to memory:", err);
    }
  }

  for (const k of keysArray) {
    memoryCache.delete(k);
  }
}
