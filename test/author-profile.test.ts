import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getOrCreateAuthorProfile,
  updateAuthorProfile,
  addGalleryImage,
  deleteGalleryImage,
  updateGalleryOrder,
  updateGalleryImageCategory,
} from "../src/app/admin/author-actions";

// Mock rateLimit to prevent test failures
vi.mock("@/lib/moderation/rate-limit", () => {
  return {
    rateLimit: vi.fn().mockResolvedValue({ limited: false, remaining: 99, resetTime: 0 }),
  };
});

// Mock requireAdmin from shared-actions
vi.mock("../src/app/admin/shared-actions", () => {
  return {
    requireAdmin: vi.fn().mockResolvedValue({ user: { role: "ADMIN" } }),
  };
});

// Mock Vercel Blob
vi.mock("@vercel/blob", () => {
  return {
    put: vi.fn().mockResolvedValue({ url: "https://blob.example.com/mock-image.jpg" }),
    del: vi.fn().mockResolvedValue(true),
  };
});

// Mock Next Cache
vi.mock("next/cache", () => {
  return {
    revalidatePath: vi.fn(),
  };
});

// Mock database storage
let mockProfile = {
  id: "profile-id",
  whyIWrite: "Original Why I Write",
  writingJourney: "Original Journey",
  inspiration: "Original Inspiration",
  awards: "Original Awards",
  publications: "Original Publications",
  interviews: "Original Interviews",
  behindTheScenes: "Original Behind the Scenes",
  writingDesk: "Original Writing Desk",
  gallery: [] as any[],
};

let mockGalleryImages: any[] = [];

vi.mock("../src/lib/db", () => {
  return {
    getPrisma: () => ({
      authorProfile: {
        findFirst: vi.fn().mockImplementation(() => {
          return Promise.resolve({
            ...mockProfile,
            gallery: mockGalleryImages,
          });
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          mockProfile = {
            ...mockProfile,
            ...data,
          };
          return Promise.resolve({
            ...mockProfile,
            gallery: [],
          });
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          mockProfile = {
            ...mockProfile,
            ...data,
          };
          return Promise.resolve(mockProfile);
        }),
      },
      authorGalleryImage: {
        findFirst: vi.fn().mockImplementation(() => {
          if (mockGalleryImages.length > 0) {
            return Promise.resolve(mockGalleryImages[mockGalleryImages.length - 1]);
          }
          return Promise.resolve(null);
        }),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          const img = mockGalleryImages.find((i) => i.id === where.id);
          return Promise.resolve(img || null);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const newImg = {
            id: `image-${Date.now()}`,
            ...data,
          };
          mockGalleryImages.push(newImg);
          return Promise.resolve(newImg);
        }),
        delete: vi.fn().mockImplementation(({ where }) => {
          const deleted = mockGalleryImages.find((i) => i.id === where.id);
          mockGalleryImages = mockGalleryImages.filter((i) => i.id !== where.id);
          return Promise.resolve(deleted || null);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const img = mockGalleryImages.find((i) => i.id === where.id);
          if (img) {
            Object.assign(img, data);
          }
          return Promise.resolve(img || null);
        }),
      },
      $transaction: vi.fn().mockImplementation((promises) => {
        return Promise.all(promises);
      }),
    }),
  };
});

describe("Author Profile Server Actions", () => {
  beforeEach(() => {
    mockProfile = {
      id: "profile-id",
      whyIWrite: "Original Why I Write",
      writingJourney: "Original Journey",
      inspiration: "Original Inspiration",
      awards: "Original Awards",
      publications: "Original Publications",
      interviews: "Original Interviews",
      behindTheScenes: "Original Behind the Scenes",
      writingDesk: "Original Writing Desk",
      gallery: [],
    };
    mockGalleryImages = [];
    process.env.BLOB_READ_WRITE_TOKEN = "";
  });

  describe("getOrCreateAuthorProfile", () => {
    it("should retrieve the profile if it exists", async () => {
      const result = await getOrCreateAuthorProfile();
      expect(result.id).toBe("profile-id");
      expect(result.whyIWrite).toBe("Original Why I Write");
    });
  });

  describe("updateAuthorProfile", () => {
    it("should update profile description texts", async () => {
      const formData = new FormData();
      formData.append("whyIWrite", "New Why I Write Value");
      formData.append("writingJourney", "New Journey");
      formData.append("inspiration", "New Inspiration");

      const result = await updateAuthorProfile(formData);
      expect(result.whyIWrite).toBe("New Why I Write Value");
      expect(result.writingJourney).toBe("New Journey");
      expect(result.inspiration).toBe("New Inspiration");
      expect(mockProfile.whyIWrite).toBe("New Why I Write Value");
    });
  });

  describe("addGalleryImage", () => {
    it("should upload a file and save details to database with category", async () => {
      process.env.BLOB_READ_WRITE_TOKEN = "mock-token";
      const formData = new FormData();
      // Mock File object
      const file = new File(["dummy image"], "desk.jpg", { type: "image/jpeg" });
      formData.append("file", file);
      formData.append("width", "800");
      formData.append("height", "600");
      formData.append("caption", "My Desk photo");
      formData.append("category", "Writing desk");

      const result = await addGalleryImage(formData);
      expect(result.id).toBeDefined();
      expect(result.url).toBe("https://blob.example.com/mock-image.jpg");
      expect(result.caption).toBe("My Desk photo");
      expect(result.category).toBe("Writing desk");
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
      expect(mockGalleryImages.length).toBe(1);
    });

    it("should throw error if file is missing", async () => {
      const formData = new FormData();
      await expect(addGalleryImage(formData)).rejects.toThrow("No file uploaded.");
    });
  });

  describe("deleteGalleryImage", () => {
    it("should remove the image from the database and call blob del", async () => {
      process.env.BLOB_READ_WRITE_TOKEN = "mock-token";
      mockGalleryImages.push({
        id: "target-image-id",
        url: "https://blob.example.com/mock-image.jpg",
        caption: "Testing delete",
        order: 0,
      });

      const res = await deleteGalleryImage("target-image-id");
      expect(res.success).toBe(true);
      expect(mockGalleryImages.length).toBe(0);
    });
  });

  describe("updateGalleryOrder", () => {
    it("should update sorting order indexes inside transaction", async () => {
      const img1 = { id: "id-1", order: 0 };
      const img2 = { id: "id-2", order: 1 };
      mockGalleryImages.push(img1, img2);

      // Reorder
      const res = await updateGalleryOrder(["id-2", "id-1"]);
      expect(res.success).toBe(true);
      expect(img2.order).toBe(0);
      expect(img1.order).toBe(1);
    });
  });

  describe("updateGalleryImageCategory", () => {
    it("should update category in target image", async () => {
      const img = { id: "img-category-test", category: "Original category" };
      mockGalleryImages.push(img);

      const res = await updateGalleryImageCategory("img-category-test", "Book launches");
      expect(res.category).toBe("Book launches");
      expect(img.category).toBe("Book launches");
    });
  });
});
