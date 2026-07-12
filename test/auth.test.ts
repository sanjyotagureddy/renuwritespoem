import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the next-auth credentials provider to be a pass-through
vi.mock("next-auth/providers/credentials", () => {
  return {
    default: (options: any) => ({
      id: "credentials",
      name: "credentials",
      ...options,
    }),
  };
});

// Mock the database client
vi.mock("@/lib/db", () => {
  return {
    getPrisma: () => ({
      user: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.email === "admin@example.com" || where.id === "admin-id") {
            return Promise.resolve({ id: "admin-id", email: "admin@example.com", role: "ADMIN", disabledAt: null, emailVerified: new Date() });
          }
          if (where.email === "disabled@example.com" || where.id === "disabled-id") {
            return Promise.resolve({ id: "disabled-id", email: "disabled@example.com", role: "READER", disabledAt: new Date(), emailVerified: new Date() });
          }
          if (where.email === "google@example.com" || where.id === "google-id") {
            return Promise.resolve({ id: "google-id", email: "google@example.com", role: "READER", disabledAt: null, passwordHash: null, emailVerified: new Date() });
          }
          if (where.email === "unverified@example.com" || where.id === "unverified-id") {
            return Promise.resolve({ id: "unverified-id", email: "unverified@example.com", role: "READER", disabledAt: null, passwordHash: "hashed-pw", emailVerified: null });
          }
          if (where.email === "verified@example.com" || where.id === "verified-id") {
            return Promise.resolve({ id: "verified-id", email: "verified@example.com", role: "READER", disabledAt: null, passwordHash: "hashed-pw", emailVerified: new Date() });
          }
          return Promise.resolve(null);
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        update: vi.fn().mockResolvedValue({ id: "updated-id" }),
      },
      subscriber: {
        upsert: vi.fn().mockResolvedValue({}),
      },
      unsubscribedEmail: {
        deleteMany: vi.fn().mockResolvedValue({}),
      },
    }),
  };
});

