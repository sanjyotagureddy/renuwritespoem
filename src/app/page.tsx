import { getPrisma } from "@/lib/db";
import { siteConfig } from "@/lib/seo";
import { getCache, setCache } from "@/lib/cache";
import SlidingBanner from "@/components/home/sliding-banner";

import { Poem, Audio } from "@prisma/client";

type HomepageCacheData = {
  featuredPoems: Array<Poem & { _count: { likes: number; comments: number } }>;
  latestPoems: Array<Poem & { _count: { likes: number; comments: number } }>;
  totalPoems: number;
  featuredBooks: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    coverImage: string | null;
    price: number | null | { toString(): string };
    discountedPrice: number | null | { toString(): string };
    shippingCharge: number | null | { toString(): string };
    _count: { likes: number; comments: number };
  }>;
  totalBooks: number;
  latestAudio: Array<Audio>;
};

async function getHomepageData(): Promise<HomepageCacheData> {
  const cacheKey = "home:featured-data";
  const cached = await getCache<HomepageCacheData>(cacheKey);
  if (cached) {
    const parseOptionalDate = (d: string | Date | null) => d ? new Date(d) : null;
    const parseRequiredDate = (d: string | Date) => new Date(d);
    
    const processPoem = (p: Poem & { _count: { likes: number; comments: number } }) => ({
      ...p,
      publishedAt: parseOptionalDate(p.publishedAt),
      createdAt: parseRequiredDate(p.createdAt),
      updatedAt: parseRequiredDate(p.updatedAt),
    });
    return {
      featuredPoems: cached.featuredPoems.map(processPoem),
      latestPoems: cached.latestPoems.map(processPoem),
      totalPoems: cached.totalPoems,
      featuredBooks: cached.featuredBooks,
      totalBooks: cached.totalBooks,
      latestAudio: (cached.latestAudio ?? []).map((s) => ({
        ...s,
        publishedAt: parseOptionalDate(s.publishedAt),
        createdAt: parseRequiredDate(s.createdAt),
        updatedAt: parseRequiredDate(s.updatedAt),
      })),
    };
  }

  const prisma = getPrisma();
  const [featuredPoems, latestPoems, totalPoems, featuredBooks, totalBooks, latestAudio] =
    await Promise.all([
      prisma.poem.findMany({
        where: { featured: true, published: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
        include: { _count: { select: { likes: true, comments: true } } },
      }),
      prisma.poem.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 6,
        include: { _count: { select: { likes: true, comments: true } } },
      }),
      prisma.poem.count({ where: { published: true } }),
      prisma.book.findMany({
        where: { featured: true, status: "AVAILABLE" },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 3,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          price: true,
          discountedPrice: true,
          shippingCharge: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.book.count({ where: { status: "AVAILABLE" } }),
      prisma.audio.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
    ]);

  const data = {
    featuredPoems,
    latestPoems,
    totalPoems,
    featuredBooks,
    totalBooks,
    latestAudio,
  };
  
  await setCache(cacheKey, data, 3600); // cache for 1 hour
  return data;
}

export default async function Home() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "description": siteConfig.description,
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": siteConfig.author,
    "url": siteConfig.url,
    "image": `${siteConfig.url}/author.jpg`,
    "description": "A poet and author who weaves words into heartfelt verses on love, nature, life, and spirituality.",
    "sameAs": [
      siteConfig.instagram,
      siteConfig.blog
    ],
    "jobTitle": "Poet & Author"
  };

  const { featuredPoems, featuredBooks, latestAudio } =
    await getHomepageData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <SlidingBanner
        featuredBooks={featuredBooks}
        latestAudio={latestAudio}
        featuredPoems={featuredPoems}
      />
    </>
  );
}
