import Image from "next/image";
import Link from "next/link";
import { getPrisma } from "@/lib/db";
import {
  poemLanguageFontClass,
  poemLanguageLabel,
  poemLanguageToHtmlLang,
  type PoemLanguage,
} from "@/lib/poem-language";

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function Home() {
  const prisma = getPrisma();

  const [featuredPoems, latestPoems, totalPoems] = await Promise.all([
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
  ]);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[calc(100vh-72px)] flex items-center px-6 py-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/bg-scenery.jpg"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/75" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-14 md:gap-20">
          <div className="shrink-0">
            <div className="w-52 h-52 md:w-72 md:h-72 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
              <Image
                src="/author.jpg"
                alt="Renu - Poet & Author"
                width={320}
                height={320}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>

          <div className="text-center md:text-left">
            <p className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.25em] text-white/40 mb-4">
              Poetry in three languages
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
              Renu Writes Poem
            </h1>
            <p className="font-[family-name:var(--font-inter)] text-lg md:text-xl text-white/65 mb-8 max-w-lg">
              Heartfelt verses on love, nature, life, and solitude — written in English, Hindi, and Marathi.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/poems"
                className="rounded-full border border-white/40 bg-white/10 px-8 py-3 text-sm uppercase tracking-[0.18em] text-white hover:bg-white/20 transition-colors"
              >
                Explore Poems
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-white/20 px-8 py-3 text-sm uppercase tracking-[0.18em] text-white/70 hover:text-white hover:border-white/40 transition-colors"
              >
                About Renu
              </Link>
            </div>

            <blockquote className="mt-10 font-[family-name:var(--font-playfair)] text-lg md:text-xl italic text-white/45 leading-relaxed">
              &ldquo;Where words bloom like wildflowers,<br />
              and every verse finds its home.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── Featured Poems ── */}
      {featuredPoems.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-3">Featured</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-white">
              Selected Poems
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {featuredPoems.map((poem) => {
              const language = poem.language as PoemLanguage;
              const lang = poemLanguageToHtmlLang(language);

              return (
                <Link
                  key={poem.id}
                  href={`/poems/${poem.slug}`}
                  className="group rounded-2xl border border-white/15 bg-white/[0.03] p-6 md:p-7 transition-colors hover:border-white/30"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/80">
                      {poemLanguageLabel(language)}
                    </span>
                  </div>

                  <h3
                    lang={lang}
                    className={`text-xl text-white mb-3 group-hover:text-white/90 ${poemLanguageFontClass(language)}`}
                  >
                    {poem.title}
                  </h3>

                  <p
                    lang={lang}
                    className={`text-white/55 leading-relaxed line-clamp-4 text-sm mb-5 ${poemLanguageFontClass(language)}`}
                  >
                    {poem.excerpt ?? poem.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-white/35">
                      <span className="flex items-center gap-1">
                        <span>♡</span> {poem._count.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>💬</span> {poem._count.comments}
                      </span>
                    </div>
                    <span className="text-xs uppercase tracking-[0.18em] text-white/60 group-hover:text-white transition-colors">
                      Read →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Latest Poems ── */}
      {latestPoems.length > 0 && (
        <section className="border-t border-white/8 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-3">Latest</p>
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-white">
                  Recent Poems
                </h2>
              </div>
              <Link
                href="/poems"
                className="hidden sm:inline-flex text-xs uppercase tracking-[0.18em] text-white/50 hover:text-white transition-colors"
              >
                View all {totalPoems} poems →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestPoems.map((poem) => {
                const language = poem.language as PoemLanguage;
                const lang = poemLanguageToHtmlLang(language);

                return (
                  <Link
                    key={poem.id}
                    href={`/poems/${poem.slug}`}
                    className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:border-white/25 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <h3
                        lang={lang}
                        className={`text-white text-base mb-1.5 truncate group-hover:text-white/90 ${poemLanguageFontClass(language)}`}
                      >
                        {poem.title}
                      </h3>
                      <p className="text-xs text-white/35">
                        {poemLanguageLabel(language)} • {formatDate(poem.publishedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 text-[11px] text-white/30 shrink-0 mt-1">
                      <span className="flex items-center gap-0.5">♡ {poem._count.likes}</span>
                      <span className="flex items-center gap-0.5">💬 {poem._count.comments}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/poems"
                className="text-sm text-white/50 hover:text-white uppercase tracking-wider"
              >
                View all poems →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Languages CTA ── */}
      <section className="border-t border-white/8 py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-[family-name:var(--font-inter)] text-sm md:text-base text-white/50 mb-6 tracking-wide">
            Poems written in
          </p>
          <div className="flex items-center justify-center gap-6 mb-8">
            <Link
              href="/poems?language=EN"
              className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-white/70 hover:text-white transition-colors"
              lang="en"
            >
              English
            </Link>
            <span className="text-white/20 text-2xl">·</span>
            <Link
              href="/poems?language=HI"
              className="font-devanagari text-2xl md:text-3xl text-white/70 hover:text-white transition-colors"
              lang="hi"
            >
              हिन्दी
            </Link>
            <span className="text-white/20 text-2xl">·</span>
            <Link
              href="/poems?language=MR"
              className="font-devanagari text-2xl md:text-3xl text-white/70 hover:text-white transition-colors"
              lang="mr"
            >
              मराठी
            </Link>
          </div>
          <Link
            href="/poems"
            className="inline-flex rounded-full border border-white/25 px-8 py-3 text-sm uppercase tracking-[0.18em] text-white/70 hover:text-white hover:border-white/40 transition-colors"
          >
            Browse all poems
          </Link>
        </div>
      </section>
    </>
  );
}
