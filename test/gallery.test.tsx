import { describe, it, expect, vi } from "vitest";
import GalleryPage from "../src/app/gallery/page";

// Mock the getOrCreateAuthorProfile server action
const mockGetProfile = vi.fn().mockResolvedValue({
  id: "profile-123",
  gallery: [
    {
      id: "img-1",
      url: "https://renuwritespoem.com/image1.jpg",
      fileData: null,
      fileMime: null,
      width: 1920,
      height: 1080,
      caption: "Creative Desk Setup",
      order: 1,
    },
    {
      id: "img-2",
      url: "https://renuwritespoem.com/image2.jpg",
      fileData: null,
      fileMime: null,
      width: 1920,
      height: 1080,
      caption: "Behind the Scenes Writing Moments",
      order: 2,
    },
  ],
});

vi.mock("../src/app/admin/actions/author-actions", () => ({
  getOrCreateAuthorProfile: () => mockGetProfile(),
}));

describe("GalleryPage Server Component", () => {
  it("should render successfully with gallery images array mapped", async () => {
    const result = await GalleryPage();

    expect(result).toBeDefined();
    expect(mockGetProfile).toHaveBeenCalled();
  });
});
