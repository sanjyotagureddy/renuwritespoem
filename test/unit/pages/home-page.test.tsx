import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock IntersectionObserver for Framer Motion
global.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
} as unknown as typeof IntersectionObserver;

// Mock rateLimit
vi.mock("@/lib/moderation/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ limited: false, remaining: 99, resetTime: 0 }),
}));

// Mock cache
vi.mock("../../../src/lib/cache", () => ({
  getCache: vi.fn().mockResolvedValue(null), // Force query execution
  setCache: vi.fn().mockResolvedValue(true),
}));

// Mock database storage to avoid connection requirement
vi.mock("../../../src/lib/db", () => {
  return {
    getPrisma: () => ({
      poem: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "poem-1",
            title: "Latest Verses Mock",
            slug: "latest-verses-mock",
            language: "en",
            genre: "Nature",
            content: "Mocked content of latest poem.",
            excerpt: "Mocked excerpt of latest poem.",
            featured: true,
            published: true,
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: { likes: 1, comments: 2 },
          },
        ]),
        findUnique: vi.fn().mockResolvedValue({
          id: "poem-day-1",
          title: "Poem of the Day Mock",
          slug: "poem-of-the-day-mock",
          language: "EN",
          genre: { name: "Spirituality", slug: "spirituality" },
          content: "Mocked content of daily poem.",
          excerpt: "Mocked excerpt of daily poem.",
          featured: false,
          published: true,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { likes: 10, comments: 5 },
        }),
      },
      book: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "book-1",
            title: "Featured Anthology Mock",
            slug: "featured-anthology-mock",
            description: "Mocked description of featured book.",
            coverImage: "https://example.com/cover.jpg",
            price: 15.99,
            discountedPrice: 12.99,
          },
        ]),
      },
      audio: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "audio-1",
            title: "Spoken Word Mock",
            slug: "spoken-word-mock",
            description: "Mocked spoken recording description.",
            audioUrl: "https://example.com/audio.mp3",
            coverUrl: "https://example.com/cover.jpg",
            views: 12,
            published: true,
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      },
      comment: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      bookComment: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      audioComment: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      authorGalleryImage: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "img-1",
            url: "https://example.com/photo.jpg",
            caption: "Writing Desk Highlights",
            width: 100,
            height: 100,
            order: 0,
            createdAt: new Date(),
          },
        ]),
      },
      authorProfile: {
        findFirst: vi.fn().mockResolvedValue({
          id: "profile-id",
          whyIWrite: "Writing is my soul's expression.",
          writingJourney: "I started writing in childhood.",
          inspiration: "",
          awards: "",
          publications: "",
          interviews: "",
          behindTheScenes: "",
          writingDesk: "",
        }),
      },
    }),
  };
});

// Import after hoisting mocks
import Home from "../../../src/app/page";

describe("Homepage Overhaul rendering", () => {
  it("should render all restructured sections successfully", async () => {
    const Component = await Home();
    render(Component);

    // 1. Hero
    expect(screen.getByText("Poetry & Stories in Three Languages")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Renu Writes Poem", level: 1 })).toBeDefined();
    expect(screen.getByText("Explore Poems")).toBeDefined();

    // Poem of the Day
    expect(screen.getByText("✨ Poem of the Day")).toBeDefined();
    expect(screen.getByText("Daily Verse Inspiration")).toBeDefined();
    expect(screen.getByText("Poem of the Day Mock")).toBeDefined();

    // 2. Featured Book
    expect(screen.getByText("Featured Release")).toBeDefined();
    expect(screen.getByText("Featured Anthology Mock")).toBeDefined();
    expect(screen.getByText("Order Physical Book")).toBeDefined();

    // 3. Latest Poem
    expect(screen.getByText("Recent Verses")).toBeDefined();
    expect(screen.getByText("Latest Poem")).toBeDefined();
    expect(screen.getByText("Latest Verses Mock")).toBeDefined();

    // 4. Listen to a Poem
    expect(screen.getByText("Spoken Word")).toBeDefined();
    expect(screen.getByText("Listen to a Poem")).toBeDefined();
    expect(screen.getByText("Spoken Word Mock")).toBeDefined();

    // 5. About the Author
    expect(screen.getByText("The Poet")).toBeDefined();
    expect(screen.getByText("About the Author")).toBeDefined();
    expect(screen.getByText(/Writing is my soul's expression./)).toBeDefined();

    // 6. Instagram / Gallery
    expect(screen.getByText("Captured Moments")).toBeDefined();
    expect(screen.getByText("Sanctuary Desk & Highlights")).toBeDefined();
  });
});
