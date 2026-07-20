import { describe, it, expect } from "vitest";
import { validateContactMessageTone, checkCommentTone } from "../src/lib/moderation/contact-guard";

describe("contact-guard tone validation", () => {
  describe("validateContactMessageTone", () => {
    it("should return null for respectful messages", () => {
      const res = validateContactMessageTone({
        subject: "Hello Author",
        message: "I really love your work. Can't wait for the next book!",
      });
      expect(res).toBeNull();
    });

    it("should flag disrespectful abusive words", () => {
      const res = validateContactMessageTone({
        subject: "Hey",
        message: "You are a total asshole",
      });
      expect(res).toContain("respectful");
    });

    it("should flag threat patterns", () => {
      const res = validateContactMessageTone({
        subject: "Warning",
        message: "I will kill you if you post more",
      });
      expect(res).toContain("threatening");
    });

    it("should flag excessive links", () => {
      const res = validateContactMessageTone({
        subject: "Promo",
        message: "Buy cheap stuff: https://site.com www.other.in http://spam.com",
      });
      expect(res).toContain("links");
    });

    it("should flag shouts in all-caps", () => {
      const res = validateContactMessageTone({
        subject: "HI",
        message: "PLEASE STOP DOING THIS RIGHT NOW BECAUSE IT IS SO ANNOYING",
      });
      expect(res).toContain("all-caps");
    });

    it("should flag repeated text patterns (spam)", () => {
      const res = validateContactMessageTone({
        subject: "Spam",
        message: "spam spam spam spam spam spam spam",
      });
      expect(res).toContain("spam-like");
    });
  });

  describe("checkCommentTone", () => {
    it("should classify comments correctly", () => {
      expect(checkCommentTone("Wonderful recitations!").isAbusive).toBe(false);
      expect(checkCommentTone("you idiot!").isAbusive).toBe(true);
      expect(checkCommentTone("I will hurt you").isAbusive).toBe(true);
      expect(checkCommentTone("https://site.com www.link.com click.com").isAbusive).toBe(true);
    });
  });
});
