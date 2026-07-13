import { describe, it, expect, vi } from "vitest";
import AccountLikesPage from "../src/app/account/likes/page";

// Mock getServerAuthSession
vi.mock("@/lib/auth", () => ({
  getServerAuthSession: vi.fn().mockResolvedValue({
    user: { id: "user-id-123", email: "test@example.com", name: "Test User" },
  }),
}));

// Mock db
const mockQueryRaw = vi.fn().mockResolvedValue([
  {
    id: "poem-slug-123",
    type: "Poem",
    targetTitle: "Beautiful Sunset",
    targetSlug: "beautiful-sunset",
    createdAt: new Date("2026-07-13T12:00:00Z"),
  },
  {
    id: "book-slug-456",
    type: "Book",
    targetTitle: "My Journey Book",
    targetSlug: "my-journey-book",
    createdAt: new Date("2026-07-12T12:00:00Z"),
  },
]);

const mockCount = vi.fn().mockResolvedValue(1);

vi.mock("../src/lib/db", () => ({
  getPrisma: () => ({
    $queryRaw: mockQueryRaw,
    like: { count: mockCount },
    bookLike: { count: mockCount },
    audioLike: { count: mockCount },
  }),
}));

describe("AccountLikesPage", () => {
  it("should render successfully with liked content lists", async () => {
    const result = await AccountLikesPage({
      searchParams: Promise.resolve({ page: "1" }),
    });

    expect(result).toBeDefined();
    expect(mockQueryRaw).toHaveBeenCalled();
  });
});
