import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GalleryPage from "../src/app/gallery/page";

// Mock getOrCreateAuthorProfile
vi.mock("../src/app/admin/author-actions", () => ({
  getOrCreateAuthorProfile: vi.fn().mockResolvedValue({
    id: "profile-id",
    gallery: [
      {
        id: "img-1",
        url: "https://example.com/1.jpg",
        width: 100,
        height: 100,
        caption: "Desk Photo 1",
        category: "Writing desk",
        order: 0,
      },
      {
        id: "img-2",
        url: "https://example.com/2.jpg",
        width: 100,
        height: 100,
        caption: "Launch Event 1",
        category: "Book launches",
        order: 1,
      },
    ],
  }),
}));

describe("GalleryPage and AuthorGallery Component", () => {
  it("should render gallery page successfully and filter images by category tabs", async () => {
    const Component = await GalleryPage();
    render(Component);

    // Verify header and page titles exist
    expect(screen.getByText("Visual Sanctuary")).toBeDefined();
    expect(screen.getByText("Gallery")).toBeDefined();

    // Verify category tab buttons render with count badges
    const allTab = screen.getByRole("button", { name: /All/i });
    expect(allTab).toBeDefined();

    const deskTab = screen.getByRole("button", { name: /Writing desk/i });
    expect(deskTab).toBeDefined();

    const launchTab = screen.getByRole("button", { name: /Book launches/i });
    expect(launchTab).toBeDefined();

    // Verify both images are visible initially under "All"
    expect(screen.getByAltText("Desk Photo 1")).toBeDefined();
    expect(screen.getByAltText("Launch Event 1")).toBeDefined();

    // Filter by "Writing desk" tab
    fireEvent.click(deskTab);

    // Only Desk Photo should be defined now (Launch Event should not be present)
    expect(screen.getByAltText("Desk Photo 1")).toBeDefined();
    expect(screen.queryByAltText("Launch Event 1")).toBeNull();

    // Filter by "Book launches" tab
    fireEvent.click(launchTab);

    // Only Launch Event should be defined now
    expect(screen.getByAltText("Launch Event 1")).toBeDefined();
    expect(screen.queryByAltText("Desk Photo 1")).toBeNull();
  });
});
