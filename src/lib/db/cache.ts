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

function getPrefixedKey(key: string): string {
  const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
  return `${env}:${key}`;
}

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
  const prefixedKey = getPrefixedKey(key);
  if (redis) {
    try {
      const val = await redis.get<T>(prefixedKey);
      return val;
    } catch (err) {
      if (isDynamicServerError(err)) {
        throw err;
      }
      console.warn("Upstash Redis getCache failed, falling back to memory:", err);
    }
  }

  const entry = memoryCache.get(prefixedKey);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(prefixedKey);
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
  const prefixedKey = getPrefixedKey(key);
  if (redis) {
    try {
      await redis.set(prefixedKey, value, { ex: ttlSeconds });
      return;
    } catch (err) {
      if (isDynamicServerError(err)) {
        throw err;
      }
      console.warn("Upstash Redis setCache failed, falling back to memory:", err);
    }
  }

  const expiresAt = Date.now() + ttlSeconds * 1000;
  memoryCache.set(prefixedKey, {
    value: JSON.stringify(value),
    expiresAt,
  });
}

export async function invalidateCache(keys: string[] | string): Promise<void> {
  const keysArray = Array.isArray(keys) ? keys : [keys];
  if (keysArray.length === 0) return;
  const prefixedKeys = keysArray.map(getPrefixedKey);

  if (redis) {
    try {
      await redis.del(...prefixedKeys);
      return;
    } catch (err) {
      if (isDynamicServerError(err)) {
        throw err;
      }
      console.warn("Upstash Redis invalidateCache failed, falling back to memory:", err);
    }
  }

  for (const k of prefixedKeys) {
    memoryCache.delete(k);
  }
}
