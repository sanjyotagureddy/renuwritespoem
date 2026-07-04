export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://renuwritespoem.vercel.app"
).replace(/\/$/, "");

export const siteConfig = {
  name: "Renu Writes Poem",
  author: "Renu",
  url: siteUrl,
  description:
    "Heartfelt poetry and books by Renu across English, Hindi, and Marathi — exploring love, nature, life, solitude, and spirituality.",
  instagram: "https://www.instagram.com/renuwrites_poem/",
  blog: "https://pillayrenu.blogspot.com/",
  email: "renuwritespoem@gmail.com",
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncateDescription(value: string, maxLength = 155) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}
