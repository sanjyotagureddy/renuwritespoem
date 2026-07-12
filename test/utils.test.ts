import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime, slugify, getReadingTime, generateAvatarUrl, statusLabel, statusColor } from "../src/lib/utils";

describe("utils library helpers", () => {
  describe("formatDate & formatDateTime", () => {
    it("should return dash if date is null", () => {
      expect(formatDate(null)).toBe("—");
      expect(formatDateTime(null)).toBe("—");
    });

    it("should format valid date correctly", () => {
      const date = new Date("2026-07-12T10:30:00.000Z");
      // Formatted in en-IN style
      expect(formatDate(date)).toContain("12");
      expect(formatDate(date)).toContain("Jul");
      expect(formatDate(date)).toContain("2026");
    });
  });

  describe("slugify", () => {
    it("should convert a string to a clean URL slug", () => {
      expect(slugify("Hello World! This is a test...")).toBe("hello-world-this-is-a-test");
      expect(slugify("  Marathi-Poem---123  ")).toBe("marathi-poem-123");
    });
  });

  describe("getReadingTime", () => {
    it("should return 0 min read for empty content", () => {
      expect(getReadingTime("")).toBe("0 min read");
    });

    it("should estimate reading time based on word count", () => {
      const content = Array(240).fill("word").join(" ");
      expect(getReadingTime(content)).toBe("2 min read");
    });
  });

  describe("generateAvatarUrl", () => {
    it("should build a DiceBear URL", () => {
      expect(generateAvatarUrl("test-user")).toContain("api.dicebear.com");
      expect(generateAvatarUrl("test-user")).toContain("lorelei");
    });
  });

  describe("statusLabel & statusColor", () => {
    it("should return matching labels and CSS colors", () => {
      expect(statusLabel("AVAILABLE")).toBe("Available");
      expect(statusLabel("COMING_SOON")).toBe("Coming Soon");
      expect(statusLabel("OTHER")).toBe("OTHER");

      expect(statusColor("AVAILABLE")).toContain("emerald");
      expect(statusColor("COMING_SOON")).toContain("amber");
      expect(statusColor("OTHER")).toContain("white");
    });
  });
});
