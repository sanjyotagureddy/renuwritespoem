import { describe, it, expect, vi, beforeEach } from "vitest";
import { signUpAction, resendVerificationAction, forgotPasswordAction, resetPasswordAction } from "../src/app/actions/auth-actions";

// Mock rateLimit to prevent test failures
vi.mock("@/lib/rate-limit", () => {
  return {
    rateLimit: vi.fn().mockResolvedValue({ limited: false, remaining: 99, resetTime: 0 }),
  };
});

let simulateDbError = false;

// Mock the database client
vi.mock("@/lib/db", () => {
  return {
    getPrisma: () => ({
      user: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (simulateDbError) {
            return Promise.reject(new Error("Database connection lost"));
          }
          if (where.email === "existing@example.com") {
            return Promise.resolve({ id: "existing-id", passwordHash: "hashed-pw" });
          }
          if (where.email === "google@example.com") {
            return Promise.resolve({ id: "google-id", passwordHash: null });
          }
          if (where.email === "unverified@example.com") {
            return Promise.resolve({ id: "unverified-id", name: "Unverified User", emailVerified: null, passwordHash: "hashed-pw" });
          }
          if (where.email === "verified@example.com") {
            return Promise.resolve({ id: "verified-id", name: "Verified User", emailVerified: new Date(), passwordHash: "hashed-pw" });
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(() => {
          if (simulateDbError) return Promise.reject(new Error("Create failed"));
          return Promise.resolve({ id: "new-user-id" });
        }),
        update: vi.fn().mockResolvedValue({ id: "updated-user-id" }),
      },
      emailVerificationToken: {
        create: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn().mockResolvedValue({}),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.token === "valid-verify-token") {
            return Promise.resolve({ id: "token-123", email: "unverified@example.com", expires: new Date(Date.now() + 100000) });
          }
          return Promise.resolve(null);
        }),
        delete: vi.fn().mockResolvedValue({}),
      },
      passwordResetToken: {
        create: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn().mockResolvedValue({}),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.token === "valid-reset-token") {
            return Promise.resolve({ id: "reset-123", email: "unverified@example.com", expires: new Date(Date.now() + 100000) });
          }
          return Promise.resolve(null);
        }),
        delete: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn().mockImplementation((promises) => {
        if (simulateDbError) return Promise.reject(new Error("Transaction failed"));
        return Promise.all(promises);
      }),
    }),
  };
});

// Mock email helper
vi.mock("@/lib/email", () => {
  return {
    sendAccountVerificationEmail: vi.fn().mockResolvedValue(true),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
  };
});