// Mock bcryptjs properly for both default and named exports
vi.mock("bcryptjs", () => {
  const compare = vi.fn().mockImplementation((password, hash) => {
    if (password === "correct-pw" && hash === "hashed-pw") {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  });
  return {
    compare,
    default: {
      compare,
    },
  };
});

import { authOptions } from "../src/lib/auth";

describe("auth callbacks & credentials", () => {
  const originalEnv = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    process.env.ADMIN_EMAILS = "admin@example.com";
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalEnv;
  });

  describe("CredentialsProvider authorize", () => {
    const credentialsProvider = authOptions.providers.find(p => p.id === "credentials");
    
    it("should throw if credentials email or password is missing", async () => {
      if (!credentialsProvider || !("authorize" in credentialsProvider)) {
        throw new Error("CredentialsProvider not found or invalid");
      }

      await expect(Promise.resolve().then(() => credentialsProvider.authorize(undefined, {} as any))).rejects.toThrow("required");
      await expect(Promise.resolve().then(() => credentialsProvider.authorize({ email: "", password: "pw" }, {} as any))).rejects.toThrow("required");
      await expect(Promise.resolve().then(() => credentialsProvider.authorize({ email: "test@example.com", password: "" }, {} as any))).rejects.toThrow("required");
    });

    it("should throw if user is not found", async () => {
      if (!credentialsProvider || !("authorize" in credentialsProvider)) {
        throw new Error("CredentialsProvider not found or invalid");
      }

      await expect(Promise.resolve().then(() => credentialsProvider.authorize({ email: "notfound@example.com", password: "pw" }, {} as any))).rejects.toThrow("No user found");
    });

    it("should throw if user is disabled", async () => {
      if (!credentialsProvider || !("authorize" in credentialsProvider)) {
        throw new Error("CredentialsProvider not found or invalid");
      }

      await expect(Promise.resolve().then(() => credentialsProvider.authorize({ email: "disabled@example.com", password: "pw" }, {} as any))).rejects.toThrow("disabled");
    });

    it("should throw if user registered via Google (no passwordHash)", async () => {
      if (!credentialsProvider || !("authorize" in credentialsProvider)) {
        throw new Error("CredentialsProvider not found or invalid");
      }

      await expect(Promise.resolve().then(() => credentialsProvider.authorize({ email: "google@example.com", password: "pw" }, {} as any))).rejects.toThrow("Google Sign-in");
    });

    it("should throw if password is incorrect", async () => {
      if (!credentialsProvider || !("authorize" in credentialsProvider)) {
        throw new Error("CredentialsProvider not found or invalid");
      }

      await expect(Promise.resolve().then(() => credentialsProvider.authorize({ email: "verified@example.com", password: "wrong-pw" }, {} as any))).rejects.toThrow("Incorrect password");
    });

    it("should throw if email is unverified", async () => {
      if (!credentialsProvider || !("authorize" in credentialsProvider)) {
        throw new Error("CredentialsProvider not found or invalid");
      }

      await expect(Promise.resolve().then(() => credentialsProvider.authorize({ email: "unverified@example.com", password: "correct-pw" }, {} as any))).rejects.toThrow("UNVERIFIED_EMAIL");
    });

    it("should return user object if everything is valid", async () => {
      if (!credentialsProvider || !("authorize" in credentialsProvider)) {
        throw new Error("CredentialsProvider not found or invalid");
      }

      const user = await credentialsProvider.authorize({ email: "verified@example.com", password: "correct-pw" }, {} as any);
      expect(user).toBeDefined();
      expect(user?.email).toBe("verified@example.com");
    });
  });

  describe("signIn callback", () => {
    it("should return false if email is missing", async () => {
      const signInCallback = authOptions.callbacks?.signIn;
      if (!signInCallback) throw new Error("signIn callback not found");

      const result = await signInCallback({
        user: { name: "Test" },
        account: null,
        profile: null,
      });

      expect(result).toBe(false);
    });

    it("should return false if user is disabled", async () => {
      const signInCallback = authOptions.callbacks?.signIn;
      if (!signInCallback) throw new Error("signIn callback not found");

      const result = await signInCallback({
        user: { email: "disabled@example.com" },
        account: null,
        profile: null,
      });

      expect(result).toBe(false);
    });

    it("should auto-verify Google OAuth users and return true", async () => {
      const signInCallback = authOptions.callbacks?.signIn;
      if (!signInCallback) throw new Error("signIn callback not found");

      const result = await signInCallback({
        user: { email: "unverified@example.com" },
        account: { provider: "google" } as any,
        profile: null,
      });

      expect(result).toBe(true);
    });

    it("should promote admin email to ADMIN role", async () => {
      const signInCallback = authOptions.callbacks?.signIn;
      if (!signInCallback) throw new Error("signIn callback not found");

      const result = await signInCallback({
        user: { email: "admin@example.com" },
        account: null,
        profile: null,
      });

      expect(result).toBe(true);
    });
  });

  describe("jwt callback", () => {
    it("should set role to ADMIN if email matches env admin emails list", async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) throw new Error("jwt callback not found");

      const token = await jwtCallback({
        token: { email: "admin@example.com" },
        user: { id: "admin-id", email: "admin@example.com" },
        account: null,
        profile: null,
        trigger: "signIn",
      });

      expect(token.role).toBe("ADMIN");
      expect(token.disabled).toBe(false);
    });

    it("should set role to READER for normal users", async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) throw new Error("jwt callback not found");

      const token = await jwtCallback({
        token: { email: "reader@example.com", userId: "reader-id" },
        user: { id: "reader-id", email: "reader@example.com" },
        account: null,
        profile: null,
      });

      expect(token.role).toBe("READER");
      expect(token.disabled).toBe(false);
    });

    it("should detect disabled accounts", async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) throw new Error("jwt callback not found");

      const token = await jwtCallback({
        token: { email: "disabled@example.com", userId: "disabled-id" },
        user: { id: "disabled-id", email: "disabled@example.com" },
        account: null,
        profile: null,
      });

      expect(token.disabled).toBe(true);
    });
  });

  describe("session callback", () => {
    it("should populate user details from token", async () => {
      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) throw new Error("session callback not found");

      const session = await sessionCallback({
        session: { expires: "", user: { name: "", email: "", image: "" } },
        token: { userId: "user-123", role: "READER", disabled: false },
        user: { id: "user-123", email: "" } as any,
      });

      expect(session.user?.id).toBe("user-123");
      expect(session.user?.role).toBe("READER");
    });

    it("should clear userId if token is marked disabled", async () => {
      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) throw new Error("session callback not found");

      const session = await sessionCallback({
        session: { expires: "", user: { name: "", email: "", image: "" } },
        token: { userId: "disabled-id", role: "READER", disabled: true },
        user: { id: "disabled-id", email: "" } as any,
      });

      expect(session.user?.id).toBe("");
    });
  });

  describe("createUser event", () => {
    it("should upsert subscriber and delete from unsubscribed emails", async () => {
      const createUserEvent = authOptions.events?.createUser;
      if (!createUserEvent) throw new Error("createUser event not found");

      await expect(createUserEvent({ user: { email: "new@example.com", name: "New User" } })).resolves.not.toThrow();
    });
  });
});
