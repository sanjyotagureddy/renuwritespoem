import type { MetadataRoute } from "next";
import { getPrisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prisma = getPrisma();

  const [poems, books, genres] = await Promise.all([
    prisma.poem.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
    }),
    prisma.book.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { slug: true, updatedAt: true, publishedAt: true },
    }),
    prisma.genre.findMany({
      where: { poems: { some: { published: true } } },
      select: { slug: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/poems"), lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/genres"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: absoluteUrl("/books"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/about"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...staticRoutes,
    ...poems.map((poem) => ({
      url: absoluteUrl(`/poems/${poem.slug}`),
      lastModified: poem.updatedAt ?? poem.publishedAt ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...books.map((book) => ({
      url: absoluteUrl(`/books/${book.slug}`),
      lastModified: book.updatedAt ?? book.publishedAt ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...genres.map((genre) => ({
      url: absoluteUrl(`/poems?genre=${genre.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.55,
    })),
  ];
}
