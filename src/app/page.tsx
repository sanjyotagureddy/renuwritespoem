import { getPrisma } from "@/lib/db";
import { siteConfig } from "@/lib/seo";
import { getCache, setCache } from "@/lib/cache";
import SlidingBanner from "@/components/home/sliding-banner";
import TestimonialsSection from "@/components/home/testimonials-section";

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
  testimonials: Array<{
    id: string;
    body: string;
    userName: string;
    targetTitle: string;
    targetLink: string;
    createdAt: string;
  }>;
};

async function getHomepageData(): Promise<HomepageCacheData> {
  const cacheKey = "home:featured-data:v3";
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
      testimonials: cached.testimonials ?? [],
    };
  }

  const prisma = getPrisma();
  const [featuredPoems, latestPoems, totalPoems, featuredBooks, totalBooks, latestAudio, poemComments, bookComments] =
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
      prisma.comment.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          user: { select: { name: true } },
          poem: { select: { title: true, slug: true } }
        }
      }),
      prisma.bookComment.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          user: { select: { name: true } },
          book: { select: { title: true, slug: true } }
        }
      })
    ]);

  const testimonials = [
    ...poemComments.map(c => ({
      id: c.id,
      body: c.body,
      userName: c.user?.name ?? "Anonymous Reader",
      targetTitle: c.poem.title,
      targetLink: `/poems/${c.poem.slug}`,
      createdAt: c.createdAt.toISOString()
    })),
    ...bookComments.map(c => ({
      id: c.id,
      body: c.body,
      userName: c.user?.name ?? "Anonymous Reader",
      targetTitle: c.book.title,
      targetLink: `/books/${c.book.slug}`,
      createdAt: c.createdAt.toISOString()
    }))
  ]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 4);

  const data = {
    featuredPoems,
    latestPoems,
    totalPoems,
    featuredBooks,
    totalBooks,
    latestAudio,
    testimonials,
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

  const { featuredPoems, featuredBooks, latestAudio, testimonials } =
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
      <TestimonialsSection testimonials={testimonials} />
    </>
  );
}
