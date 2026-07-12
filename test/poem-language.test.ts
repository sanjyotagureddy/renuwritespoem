import { describe, it, expect } from "vitest";
import { poemLanguageToHtmlLang, poemLanguageLabel, poemLanguageFontClass } from "../src/lib/poem-language";

describe("poem-language helpers", () => {
  it("should map poem languages to html tags", () => {
    expect(poemLanguageToHtmlLang("HI")).toBe("hi");
    expect(poemLanguageToHtmlLang("MR")).toBe("mr");
    expect(poemLanguageToHtmlLang("EN")).toBe("en");
  });

  it("should output the human readable labels", () => {
    expect(poemLanguageLabel("HI")).toBe("Hindi");
    expect(poemLanguageLabel("MR")).toBe("Marathi");
    expect(poemLanguageLabel("EN")).toBe("English");
  });

  it("should set devanagari font classes for HI and MR", () => {
    expect(poemLanguageFontClass("HI")).toBe("font-devanagari");
    expect(poemLanguageFontClass("MR")).toBe("font-devanagari");
    expect(poemLanguageFontClass("EN")).toBe("");
  });
});
