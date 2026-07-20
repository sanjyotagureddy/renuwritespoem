import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import {
  poemLanguageLabel,
  poemLanguageToHtmlLang,
  type PoemLanguage,
} from "@/lib/poem-language";
import LikeButton from "@/components/poems/like-button";
import ListenButton from "@/components/poems/listen-button";
import CommentSection from "@/components/poems/comment-section";
import PoemReader from "@/components/poems/poem-reader";
import ShareButton from "@/components/ui/share-button";
import InviteModal from "@/components/ui/invite-modal";
import ViewTracker from "@/components/poems/view-tracker";
import SaveButton from "@/components/ui/save-button";
import PrintCardModal from "@/components/poems/print-card-modal";
import { siteConfig } from "@/lib/seo";
import { getCache, setCache } from "@/lib/cache";

import { Printer, Eye } from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

import { formatDate, getReadingTime } from "@/lib/utils";

import { Poem } from "@prisma/client";

type PoemWithRelations = Poem & {
  genre: { name: string; slug: string } | null;
  tags: Array<{ tagId: string; tag: { name: string; slug: string } }>;
};

async function getPoemBySlug(slug: string): Promise<PoemWithRelations | null> {
  const cacheKey = `poem:details:${slug}`;
  const cached = await getCache<PoemWithRelations>(cacheKey);
  if (cached) {
    if (cached.publishedAt) cached.publishedAt = new Date(cached.publishedAt);
    if (cached.createdAt) cached.createdAt = new Date(cached.createdAt);
    if (cached.updatedAt) cached.updatedAt = new Date(cached.updatedAt);
    return cached;
  }

  const prisma = getPrisma();
  const poem = await prisma.poem.findUnique({
    where: { slug },
    include: {
      genre: { select: { name: true, slug: true } },
      tags: { include: { tag: { select: { name: true, slug: true } } } },
    },
  });
  
  if (poem) {
    await setCache(cacheKey, poem, 86400); // Cache for 24 hours
  }
  return poem;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const poem = await getPoemBySlug(slug);

  if (!poem || !poem.published) {
    return {
      title: "Poem Not Found",
      description: "The poem you are looking for does not exist.",
    };
  }

  const description = poem.excerpt ?? (poem.content.slice(0, 150).trim() + "...");
  const tagsList = poem.tags.map((t) => t.tag.name);

  return {
    title: poem.title,
    description,
    alternates: {
      canonical: `/poems/${slug}`,
    },
    openGraph: {
      title: poem.title,
      description,
      type: "article",
      url: `/poems/${slug}`,
      publishedTime: poem.publishedAt?.toISOString(),
      modifiedTime: poem.updatedAt?.toISOString(),
      authors: [siteConfig.author],
      tags: tagsList,
    },
    twitter: {
      card: "summary_large_image",
      title: poem.title,
      description,
    },
  };
}

