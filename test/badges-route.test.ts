import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../src/app/api/account/badges/route";
import { getServerAuthSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

vi.mock("@/lib/auth", () => ({
  getServerAuthSession: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
}));

const mockCount = vi.fn().mockResolvedValue(0);
vi.mock("../src/lib/db", () => ({
  getPrisma: () => ({
    like: { count: mockCount },
    bookLike: { count: mockCount },
    audioLike: { count: mockCount },
    comment: { count: mockCount },
    bookComment: { count: mockCount },
    audioComment: { count: mockCount },
    bookOrder: { count: mockCount },
    readerPoemView: { count: mockCount },
  }),
}));

describe("GET /api/account/badges", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 429 if rate limit is exceeded", async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com", name: "Test User", role: "READER" },
      expires: "123",
    });
    vi.mocked(rateLimit).mockResolvedValue({ limited: true, remaining: 0, resetTime: 0 });

    const response = await GET();
    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toBe("Too many requests");
  });

  it("should return list of badges on success", async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com", name: "Test User", role: "READER" },
      expires: "123",
    });
    vi.mocked(rateLimit).mockResolvedValue({ limited: false, remaining: 59, resetTime: 0 });
    mockCount.mockResolvedValue(1); // will unlock all 1-threshold badges

    const response = await GET();
    expect(response.status).toBe(200);
    const badges = await response.json();
    expect(Array.isArray(badges)).toBe(true);

    const firstVerse = badges.find((b: any) => b.id === "first-verse");
    expect(firstVerse).toBeDefined();
    expect(firstVerse.unlocked).toBe(true);
  });
});
