import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getUnsubscribeToken, verifyUnsubscribeToken } from "../src/lib/email/unsubscribe-helper";

describe("unsubscribe-helper", () => {
  const originalEnv = process.env.NEXTAUTH_SECRET;

  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-secret-key-12345678901234567890";
  });

  afterEach(() => {
    process.env.NEXTAUTH_SECRET = originalEnv;
  });

  it("should generate a consistent unsubscribe token", () => {
    const email = "test@example.com";
    const token1 = getUnsubscribeToken(email);
    const token2 = getUnsubscribeToken(email);
    expect(token1).toBe(token2);
    expect(token1).toHaveLength(16);
  });

  it("should fail if secret is not set", () => {
    delete process.env.NEXTAUTH_SECRET;
    expect(() => getUnsubscribeToken("test@example.com")).toThrow();
  });

  it("should verify a valid token", () => {
    const email = "test@example.com";
    const token = getUnsubscribeToken(email);
    expect(verifyUnsubscribeToken(email, token)).toBe(true);
  });

  it("should not verify an invalid token", () => {
    const email = "test@example.com";
    expect(verifyUnsubscribeToken(email, "invalid-token")).toBe(false);
    expect(verifyUnsubscribeToken("other@example.com", getUnsubscribeToken(email))).toBe(false);
  });
});
