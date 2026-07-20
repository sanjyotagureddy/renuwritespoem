import { describe, it, expect, vi } from "vitest";
import { getBadges, fetchUserBadgeStats } from "../../../src/lib/domain/badges";
import { PrismaClient } from "@prisma/client";

describe("getBadges", () => {
  it("should unlock badges according to stats", () => {
    const stats = {
      poemsRead: 1,
      booksPurchased: 1,
      commentsPosted: 1,
      likesGiven: 1,
    };
    const badges = getBadges(stats);

    // Unlocked badges should be: First Verse, Book Collector, Kindred Voice, First Heart
    const unlockedIds = badges.filter((b) => b.unlocked).map((b) => b.id);
    expect(unlockedIds).toContain("first-verse");
    expect(unlockedIds).toContain("book-collector");
    expect(unlockedIds).toContain("kindred-voice");
    expect(unlockedIds).toContain("first-heart");

    // Other milestone badges should remain locked
    expect(unlockedIds).not.toContain("page-turner");
    expect(unlockedIds).not.toContain("bookshelf-builder");
  });

  it("should unlock higher milestone badges when thresholds are met", () => {
    const stats = {
      poemsRead: 10,
      booksPurchased: 3,
      commentsPosted: 5,
      likesGiven: 10,
    };
    const badges = getBadges(stats);

    const unlockedIds = badges.filter((b) => b.unlocked).map((b) => b.id);
    expect(unlockedIds).toContain("page-turner");
    expect(unlockedIds).toContain("bookshelf-builder");
    expect(unlockedIds).toContain("thoughtful-reader");
    expect(unlockedIds).toContain("warm-hearted");
  });
});

describe("fetchUserBadgeStats", () => {
  it("should query stats count for the user and return total stats", async () => {
    // Create a mock PrismaClient
    const mockPrisma = {
      like: { count: vi.fn().mockResolvedValue(4) },
      bookLike: { count: vi.fn().mockResolvedValue(3) },
      audioLike: { count: vi.fn().mockResolvedValue(2) },
      comment: { count: vi.fn().mockResolvedValue(1) },
      bookComment: { count: vi.fn().mockResolvedValue(1) },
      audioComment: { count: vi.fn().mockResolvedValue(1) },
      bookOrder: { count: vi.fn().mockResolvedValue(2) },
      readerPoemView: { count: vi.fn().mockResolvedValue(12) },
    } as unknown as PrismaClient;

    const stats = await fetchUserBadgeStats(mockPrisma, "user-123", "test@example.com");

    expect(stats.poemsRead).toBe(12);
    expect(stats.booksPurchased).toBe(2);
    expect(stats.commentsPosted).toBe(3); // 1 + 1 + 1
    expect(stats.likesGiven).toBe(9); // 4 + 3 + 2

    expect(mockPrisma.like.count).toHaveBeenCalledWith({ where: { userId: "user-123" } });
    expect(mockPrisma.bookOrder.count).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
    expect(mockPrisma.readerPoemView.count).toHaveBeenCalledWith({ where: { userId: "user-123" } });
  });
});
