import type { Metadata } from "next";
import Link from "next/link";
import { getPrisma } from "@/lib/db";
import {
  poemLanguageFontClass,
  poemLanguageOptions,
  poemLanguageLabel,
  poemLanguageToHtmlLang,
  type PoemLanguage,
} from "@/lib/poem-language";

type PoemsPageProps = {
  searchParams: Promise<{ language?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Poems",
  description:
    "Read poems by Renu across English, Hindi, and Marathi on love, nature, life, and solitude.",
};

function formatDate(date: Date | null): string {
  if (!date) return "Unpublished";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function PoemsPage({ searchParams }: PoemsPageProps) {
  const prisma = getPrisma();
  const params = await searchParams;
  const languageValue = Array.isArray(params.language)
    ? params.language[0]
    : params.language;

  const selectedLanguage = poemLanguageOptions.includes(languageValue as PoemLanguage)
    ? (languageValue as PoemLanguage)
    : "ALL";

  const poems = await prisma.poem.findMany({
    where:
      selectedLanguage === "ALL"
        ? { published: true }
        : { published: true, language: selectedLanguage },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: {
      genre: { select: { name: true, slug: true } },
      tags: { include: { tag: { select: { name: true, slug: true } } } },
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <div className="mb-12 md:mb-16">
        <p className="text-sm uppercase tracking-[0.22em] text-white/40 mb-3">Poetry Collection</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Poems</h1>
        <p className="text-lg text-white/60 max-w-3xl font-[family-name:var(--font-inter)]">
          Explore verses written in English, Hindi, and Marathi. Each poem carries its own mood,
          language, and rhythm.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          <Link
            href="/poems"
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
              selectedLanguage === "ALL"
                ? "border-white/40 bg-white/10 text-white"
                : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
            }`}
          >
            All
          </Link>

          {poemLanguageOptions.map((language) => (
            <Link
              key={language}
              href={`/poems?language=${language}`}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                selectedLanguage === language
                  ? "border-white/40 bg-white/10 text-white"
                  : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {poemLanguageLabel(language)}
            </Link>
          ))}
        </div>
      </div>

      {poems.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-10 text-center">
          <h2 className="text-2xl text-white mb-3">No poems published yet</h2>
          <p className="text-white/60 font-[family-name:var(--font-inter)]">
            {selectedLanguage === "ALL"
              ? "New poems will appear here as soon as they are published."
              : `No ${poemLanguageLabel(selectedLanguage)} poems are published yet.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {poems.map((poem) => {
            const language = poem.language as PoemLanguage;
            const lang = poemLanguageToHtmlLang(language);

            return (
              <article
                key={poem.id}
                className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] p-6 md:p-7 transition-colors hover:border-white/30"
              >
                <div className="mb-5 flex flex-wrap items-center gap-2">
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

                <h2 lang={lang} className={`text-2xl text-white mb-3 ${poemLanguageFontClass(language)}`}>
                  {poem.title}
                </h2>

                <p
                  lang={lang}
                  className={`text-white/65 leading-relaxed mb-6 line-clamp-4 font-[family-name:var(--font-inter)] ${poemLanguageFontClass(language)}`}
                >
                  {poem.excerpt ?? poem.content}
                </p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {poem.tags.slice(0, 3).map(({ tag }) => (
                    <span
                      key={tag.slug}
                      className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] uppercase tracking-wider text-white/50"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/poems/${poem.slug}`}
                  className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-white/85 hover:text-white"
                >
                  Read Poem
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