export default async function PoemDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const poem = await getPoemBySlug(slug);

  if (!poem) {
    notFound();
  }

  const session = await getServerAuthSession();
  const isAdmin = session?.user?.role === "ADMIN";

  if (!poem.published && !isAdmin) {
    notFound();
  }

  const prisma = getPrisma();
  const publishedDate = poem.publishedAt ?? poem.createdAt;

  const nextPoemWhere = {
    published: true,
    OR: [
      { publishedAt: { gt: publishedDate } },
      {
        publishedAt: publishedDate,
        createdAt: { gt: poem.createdAt },
      },
    ],
  };

  const prevPoemWhere = {
    published: true,
    OR: [
      { publishedAt: { lt: publishedDate } },
      {
        publishedAt: publishedDate,
        createdAt: { lt: poem.createdAt },
      },
    ],
  };

  // Next Poem Query:
  let nextPoem = null;
  if (poem.genreId) {
    nextPoem = await prisma.poem.findFirst({
      where: {
        ...nextPoemWhere,
        genreId: poem.genreId,
      },
      orderBy: [{ publishedAt: "asc" }, { createdAt: "asc" }],
      select: { title: true, slug: true },
    });
  }
  if (!nextPoem && poem.tags.length > 0) {
    const tagIds = poem.tags.map((t) => t.tagId);
    nextPoem = await prisma.poem.findFirst({
      where: {
        ...nextPoemWhere,
        tags: { some: { tagId: { in: tagIds } } },
      },
      orderBy: [{ publishedAt: "asc" }, { createdAt: "asc" }],
      select: { title: true, slug: true },
    });
  }
  if (!nextPoem) {
    nextPoem = await prisma.poem.findFirst({
      where: nextPoemWhere,
      orderBy: [{ publishedAt: "asc" }, { createdAt: "asc" }],
      select: { title: true, slug: true },
    });
  }

  // Previous Poem Query:
  let prevPoem = null;
  if (poem.genreId) {
    prevPoem = await prisma.poem.findFirst({
      where: {
        ...prevPoemWhere,
        genreId: poem.genreId,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { title: true, slug: true },
    });
  }
  if (!prevPoem && poem.tags.length > 0) {
    const tagIds = poem.tags.map((t) => t.tagId);
    prevPoem = await prisma.poem.findFirst({
      where: {
        ...prevPoemWhere,
        tags: { some: { tagId: { in: tagIds } } },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { title: true, slug: true },
    });
  }
  if (!prevPoem) {
    prevPoem = await prisma.poem.findFirst({
      where: prevPoemWhere,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { title: true, slug: true },
    });
  }

  const language = poem.language as PoemLanguage;
  const lang = poemLanguageToHtmlLang(language);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "headline": poem.title,
    "description": poem.excerpt ?? (poem.content.slice(0, 150).trim() + "..."),
    "text": poem.content,
    "author": {
      "@type": "Person",
      "name": siteConfig.author,
      "url": siteConfig.url
    },
    "genre": poem.genre?.name,
    "datePublished": poem.publishedAt?.toISOString(),
    "dateModified": poem.updatedAt?.toISOString(),
    "inLanguage": lang,
    "keywords": poem.tags.map((t) => t.tag.name).join(", "),
    "image": poem.coverImage
      ? (poem.coverImage.startsWith("http") ? poem.coverImage : `${siteConfig.url}${poem.coverImage}`)
      : `${siteConfig.url}/author.jpg`,
    "publisher": {
      "@type": "Person",
      "name": siteConfig.author,
      "url": siteConfig.url
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteConfig.url,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Poems",
        "item": `${siteConfig.url}/poems`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": poem.title,
        "item": `${siteConfig.url}/poems/${poem.slug}`,
      },
    ],
  };

  // Get the first line of the poem
  const openingLine = poem.content.split("\n").map(l => l.trim()).filter(l => l.length > 0)[0] ?? "";
  const shareText = `"${openingLine}"\n\nRead the full poem "${poem.title}" on Renu Writes Poem:`;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      {!poem.published && (
        <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300 font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>Admin Preview: This poem is currently a Draft and is not visible to the public.</span>
        </div>
      )}
      {poem.font && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(
            poem.font
          )}:wght@300;400;500;600;700;800&display=swap`}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\u003c") }}
      />
      <Link
        href="/poems"
        className="mb-10 inline-flex items-center gap-2 text-xs tracking-[0.2em] text-white/50 uppercase hover:text-white/80"
      >
        ← Back to Poems
      </Link>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px]">
        {/* Poem content */}
        <article className="rounded-3xl border border-amber-100/15 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.06),transparent_42%),rgba(255,255,255,0.03)] p-7 shadow-2xl shadow-black/20 md:p-12">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs tracking-wider text-white/80 uppercase">
              {poemLanguageLabel(language)}
            </span>
            {poem.genre ? (
              <span className="rounded-full border border-white/15 px-3 py-1 text-xs tracking-wider text-white/60 uppercase">
                {poem.genre.name}
              </span>
            ) : null}
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-wider text-white/50 uppercase">
              {getReadingTime(poem.content)}
            </span>
            <span className="ml-auto text-xs tracking-wider text-white/40 uppercase">
              {formatDate(poem.publishedAt)}
            </span>
          </div>

          {poem.coverImage && (
            <div className="relative w-full h-64 md:h-[400px] mb-8 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
              <Image
                src={poem.coverImage}
                alt={poem.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="mt-8">
            <PoemReader
              title={poem.title}
              content={poem.content}
              excerpt={poem.excerpt}
              font={poem.font}
              language={language}
              lang={lang}
            />
          </div>

          {poem.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-8">
              {poem.tags.map(({ tag }) => (
                <span
                  key={tag.slug}
                  className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] tracking-wider text-white/50 uppercase"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : null}

          {/* Previous/Next Navigation */}
          {(prevPoem || nextPoem) && (
            <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/10 pt-8">
              {prevPoem ? (
                <Link
                  href={`/poems/${prevPoem.slug}`}
                  className="group flex flex-col items-start text-left max-w-[45%]"
                >
                  <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1 group-hover:text-white/60">
                    ← Previous Poem
                  </span>
                  <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate w-full">
                    {prevPoem.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextPoem ? (
                <Link
                  href={`/poems/${nextPoem.slug}`}
                  className="group flex flex-col items-end text-right max-w-[45%]"
                >
                  <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1 group-hover:text-white/60">
                    Next Poem →
                  </span>
                  <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate w-full">
                    {nextPoem.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          )}
        </article>

        {/* Sidebar — Likes & Comments */}
        <aside className="lg:sticky lg:top-[96px]">
          <div className="space-y-6 rounded-2xl border border-white/15 bg-white/[0.03] p-5">
            {/* Engagement Stats Header */}
            <div className="flex items-center justify-between text-xs text-white/50 border-b border-white/10 pb-3">
              <span className="flex items-center gap-1.5 font-medium text-white/60">
                <Eye className="w-3.5 h-3.5 text-white/40" />
                {(poem.views ?? 0).toLocaleString()} {poem.views === 1 ? "Read" : "Reads"}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-amber-300/90">
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                {poem.downloadCount ?? 0} {poem.downloadCount === 1 ? "Card Gifted" : "Cards Gifted"}
              </span>
            </div>

            {/* Action Bar: Save & Like side-by-side in equal grid */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <SaveButton slug={poem.slug} type="poem" />
              <LikeButton slug={poem.slug} />
            </div>

            <ListenButton content={poem.content} title={poem.title} language={language} />
            <ShareButton
              shareUrl={`${siteConfig.url}/poems/${poem.slug}`}
              title={poem.title}
              shareText={shareText}
              accentClass="text-amber-400 hover:bg-amber-500/10 border-amber-500/30 bg-amber-500/5"
            />
            <PrintCardModal slug={poem.slug} poemTitle={poem.title} content={poem.content} />
            <InviteModal
              poemId={poem.id}
              accentClass="text-amber-400 border-amber-500/30"
              buttonAccent="border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300"
            />
            <div className="border-t border-white/10 pt-5">
              <CommentSection slug={poem.slug} />
            </div>
          </div>
        </aside>
      </div>
      <ViewTracker poemId={poem.id} />
    </div>
  );
}
