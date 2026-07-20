import { describe, it, expect, vi, beforeEach } from "vitest";
import { injectTracking } from "../src/app/admin/campaign-actions";
import { GET as trackOpenHandler } from "../src/app/api/campaigns/track/open/[deliveryId]/pixel.gif/route";
import { GET as trackClickHandler } from "../src/app/api/campaigns/track/click/route";
import { NextRequest } from "next/server";

// Mock siteConfig
vi.mock("@/lib/seo", () => ({
  siteConfig: {
    url: "https://renuwritespoem.com",
  },
  siteUrl: "https://renuwritespoem.com",
}));

// Mock rateLimit
vi.mock("@/lib/moderation/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ limited: false, remaining: 99, resetTime: 0 }),
}));

// Mock hoisted variables
const { mockFindUnique, mockUpdate, mockCreate } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
  mockCreate: vi.fn(),
}));

// Mock db
vi.mock("../src/lib/db", () => ({
  getPrisma: () => ({
    campaignDelivery: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
    campaignClick: {
      create: mockCreate,
    },
  }),
}));

describe("Newsletter Campaign Analytics & Tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("HTML Tracking Injector", () => {
    it("should append a transparent tracking pixel image at the end of the email", async () => {
      const originalHtml = "<p>Welcome to my sanctuary of poetry.</p>";
      const result = await injectTracking(originalHtml, "delivery-123");
      
      expect(result).toContain("<p>Welcome to my sanctuary of poetry.</p>");
      expect(result).toContain(
        '<img src="https://renuwritespoem.com/api/campaigns/track/open/delivery-123/pixel.gif" alt="" width="1" height="1" style="display:none;" />'
      );
    });

    it("should rewrite standard outbound links to use the click redirect tracking wrapper", async () => {
      const originalHtml = '<p>Check out my new book <a href="https://renuwritespoem.com/books/my-book">My Book</a>.</p>';
      const result = await injectTracking(originalHtml, "delivery-123");
      
      expect(result).toContain(
        'href="https://renuwritespoem.com/api/campaigns/track/click?d=delivery-123&url=https%3A%2F%2Frenuwritespoem.com%2Fbooks%2Fmy-book"'
      );
    });

    it("should skip rewriting unsubscribe, manage preference, mailto, and telephone references", async () => {
      const originalHtml = `
        <a href="https://renuwritespoem.com/unsubscribe">Unsubscribe</a>
        <a href="https://renuwritespoem.com/subscribe/preferences">Preferences</a>
        <a href="mailto:renu@example.com">Email me</a>
        <a href="tel:+911234567890">Call me</a>
      `;
      const result = await injectTracking(originalHtml, "delivery-123");

      expect(result).toContain('href="https://renuwritespoem.com/unsubscribe"');
      expect(result).toContain('href="https://renuwritespoem.com/subscribe/preferences"');
      expect(result).toContain('href="mailto:renu@example.com"');
      expect(result).toContain('href="tel:+911234567890"');
    });
  });

  describe("API Open Tracker (/api/campaigns/track/open/[deliveryId]/pixel.gif)", () => {
    it("should increment openCount, set openedAt, and return GIF headers", async () => {
      mockFindUnique.mockResolvedValue({ id: "delivery-123", email: "test@example.com", openedAt: null });
      mockUpdate.mockResolvedValue({ id: "delivery-123", openCount: 1 });

      const req = new NextRequest("https://renuwritespoem.com/api/campaigns/track/open/delivery-123/pixel.gif");
      const params = Promise.resolve({ deliveryId: "delivery-123" });

      const response = await trackOpenHandler(req, { params });

      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "delivery-123" } });
      expect(mockUpdate).toHaveBeenCalled();
      
      expect(response.headers.get("Content-Type")).toBe("image/gif");
      expect(response.headers.get("Cache-Control")).toContain("no-store");
    });
  });

  describe("API Click Tracker (/api/campaigns/track/click)", () => {
    it("should record the click in the database and issue a 307 redirect", async () => {
      mockFindUnique.mockResolvedValue({ id: "delivery-123", email: "test@example.com" });
      mockCreate.mockResolvedValue({ id: "click-123" });

      const req = new NextRequest(
        "https://renuwritespoem.com/api/campaigns/track/click?d=delivery-123&url=https%3A%2F%2Frenuwritespoem.com%2Fbooks"
      );

      const response = await trackClickHandler(req);

      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "delivery-123" } });
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          deliveryId: "delivery-123",
          url: "https://renuwritespoem.com/books",
        },
      });

      expect(response.status).toBe(307);
      expect(response.headers.get("Location")).toBe("https://renuwritespoem.com/books");
    });

    it("should fallback to root page redirect if query parameters are missing", async () => {
      const req = new NextRequest("https://renuwritespoem.com/api/campaigns/track/click");
      const response = await trackClickHandler(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("Location")).toBe("https://renuwritespoem.com/");
    });
  });
});
