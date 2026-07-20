import { getPrisma } from "@/lib/db";
import { siteConfig } from "@/lib/seo";
import { getCache, setCache } from "@/lib/db/cache";
import TestimonialsSection from "@/components/home/testimonials-section";
import { Poem, Audio, AuthorGalleryImage } from "@prisma/client";
import { getPoemOfTheDay } from "@/lib/domain/poems-data";
import { ScrollSnapInitializer, ScrollReveal } from "@/components/home/scroll-reveal-container";
import Footer from "@/components/footer";
import { HomepageCacheData } from "@/types/domain";

import HeroSection from "@/components/home/hero-section";
import PoemOfTheDaySection from "@/components/home/poem-of-the-day-section";
import FeaturedBookSection from "@/components/home/featured-book-section";
import LatestPoemSection from "@/components/home/latest-poem-section";
import AudioPromoSection from "@/components/home/audio-promo-section";
import AuthorProfileSection from "@/components/home/author-profile-section";
import GalleryGridSection from "@/components/home/gallery-grid-section";

async function getHomepageData(): Promise<HomepageCacheData> {
  const cacheKey = "home:overhauled-data:v1";
  const cached = await getCache<HomepageCacheData>(cacheKey);
  if (cached) {
    const parseOptionalDate = (d: string | Date | null) => d ? new Date(d) : null;
    const parseRequiredDate = (d: string | Date) => new Date(d);

    const processPoem = (p: Poem & { genre: { name: string } | null; _count: { likes: number; comments: number } }) => ({
      ...p,
      publishedAt: parseOptionalDate(p.publishedAt),
      createdAt: parseRequiredDate(p.createdAt),
      updatedAt: parseRequiredDate(p.updatedAt),
    });

    const parsedData: HomepageCacheData = {
      ...cached,
      featuredPoems: cached.featuredPoems.map(processPoem),
      latestPoem: cached.latestPoem ? processPoem(cached.latestPoem) : null,
      poemOfTheDay: cached.poemOfTheDay ? processPoem(cached.poemOfTheDay) : null,
      latestAudio: cached.latestAudio
        ? {
            ...cached.latestAudio,
            publishedAt: parseOptionalDate(cached.latestAudio.publishedAt),
            createdAt: parseRequiredDate(cached.latestAudio.createdAt),
            updatedAt: parseRequiredDate(cached.latestAudio.updatedAt),
          }
        : null,
    };
    return parsedData;
  }

  const prisma = await getPrisma();

  const [featuredPoems, latestPoemRecord, featuredBook, latestAudio, testimonials, galleryPhotos, authorProfileRecord] = await Promise.all([
    prisma.poem.findMany({
      where: { published: true, featured: true },
      include: { genre: { select: { name: true } }, _count: { select: { likes: true, comments: true } } },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.poem.findFirst({
      where: { published: true },
      include: { genre: { select: { name: true } }, _count: { select: { likes: true, comments: true } } },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.book.findFirst({
      where: { status: "AVAILABLE", featured: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        price: true,
        discountedPrice: true,
      },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.audio.findFirst({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    }),
    Promise.resolve([] as { id: string; body: string; userName: string; userImage: string | null; targetTitle: string; targetLink: string; createdAt: Date }[]),
    prisma.authorGalleryImage.findMany({
      orderBy: { order: "asc" },
      take: 4,
    }),
    prisma.authorProfile.findFirst(),
  ]);

  const rawPoemOfTheDay = await getPoemOfTheDay();
  let poemOfTheDay = null;

  if (rawPoemOfTheDay) {
    poemOfTheDay = await prisma.poem.findUnique({
      where: { id: rawPoemOfTheDay.id },
      include: { genre: { select: { name: true } }, _count: { select: { likes: true, comments: true } } },
    });
  }

  const mappedTestimonials = testimonials.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  const data: HomepageCacheData = {
    featuredPoems,
    latestPoem: latestPoemRecord,
    poemOfTheDay,
    featuredBook: featuredBook ? {
      ...featuredBook,
      price: featuredBook.price?.toNumber() ?? null,
      discountedPrice: featuredBook.discountedPrice?.toNumber() ?? null
    } : null,
    latestAudio,
    testimonials: mappedTestimonials,
    galleryPhotos,
    authorProfile: authorProfileRecord ? {
      whyIWrite: authorProfileRecord.whyIWrite,
      writingJourney: authorProfileRecord.writingJourney,
    } : null,
  };

  await setCache(cacheKey, data, 3600); // 1 hour
  return data;
}

export default async function HomePage() {
  const data = await getHomepageData();

  const {
    latestPoem,
    poemOfTheDay,
    featuredBook,
    latestAudio,
    testimonials,
    galleryPhotos,
    authorProfile,
  } = data;

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "description": siteConfig.description,
    "author": {
      "@type": "Person",
      "name": "Renu",
    },
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Renu",
    "url": siteConfig.url,
    "image": `${siteConfig.url}/author.jpg`,
    "jobTitle": "Poet & Author",
    "description": "A poet and author exploring the beauty of nature, love, and solitude in English, Hindi, and Marathi.",
    "sameAs": [
      "https://instagram.com/renuwritespoem",
    ]
  };

  return (
    <>
      <ScrollSnapInitializer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema).replace(/</g, "\u003c") }}
      />

      <div className="h-[calc(100vh-72px)] w-full overflow-y-auto snap-y snap-mandatory scroll-smooth font-[family-name:var(--font-inter)] text-white/80 relative">
        {/* Glow Effects */}
        <div className="absolute top-20 left-1/4 w-[35rem] h-[35rem] bg-amber-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute top-[1200px] right-1/4 w-[35rem] h-[35rem] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

        <HeroSection />
        <PoemOfTheDaySection poemOfTheDay={poemOfTheDay} />
        <FeaturedBookSection featuredBook={featuredBook} />
        <LatestPoemSection latestPoem={latestPoem} />
        <AudioPromoSection latestAudio={latestAudio} />
        <AuthorProfileSection authorProfile={authorProfile} />

        {/* Reader Reviews Section */}
        {testimonials.length > 0 && (
          <section className="w-full min-h-[calc(100vh-72px)] snap-start flex flex-col justify-center border-b border-white/5 relative py-12">
            <ScrollReveal className="w-full">
              <TestimonialsSection testimonials={testimonials} />
            </ScrollReveal>
          </section>
        )}

        <GalleryGridSection galleryPhotos={galleryPhotos} />

        {/* Footer Slide */}
        <section className="w-full min-h-[calc(100vh-72px)] snap-start flex flex-col justify-end">
          <ScrollReveal className="w-full">
            <Footer forceShow={true} />
          </ScrollReveal>
        </section>
      </div>
    </>
  );
}
