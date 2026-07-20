import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as printCardHandler } from "../src/app/api/poems/[slug]/print-card/route";
import { NextRequest } from "next/server";

// Mock rateLimit
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ limited: false, remaining: 7, resetTime: 0 }),
}));

// Mock seo
vi.mock("@/lib/seo", () => ({
  siteConfig: {
    name: "Renu Writes Poem",
    url: "https://renuwritespoem.vercel.app",
    author: "Renu",
  },
}));

// Mock cache
vi.mock("@/lib/cache", () => ({
  invalidateCache: vi.fn().mockResolvedValue(undefined),
}));

// Mock db
const { mockFindUnique, mockUpdate, mockCreate, mockTransaction } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
  mockCreate: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    poem: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
    printCard: {
      create: mockCreate,
    },
    $transaction: mockTransaction,
  }),
}));

describe("Printable Poem Cards API (/api/poems/[slug]/print-card)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation((promises) => Promise.all(promises));
  });

  it("should return 404 if the poem is not found or not published", async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = new NextRequest("https://renuwritespoem.vercel.app/api/poems/non-existent/print-card", {
      method: "POST",
      body: JSON.stringify({ theme: "classic" }),
    });

    const params = Promise.resolve({ slug: "non-existent" });
    const response = await printCardHandler(req, { params });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toContain("not found");
  });

  it("should return 400 if personal dedication message contains abusive language", async () => {
    mockFindUnique.mockResolvedValue({
      id: "poem-1",
      slug: "test-poem",
      title: "Test Poem",
      content: "Quiet verses in the night.",
      language: "EN",
      published: true,
    });

    const req = new NextRequest("https://renuwritespoem.vercel.app/api/poems/test-poem/print-card", {
      method: "POST",
      body: JSON.stringify({
        dedicatedTo: "Friend",
        message: "You are an idiot and a fool",
        theme: "classic",
      }),
    });

    const params = Promise.resolve({ slug: "test-poem" });
    const response = await printCardHandler(req, { params });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Message issue");
  });

  it("should generate a valid PDF card in landscape orientation for valid request", async () => {
    mockFindUnique.mockResolvedValue({
      id: "poem-1",
      slug: "whispers-of-love",
      title: "Whispers of Love",
      content: "Soft breezes fall upon the leaves,\nSolitude brings quiet peace.",
      language: "EN",
      published: true,
      downloadCount: 5,
    });

    mockUpdate.mockResolvedValue({ id: "poem-1", downloadCount: 6 });
    mockCreate.mockResolvedValue({ id: "card-1" });

    const req = new NextRequest("https://renuwritespoem.vercel.app/api/poems/whispers-of-love/print-card", {
      method: "POST",
      body: JSON.stringify({
        dedicatedTo: "Aria",
        fromName: "Leo",
        message: "Thinking of you always.",
        theme: "floral",
        orientation: "landscape",
      }),
    });

    const params = Promise.resolve({ slug: "whispers-of-love" });
    const response = await printCardHandler(req, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain("whispers-of-love-card.pdf");

    const pdfArrayBuffer = await response.arrayBuffer();
    expect(pdfArrayBuffer.byteLength).toBeGreaterThan(1000);
  });

  it("should generate a valid PDF card in portrait orientation for valid request", async () => {
    mockFindUnique.mockResolvedValue({
      id: "poem-2",
      slug: "quiet-night",
      title: "Quiet Night",
      content: "Stars shine bright in dark skies.",
      language: "EN",
      published: true,
      downloadCount: 2,
    });

    const req = new NextRequest("https://renuwritespoem.vercel.app/api/poems/quiet-night/print-card", {
      method: "POST",
      body: JSON.stringify({
        dedicatedTo: "Mom",
        theme: "minimal",
        orientation: "portrait",
      }),
    });

    const params = Promise.resolve({ slug: "quiet-night" });
    const response = await printCardHandler(req, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    const pdfArrayBuffer = await response.arrayBuffer();
    expect(pdfArrayBuffer.byteLength).toBeGreaterThan(1000);
  });
});
