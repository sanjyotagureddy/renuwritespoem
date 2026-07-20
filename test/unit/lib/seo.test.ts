import { describe, it, expect } from "vitest";
import { absoluteUrl, truncateDescription } from "../../../src/lib/seo";

describe("seo helpers", () => {
  describe("absoluteUrl", () => {
    it("should return the absolute URL when passed standard paths", () => {
      expect(absoluteUrl("/poems")).toContain("/poems");
      expect(absoluteUrl("books")).toContain("/books");
    });

    it("should return unmodified path if it is already absolute", () => {
      expect(absoluteUrl("https://example.com/test")).toBe("https://example.com/test");
    });
  });

  describe("truncateDescription", () => {
    it("should normalize double spaces and trim", () => {
      expect(truncateDescription("  This   is   a   description  ")).toBe("This is a description");
    });

    it("should truncate and append ellipsis if it exceeds maxLength", () => {
      const longText = "a ".repeat(100).trim(); // 199 chars
      const truncated = truncateDescription(longText, 50);
      expect(truncated).toHaveLength(50);
      expect(truncated.endsWith("…")).toBe(true);
    });
  });
});
