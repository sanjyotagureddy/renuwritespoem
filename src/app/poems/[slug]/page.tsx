import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  poemLanguageFontClass,
  poemLanguageLabel,
  poemLanguageToHtmlLang,
  type PoemLanguage,
} from "@/lib/poem-language";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(date: Date | null): string {
  if (!date) return "Unpublished";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

async function getPoemBySlug(slug: string) {
  return prisma.poem.findUnique({
    where: { slug },
    include: {
      genre: { select: { name: true, slug: true } },
      tags: { include: { tag: { select: { name: true, slug: true } } } },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const poem = await prisma.poem.findUnique({ where: { slug } });

  if (!poem || !poem.published) {
    return {
      title: "Poem Not Found",
      description: "The poem you are looking for does not exist.",
    };
  }

  return {
    title: poem.title,
    description: poem.excerpt ?? poem.content.slice(0, 140),
  };
}

export default async function PoemDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const poem = await getPoemBySlug(slug);

  if (!poem || !poem.published) {
    notFound();
  }

  const language = poem.language as PoemLanguage;
  const lang = poemLanguageToHtmlLang(language);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <Link
        href="/poems"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white/80 mb-10"
      >
        ← Back to Poems
      </Link>

      <article className="rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-10">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/80">
            {poemLanguageLabel(language)}
          </span>
          {poem.genre ? (
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-wider text-white/60">
              {poem.genre.name}
            </span>
          ) : null}
          <span className="ml-auto text-xs uppercase tracking-wider text-white/40">
            {formatDate(poem.publishedAt)}
          </span>
        </div>

        <h1 lang={lang} className={`text-4xl md:text-5xl text-white mb-4 ${poemLanguageFontClass(language)}`}>
          {poem.title}
        </h1>

        {poem.excerpt ? (
          <p
            lang={lang}
            className={`text-lg text-white/60 leading-relaxed mb-8 ${poemLanguageFontClass(language)}`}
          >
            {poem.excerpt}
          </p>
        ) : null}

        <div
          lang={lang}
          className={`text-white/85 whitespace-pre-line leading-loose text-lg ${poemLanguageFontClass(language)}`}
        >
          {poem.content}
        </div>

        {poem.tags.length > 0 ? (
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap gap-2">
            {poem.tags.map(({ tag }) => (
              <span
                key={tag.slug}
                className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] uppercase tracking-wider text-white/50"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
}
