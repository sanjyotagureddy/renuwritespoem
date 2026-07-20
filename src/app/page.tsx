import Image from "next/image";
import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { siteConfig } from "@/lib/seo";
import { getCache, setCache } from "@/lib/cache";
import TestimonialsSection from "@/components/home/testimonials-section";
import { Poem, Audio, AuthorProfile, AuthorGalleryImage } from "@prisma/client";
import { poemLanguageLabel } from "@/lib/poem-language";
import { getPoemOfTheDay } from "@/lib/poems-data";
import { ScrollSnapInitializer, ScrollReveal } from "@/components/home/scroll-reveal-container";
import Footer from "@/components/footer";

type HomepageCacheData = {
  featuredPoems: Array<Poem & { genre: { name: string } | null; _count: { likes: number; comments: number } }>;
  latestPoem: (Poem & { genre: { name: string } | null; _count: { likes: number; comments: number } }) | null;
  poemOfTheDay: (Poem & { genre: { name: string } | null; _count: { likes: number; comments: number } }) | null;
  featuredBook: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    coverImage: string | null;
    price: number | null | { toString(): string };
    discountedPrice: number | null | { toString(): string };
  } | null;
  latestAudio: Audio | null;
  testimonials: Array<{
    id: string;
    body: string;
    userName: string;
    userImage?: string | null;
    targetTitle: string;
    targetLink: string;
    createdAt: string;
  }>;
  galleryPhotos: Array<AuthorGalleryImage>;
  authorProfile: {
    whyIWrite: string | null;
    writingJourney: string | null;
  } | null;
};

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

    return {
      featuredPoems: cached.featuredPoems.map(processPoem),
      latestPoem: cached.latestPoem ? processPoem(cached.latestPoem) : null,
      poemOfTheDay: cached.poemOfTheDay ? processPoem(cached.poemOfTheDay) : null,
      featuredBook: cached.featuredBook,
      latestAudio: cached.latestAudio
        ? {
            ...cached.latestAudio,
            publishedAt: parseOptionalDate(cached.latestAudio.publishedAt),
            createdAt: parseRequiredDate(cached.latestAudio.createdAt),
            updatedAt: parseRequiredDate(cached.latestAudio.updatedAt),
          }
        : null,
      testimonials: cached.testimonials ?? [],
      galleryPhotos: cached.galleryPhotos ?? [],
      authorProfile: cached.authorProfile ?? null,
    };
  }

  const prisma = getPrisma();
  const [
    featuredPoems,
    latestPoems,
    poemOfTheDay,
    featuredBooks,
    latestAudios,
    poemComments,
    bookComments,
    audioComments,
    galleryPhotos,
    authorProfile,
  ] = await Promise.all([
    prisma.poem.findMany({
      where: { featured: true, published: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: {
        genre: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.poem.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 1,
      include: {
        genre: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    getPoemOfTheDay(),
    prisma.book.findMany({
      where: { featured: true, status: "AVAILABLE" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 1,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        price: true,
        discountedPrice: true,
      },
    }),
    prisma.audio.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 1,
    }),
    prisma.comment.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, image: true } },
        poem: { select: { title: true, slug: true } },
      },
    }),
    prisma.bookComment.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, image: true } },
        book: { select: { title: true, slug: true } },
      },
    }),
    prisma.audioComment.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, image: true } },
        audio: { select: { title: true, slug: true } },
      },
    }),
    prisma.authorGalleryImage.findMany({
      orderBy: { order: "asc" },
      take: 4,
    }),
    prisma.authorProfile.findFirst({
      select: {
        whyIWrite: true,
        writingJourney: true,
      },
    }),
  ]);

  const testimonials = [
    ...poemComments.map((c) => ({
      id: c.id,
      body: c.body,
      userName: c.user?.name ?? "Anonymous Reader",
      userImage: c.user?.image,
      targetTitle: c.poem.title,
      targetLink: `/poems/${c.poem.slug}`,
      createdAt: c.createdAt.toISOString(),
      pinned: c.pinned,
    })),
    ...bookComments.map((c) => ({
      id: c.id,
      body: c.body,
      userName: c.user?.name ?? "Anonymous Reader",
      userImage: c.user?.image,
      targetTitle: c.book.title,
      targetLink: `/books/${c.book.slug}`,
      createdAt: c.createdAt.toISOString(),
      pinned: c.pinned,
    })),
    ...audioComments.map((c) => ({
      id: c.id,
      body: c.body,
      userName: c.user?.name ?? "Anonymous Reader",
      userImage: c.user?.image,
      targetTitle: c.audio.title,
      targetLink: `/audio/${c.audio.slug}`,
      createdAt: c.createdAt.toISOString(),
      pinned: c.pinned,
    })),
  ]
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 15);

  const data = {
    featuredPoems,
    latestPoom: latestPoems.length > 0 ? latestPoems[0] : null, // spelling match helper
    latestPoem: latestPoems.length > 0 ? latestPoems[0] : null,
    poemOfTheDay,
    featuredBook: featuredBooks.length > 0 ? featuredBooks[0] : null,
    latestAudio: latestAudios.length > 0 ? latestAudios[0] : null,
    testimonials,
    galleryPhotos,
    authorProfile,
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
    "sameAs": [siteConfig.instagram, siteConfig.blog],
    "jobTitle": "Poet & Author",
  };

  const { latestPoem, poemOfTheDay, featuredBook, latestAudio, testimonials, galleryPhotos, authorProfile } =
    await getHomepageData();

  // Helper for gallery images base64 fallback
  const getImgSrc = (img: AuthorGalleryImage) => {
    if (img.url) return img.url;
    if (img.fileData && img.fileMime) {
      return `data:${img.fileMime};base64,${img.fileData}`;
    }
    return "/placeholder.jpg";
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

        {/* 1. Hero Section */}
        <section className="w-full min-h-[calc(100vh-72px)] snap-start flex items-center border-b border-white/5 relative py-12">
          <ScrollReveal className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full">
                Poetry &amp; Stories in Three Languages
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white font-[family-name:var(--font-playfair)] leading-tight">
                Renu Writes Poem
              </h1>
              <p className="text-lg md:text-xl text-white/60 leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
                A visual and literary sanctuary of heartfelt verses, spoken-word recordings, and published books — exploring the quiet beauty of love, nature, life, and solitude in English, Hindi, and Marathi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start pt-4">
                <Link
                  href="/poems"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-xs font-bold uppercase tracking-wider text-black hover:bg-white/95 transition-all active:scale-95 shadow-xl shadow-white/5"
                >
                  Explore Poems
                </Link>
                <Link
                  href="/about"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white/5 border border-white/15 px-8 py-4 text-xs font-bold uppercase tracking-wider text-white/90 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                  Biography &amp; Story
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-transparent to-transparent z-10 pointer-events-none" />
                <Image
                  src="/author.jpg"
                  alt="Renu - Poet &amp; Author"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 280px, 384px"
                />
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Poem of the Day Section */}
        {poemOfTheDay && (
          <section className="w-full min-h-[calc(100vh-72px)] snap-start flex flex-col justify-center border-b border-white/5 relative group py-12">
            {/* Ambient background glow for this section */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-rose-500/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />

            <ScrollReveal className="w-full">
              <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 px-3.5 py-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-widest animate-pulse">
                  ✨ Poem of the Day
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-playfair)] text-white">
                  Daily Verse Inspiration
                </h2>
                <p className="text-sm text-white/50 font-[family-name:var(--font-inter)] font-light max-w-xl mx-auto">
                  A handpicked poem from Renu&apos;s collections, changing automatically every twenty-four hours.
                </p>
              </div>

              <div className="relative rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-sm p-8 md:p-12 hover:border-white/15 transition-all duration-500 max-w-4xl mx-auto shadow-2xl hover:shadow-rose-500/[0.02]">
                {/* Inner card border shine */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-rose-500/5 via-transparent to-transparent pointer-events-none -z-10" />
                
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded bg-rose-500/15 border border-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-400 uppercase tracking-wider">
                      {poemLanguageLabel(poemOfTheDay.language)}
                    </span>
                    {poemOfTheDay.genre?.name && (
                      <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/50 uppercase tracking-wider">
                        {poemOfTheDay.genre.name}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4 max-w-2xl">
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white font-[family-name:var(--font-playfair)] tracking-wide">
                      {poemOfTheDay.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed font-light text-base md:text-lg font-[family-name:var(--font-inter)] italic whitespace-pre-line max-w-xl mx-auto">
                      &quot;{poemOfTheDay.excerpt ||
                        (poemOfTheDay.content.length > 250
                          ? poemOfTheDay.content.slice(0, 250).trim() + "..."
                          : poemOfTheDay.content)}&quot;
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/40 font-[family-name:var(--font-inter)]">
                    <span>❤️ {poemOfTheDay._count.likes} Likes</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>💬 {poemOfTheDay._count.comments} Comments</span>
                  </div>

                  <div className="pt-4">
                    <Link
                      href={`/poems/${poemOfTheDay.slug}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                    >
                      Read Full Poem
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* 2. Featured Book Section */}
        {featuredBook && (
          <section className="w-full min-h-[calc(100vh-72px)] snap-start flex flex-col justify-center border-b border-white/5 relative py-12">
            <ScrollReveal className="mx-auto max-w-7xl px-6 w-full">
              <div className="mb-12 text-center lg:text-left">
                <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-2">
                  Featured Release
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-playfair)] text-white">
                  Books &amp; Anthologies
                </h2>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.01] p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center hover:border-white/15 transition-all duration-300">
                <div className="lg:col-span-4 flex justify-center">
                  <Link
                    href={`/books/${featuredBook.slug}`}
                    className="relative block w-56 aspect-[3/4] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-955 group shrink-0"
                  >
                    {featuredBook.coverImage ? (
                      <Image
                        src={featuredBook.coverImage}
                        alt={featuredBook.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="224px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-5xl">
                        📖
                      </div>
                    )}
                  </Link>
                </div>
                <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
                  <div className="space-y-2">
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Available Now
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-playfair)]">
                      {featuredBook.title}
                    </h3>
                  </div>
                  <p className="text-white/60 leading-relaxed font-light text-sm md:text-base font-[family-name:var(--font-inter)] max-w-2xl mx-auto lg:mx-0">
                    {featuredBook.description ||
                      "Explore Renu's published collections. Step into a world of printed words, available for home delivery."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2">
                    <Link
                      href={`/books/${featuredBook.slug}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-emerald-400 transition-all shadow-lg hover:shadow-emerald-500/10"
                    >
                      Order Physical Book
                    </Link>
                    <Link
                      href="/books"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all"
                    >
                      View All Books
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* 3. Latest Poem Section */}
        {latestPoem && (
          <section className="w-full min-h-[calc(100vh-72px)] snap-start flex flex-col justify-center border-b border-white/5 relative py-12">
            <ScrollReveal className="mx-auto max-w-7xl px-6 w-full">
              <div className="mb-12 text-center lg:text-left">
                <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold mb-2">
                  Recent Verses
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-playfair)] text-white">
                  Latest Poem
                </h2>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.01] p-8 md:p-12 space-y-6 hover:border-white/15 transition-all duration-300">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400 uppercase">
                    {poemLanguageLabel(latestPoem.language)}
                  </span>
                  {latestPoem.genre?.name && (
                    <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/50 uppercase">
                      {latestPoem.genre.name}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-playfair)]">
                    {latestPoem.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed font-light text-sm md:text-base font-[family-name:var(--font-inter)] max-w-3xl italic">
                    &quot;{latestPoem.excerpt ||
                      (latestPoem.content.length > 200
                        ? latestPoem.content.slice(0, 200) + "..."
                        : latestPoem.content)}&quot;
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center pt-4">
                  <Link
                    href={`/poems/${latestPoem.slug}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/10"
                  >
                    Read Full Poem
                  </Link>
                  <Link
                    href="/poems"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Browse Poems Directory
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* 4. Listen to a Poem (Audio Player Promo) */}
        {latestAudio && (
          <section className="w-full min-h-[calc(100vh-72px)] snap-start flex flex-col justify-center border-b border-white/5 relative py-12">
            <ScrollReveal className="mx-auto max-w-7xl px-6 w-full">
              <div className="mb-12 text-center lg:text-left">
                <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-violet-400 font-semibold mb-2">
                  Spoken Word
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-playfair)] text-white">
                  Listen to a Poem
                </h2>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.01] p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center hover:border-white/15 transition-all duration-300">
                <div className="lg:col-span-4 flex justify-center">
                  <div className="relative w-44 h-44 rounded-2xl overflow-hidden border border-white/15 bg-neutral-900 flex items-center justify-center shadow-xl">
                    {latestAudio.coverUrl ? (
                      <Image
                        src={latestAudio.coverUrl}
                        alt={latestAudio.title}
                        fill
                        className="object-cover"
                        sizes="176px"
                      />
                    ) : (
                      <span className="text-5xl select-none">📻</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-4xl text-white select-none transition-transform duration-300 hover:scale-110">
                        ▶
                      </span>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-6 text-center lg:text-left font-[family-name:var(--font-inter)]">
                  <div className="space-y-2">
                    <span className="rounded bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                      Audio Recording
                    </span>
                    <h3 className="text-2xl font-bold text-white font-[family-name:var(--font-playfair)]">
                      {latestAudio.title}
                    </h3>
                  </div>
                  <p className="text-white/60 leading-relaxed font-light text-sm max-w-xl mx-auto lg:mx-0">
                    {latestAudio.description ||
                      "Listen to Spoken Word recordings of Renu's recitations, backing music, and multilingual soundscapes."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2">
                    <Link
                      href="/audio"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-violet-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-violet-400 transition-all shadow-lg hover:shadow-violet-500/10"
                    >
                      Open Audio Suite
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* 5. About the Author */}
        {authorProfile && (
          <section className="w-full min-h-[calc(100vh-72px)] snap-start flex flex-col justify-center border-b border-white/5 relative py-12 text-center space-y-8">
            <ScrollReveal className="mx-auto max-w-4xl px-6 w-full">
              <div>
                <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold mb-2">
                  The Poet
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-playfair)] text-white">
                  About the Author
                </h2>
              </div>
              <div className="space-y-6 font-light leading-relaxed text-base md:text-lg max-w-2xl mx-auto my-6">
                <p className="text-white/80 font-serif italic text-xl">
                  &ldquo;{authorProfile.whyIWrite}&rdquo;
                </p>
                <p className="text-white/50 text-sm md:text-base font-[family-name:var(--font-inter)] leading-7">
                  {authorProfile.writingJourney}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white/90 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                  Read Renu&apos;s Full Story
                </Link>
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* 6. Reader Reviews Section */}
        {testimonials.length > 0 && (
          <section className="w-full min-h-[calc(100vh-72px)] snap-start flex flex-col justify-center border-b border-white/5 relative py-12">
            <ScrollReveal className="w-full">
              <TestimonialsSection testimonials={testimonials} />
            </ScrollReveal>
          </section>
        )}

        {/* 7. Instagram/Gallery Grid */}
        {galleryPhotos.length > 0 && (
          <section className="w-full min-h-[calc(100vh-72px)] snap-start flex flex-col justify-center border-b border-white/5 relative py-12">
            <ScrollReveal className="mx-auto max-w-7xl px-6 w-full">
              <div className="mb-12 text-center lg:text-left flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold mb-2">
                    Captured Moments
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-playfair)] text-white">
                    Sanctuary Desk &amp; Highlights
                  </h2>
                </div>
                <Link
                  href="/gallery"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider shrink-0 self-center sm:self-end font-[family-name:var(--font-inter)]"
                >
                  Explore Full Gallery &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryPhotos.map((img) => (
                  <Link
                    key={img.id}
                    href="/gallery"
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-neutral-900/30 block"
                  >
                    <Image
                      src={getImgSrc(img)}
                      alt={img.caption || "Sanctuary Highlights"}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    {img.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
                        <p className="text-[10px] text-white/90 font-[family-name:var(--font-inter)] truncate">
                          {img.caption}
                        </p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          </section>
        )}

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
