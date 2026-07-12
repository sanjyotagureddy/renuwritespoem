import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

export function statusLabel(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "COMING_SOON":
      return "Coming Soon";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "border-emerald-400/30 text-emerald-400/80 bg-emerald-500/10";
    case "COMING_SOON":
      return "border-amber-400/30 text-amber-400/80 bg-amber-500/10";
    default:
      return "border-white/15 text-white/40 bg-white/5";
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getReadingTime(content: string): string {
  if (!content) return "0 min read";
  const words = content.trim().split(/\s+/).length;
  // Poetry is read slower, estimating at ~120 words per minute
  const minutes = Math.ceil(words / 120);
  return `${minutes} min read`;
}

export function generateAvatarUrl(seed: string): string {
  // Uses DiceBear's "lorelei" style for cute, modern character avatars
  return `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
}

export const POETIC_PHRASES = [
  "शब्द ही अनुभव, शब्द ही श्वास...",
  "Every verse is an open door.",
  "कविता म्हणजे भावनांचा आरसा...",
  "Rhythm of the heart, silent and deep.",
  "काही शब्द न बोलताही खूप काही बोलून जातात...",
  "In the silence between lines, truth speaks.",
  "कागदावर उतरलेले मन, म्हणजे कविता...",
  "A poem is a whisper of the soul.",
  "शब्दांच्या पलीकडले भाव, समजून घेताना...",
  "Where words fail, poetry speaks.",
  "अव्यक्त भावनांची सुंदर गुंफण...",
  "Verses that heal, rhythm that guides.",
  "काव्याच्या प्रवासात, स्वतःला शोधताना...",
  "A quiet melody of thoughts.",
  "शब्दांचे घर सुंदर आणि जिवंत असावे..."
];

export function getRandomPoeticPhrase(): string {
  return POETIC_PHRASES[Math.floor(Math.random() * POETIC_PHRASES.length)];
}
