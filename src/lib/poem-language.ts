export const poemLanguageOptions = ["EN", "HI", "MR"] as const;

export type PoemLanguage = (typeof poemLanguageOptions)[number];

export function poemLanguageToHtmlLang(language: PoemLanguage): "en" | "hi" | "mr" {
  switch (language) {
    case "HI":
      return "hi";
    case "MR":
      return "mr";
    case "EN":
    default:
      return "en";
  }
}

export function poemLanguageLabel(language: PoemLanguage): string {
  switch (language) {
    case "HI":
      return "Hindi";
    case "MR":
      return "Marathi";
    case "EN":
    default:
      return "English";
  }
}

export function poemLanguageFontClass(language: PoemLanguage): string {
  return language === "HI" || language === "MR" ? "font-devanagari" : "";
}
