const ABUSIVE_WORDS = [
  "asshole",
  "bastard",
  "bitch",
  "bloody hell",
  "bullshit",
  "chutiya",
  "fuck",
  "fucker",
  "fucking",
  "harami",
  "idiot",
  "kamine",
  "madarchod",
  "mc",
  "moron",
  "shit",
  "stupid",
];

const THREAT_PATTERNS = [
  /\b(i\s+will|i'?ll|going\s+to|gonna)\s+(hurt|harm|kill|destroy)\b/i,
  /\b(kill|hurt|harm)\s+(you|u|her|him|them)\b/i,
  /\b(go\s+die|die\s+now)\b/i,
];

function normalizeForMatching(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("@", "a")
    .replaceAll("$", "s")
    .replaceAll("0", "o")
    .replaceAll("1", "i")
    .replaceAll("!", "i")
    .replaceAll("3", "e")
    .replaceAll("5", "s")
    .replace(/(.)\1{2,}/g, "$1$1")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasTooManyLinks(value: string): boolean {
  const links = value.match(/https?:\/\/|www\.|\.com\b|\.in\b/gi) ?? [];
  return links.length > 2;
}

function isMostlyShouting(value: string): boolean {
  const letters = value.replace(/[^\p{L}]/gu, "");
  if (letters.length < 30) return false;

  const uppercaseLetters = letters.replace(/[^\p{Lu}]/gu, "");
  return uppercaseLetters.length / letters.length > 0.78;
}

function hasRepeatedSpam(value: string): boolean {
  return /(.)\1{14,}/.test(value) || /\b(.{3,20})\b(?:\s+\1\b){4,}/i.test(value);
}

export function validateContactMessageTone({
  subject,
  message,
}: {
  subject: string;
  message: string;
}): string | null {
  const combined = `${subject}\n${message}`;
  const normalized = normalizeForMatching(combined);

  if (ABUSIVE_WORDS.some((word) => normalized.includes(word))) {
    return "Please keep the message respectful before sending.";
  }

  if (THREAT_PATTERNS.some((pattern) => pattern.test(combined))) {
    return "Please remove threatening or harmful language before sending.";
  }

  if (hasTooManyLinks(combined)) {
    return "Please keep links to a minimum before sending.";
  }

  if (isMostlyShouting(combined)) {
    return "Please avoid all-caps shouting before sending.";
  }

  if (hasRepeatedSpam(combined)) {
    return "Please remove repeated spam-like text before sending.";
  }

  return null;
}

export function checkCommentTone(text: string): { isAbusive: boolean; reason: string | null } {
  const normalized = normalizeForMatching(text);

  if (ABUSIVE_WORDS.some((word) => normalized.includes(word))) {
    return { isAbusive: true, reason: "Contains disrespectful language." };
  }

  if (THREAT_PATTERNS.some((pattern) => pattern.test(text))) {
    return { isAbusive: true, reason: "Contains harmful or threatening language." };
  }

  if (hasTooManyLinks(text)) {
    return { isAbusive: true, reason: "Contains too many links." };
  }

  if (isMostlyShouting(text)) {
    return { isAbusive: true, reason: "Shouting in all-caps." };
  }

  if (hasRepeatedSpam(text)) {
    return { isAbusive: true, reason: "Contains repeated text patterns." };
  }

  return { isAbusive: false, reason: null };
}
