import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";

// Mock next/headers
vi.mock("next/headers", () => {
  return {
    headers: vi.fn().mockResolvedValue({
      get: vi.fn().mockReturnValue("192.168.1.1"),
    }),
  };
});

let throwRedisError = false;

// Mock @upstash/redis
vi.mock("@upstash/redis", () => {
  return {
    Redis: vi.fn().mockImplementation(function (this: any) {
      this.pipeline = vi.fn().mockImplementation(() => ({
        zremrangebyscore: vi.fn(),
        zadd: vi.fn(),
        zcard: vi.fn(),
        expire: vi.fn(),
        exec: vi.fn().mockImplementation(() => {
          if (throwRedisError) {
            return Promise.reject(new Error("Redis connection error"));
          }
          return Promise.resolve([null, null, 2]); // Return currentCount = 2
        }),
      }));
      return this;
    }),
  };
});

describe("rate limiter utility", () => {
  let rateLimit: any;

  beforeAll(async () => {
    // Set env vars BEFORE importing rateLimit dynamically to bypass hoisting
    process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token";
    
    const mod = await import("../../../src/lib/moderation/rate-limit");
    rateLimit = mod.rateLimit;
  });

  beforeEach(() => {
    throwRedisError = false;
  });

  it("should rate limit with Redis when configured", async () => {
    const res = await rateLimit("redis-test", 5, 60000);
    expect(res.limited).toBe(false);
    expect(res.remaining).toBe(3); // 5 - 2 = 3
  });

  it("should fall back to in-memory rate limiting when Redis fails", async () => {
    throwRedisError = true;
    const res = await rateLimit("redis-test-fallback", 3, 500);
    expect(res.limited).toBe(false);
    expect(res.remaining).toBe(2); // memory limit allows first request
  });
});