describe("auth server actions", () => {
  beforeEach(() => {
    simulateDbError = false;
  });

  describe("signUpAction", () => {
    it("should register a new credentials user successfully", async () => {
      const formData = new FormData();
      formData.append("name", "New User");
      formData.append("email", "new@example.com");
      formData.append("password", "strongpassword123");
      formData.append("confirmPassword", "strongpassword123");

      const res = await signUpAction(formData);
      expect(res.success).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it("should fail if passwords do not match", async () => {
      const formData = new FormData();
      formData.append("name", "New User");
      formData.append("email", "new@example.com");
      formData.append("password", "strongpassword123");
      formData.append("confirmPassword", "differentpassword");

      const res = await signUpAction(formData);
      expect(res.error).toContain("do not match");
    });

    it("should fail if validation fails (password too short)", async () => {
      const formData = new FormData();
      formData.append("name", "New User");
      formData.append("email", "new@example.com");
      formData.append("password", "123");
      formData.append("confirmPassword", "123");

      const res = await signUpAction(formData);
      expect(res.error).toBeDefined();
    });

    it("should fail if email already exists", async () => {
      const formData = new FormData();
      formData.append("name", "New User");
      formData.append("email", "existing@example.com");
      formData.append("password", "strongpassword123");
      formData.append("confirmPassword", "strongpassword123");

      const res = await signUpAction(formData);
      expect(res.error).toContain("already exists");
    });

    it("should fail if email is registered via Google", async () => {
      const formData = new FormData();
      formData.append("name", "New User");
      formData.append("email", "google@example.com");
      formData.append("password", "strongpassword123");
      formData.append("confirmPassword", "strongpassword123");

      const res = await signUpAction(formData);
      expect(res.error).toContain("Google Sign-in");
    });

    it("should catch database execution errors", async () => {
      simulateDbError = true;
      const formData = new FormData();
      formData.append("name", "New User");
      formData.append("email", "new@example.com");
      formData.append("password", "strongpassword123");
      formData.append("confirmPassword", "strongpassword123");

      const res = await signUpAction(formData);
      expect(res.error).toContain("An error occurred");
    });
  });

  describe("resendVerificationAction", () => {
    it("should resend verification link for unverified account", async () => {
      const res = await resendVerificationAction("unverified@example.com");
      expect(res.success).toBe(true);
    });

    it("should fail if email parameter is missing", async () => {
      const res = await resendVerificationAction("");
      expect(res.error).toContain("required");
    });

    it("should return success even if email is not found (security precaution)", async () => {
      const res = await resendVerificationAction("nonexistent@example.com");
      expect(res.success).toBe(true);
    });

    it("should return success even if account is already verified (security precaution)", async () => {
      const res = await resendVerificationAction("verified@example.com");
      expect(res.success).toBe(true);
    });

    it("should return success even if account was created via Google (security precaution)", async () => {
      const res = await resendVerificationAction("google@example.com");
      expect(res.success).toBe(true);
    });

    it("should catch database transaction errors", async () => {
      simulateDbError = true;
      const res = await resendVerificationAction("unverified@example.com");
      expect(res.error).toContain("An error occurred");
    });
  });

  describe("forgotPasswordAction", () => {
    it("should create password reset token for valid user", async () => {
      const formData = new FormData();
      formData.append("email", "unverified@example.com");

      const res = await forgotPasswordAction(formData);
      expect(res.success).toBe(true);
    });

    it("should return success even if user does not exist (security precaution)", async () => {
      const formData = new FormData();
      formData.append("email", "notfound@example.com");

      const res = await forgotPasswordAction(formData);
      expect(res.success).toBe(true);
    });

    it("should fail if email is registered via Google", async () => {
      const formData = new FormData();
      formData.append("email", "google@example.com");

      const res = await forgotPasswordAction(formData);
      expect(res.error).toContain("Google Sign-in");
    });

    it("should fail if email schema is invalid", async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");

      const res = await forgotPasswordAction(formData);
      expect(res.error).toBeDefined();
    });

    it("should catch database errors", async () => {
      simulateDbError = true;
      const formData = new FormData();
      formData.append("email", "unverified@example.com");

      const res = await forgotPasswordAction(formData);
      expect(res.error).toContain("An error occurred");
    });
  });

  describe("resetPasswordAction", () => {
    it("should update user password with valid reset token", async () => {
      const formData = new FormData();
      formData.append("password", "newpassword123");
      formData.append("confirmPassword", "newpassword123");

      const res = await resetPasswordAction("valid-reset-token", formData);
      expect(res.success).toBe(true);
    });

    it("should fail if token parameter is missing", async () => {
      const formData = new FormData();
      formData.append("password", "newpassword123");
      formData.append("confirmPassword", "newpassword123");

      const res = await resetPasswordAction("", formData);
      expect(res.error).toContain("missing or invalid");
    });

    it("should fail if schema validation fails", async () => {
      const formData = new FormData();
      formData.append("password", "newpassword123");
      formData.append("confirmPassword", "mismatch");

      const res = await resetPasswordAction("valid-reset-token", formData);
      expect(res.error).toBeDefined();
    });

    it("should fail if token is invalid or expired", async () => {
      const formData = new FormData();
      formData.append("password", "newpassword123");
      formData.append("confirmPassword", "newpassword123");

      const res = await resetPasswordAction("invalid-token", formData);
      expect(res.error).toContain("expired or is invalid");
    });

    it("should catch database errors", async () => {
      simulateDbError = true;
      const formData = new FormData();
      formData.append("password", "newpassword123");
      formData.append("confirmPassword", "newpassword123");

      const res = await resetPasswordAction("valid-reset-token", formData);
      expect(res.error).toContain("An error occurred");
    });
  });

  describe("Rate limiting protection", () => {
    it("should reject signUpAction when rate limited", async () => {
      const { rateLimit } = await import("@/lib/rate-limit");
      vi.mocked(rateLimit).mockResolvedValueOnce({ limited: true, remaining: 0, resetTime: Date.now() });

      const formData = new FormData();
      const res = await signUpAction(formData);
      expect(res.error).toContain("Too many registration attempts");
    });
  });
});
