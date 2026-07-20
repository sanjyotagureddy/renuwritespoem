import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "../src/app/about/page";

// Mock rateLimit
vi.mock("@/lib/moderation/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ limited: false, remaining: 99, resetTime: 0 }),
}));

// Mock author actions
vi.mock("../src/app/admin/actions/author-actions", () => ({
  getOrCreateAuthorProfile: vi.fn().mockResolvedValue({
    id: "profile-id",
    whyIWrite: "Mocked Why I Write",
    writingJourney: "Mocked Journey",
    inspiration: "Mocked Inspiration",
    awards: "Award 1\nAward 2",
    publications: "Pub 1",
    interviews: "Intv 1",
    behindTheScenes: "Mocked Behind Scenes",
    writingDesk: "Mocked Writing Desk",
    gallery: [],
  }),
}));

describe("AboutPage Component", () => {
  it("should render about page successfully with all sections including FAQ", async () => {
    const Component = await AboutPage();
    render(Component);

    // Verify main header and profile fields are rendered
    expect(screen.getByText("About Renu")).toBeDefined();
    expect(screen.getByText("Mocked Why I Write")).toBeDefined();
    expect(screen.getByText("Mocked Journey")).toBeDefined();
    expect(screen.getByText("Mocked Inspiration")).toBeDefined();
  });
});
