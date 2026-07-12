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
import PageSizeSelect from "@/components/poems/page-size-select";
import SearchBar from "@/components/poems/search-bar";
import { getPoems } from "@/lib/poems-data";

type PoemsPageProps = {
  searchParams: Promise<{
    genre?: string | string[];
    language?: string | string[];
    page?: string | string[];
    size?: string | string[];
    sort?: string | string[];
    tag?: string | string[];
    q?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Poems",
  description:
    "Read poems by Renu across English, Hindi, and Marathi on love, nature, life, and solitude.",
  alternates: {
    canonical: "/poems",
  },
};

const PAGE_SIZE_OPTIONS = [6, 9, 12, 15] as const;
const DEFAULT_PAGE_SIZE = 9;
const SORT_OPTIONS = ["popular", "newest", "views"] as const;
type PoemSort = (typeof SORT_OPTIONS)[number];

import { formatDate, getReadingTime } from "@/lib/utils";

export default async function PoemsPage({ searchParams }: PoemsPageProps) {
  const prisma = getPrisma();
  const params = await searchParams;
  const languageValue = Array.isArray(params.language)
    ? params.language[0]
    : params.language;
  const genreValue = Array.isArray(params.genre)
    ? params.genre[0]
    : params.genre;
  const selectedGenreSlug = genreValue?.trim() || "";
  const tagValue = Array.isArray(params.tag)
    ? params.tag[0]
    : params.tag;
  const selectedTagSlug = tagValue?.trim() || "";

  const qValue = Array.isArray(params.q) ? params.q[0] : params.q;
  const searchQuery = qValue?.trim() || "";

  const sortValue = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const selectedSort: PoemSort = SORT_OPTIONS.includes(sortValue as PoemSort)
    ? (sortValue as PoemSort)
    : "popular";

  const selectedLanguage = poemLanguageOptions.includes(languageValue as PoemLanguage)
    ? (languageValue as PoemLanguage)
    : "ALL";

  const pageValue = Array.isArray(params.page) ? params.page[0] : params.page;
  const currentPage = Math.max(1, parseInt(pageValue ?? "1", 10) || 1);

  const sizeValue = Array.isArray(params.size) ? params.size[0] : params.size;
  const parsedSize = parseInt(sizeValue ?? "", 10);
  const perPage = PAGE_SIZE_OPTIONS.includes(parsedSize as (typeof PAGE_SIZE_OPTIONS)[number])
    ? parsedSize
    : DEFAULT_PAGE_SIZE;

  const [
    { poems, totalCount },
    selectedGenre,
    selectedTag,
    allGenres,
    allTags,
  ] = await Promise.all([
    getPoems({
      language: selectedLanguage,
      genreSlug: selectedGenreSlug,
      tagSlug: selectedTagSlug,
      sort: selectedSort,
      searchQuery: searchQuery,
      page: currentPage,
      perPage: perPage,
    }),
    selectedGenreSlug
      ? prisma.genre.findUnique({
          where: { slug: selectedGenreSlug },
          select: { name: true, slug: true },
        })
      : null,
    selectedTagSlug
      ? prisma.tag.findUnique({
          where: { slug: selectedTagSlug },
          select: { name: true, slug: true },
        })
      : null,
    prisma.genre.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
      take: 12,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  function buildPageUrl(page: number, size?: number) {
    const params = new URLSearchParams();
    if (selectedLanguage !== "ALL") params.set("language", selectedLanguage);
    if (selectedGenreSlug) params.set("genre", selectedGenreSlug);
    if (selectedTagSlug) params.set("tag", selectedTagSlug);
    if (selectedSort !== "popular") params.set("sort", selectedSort);
    if (searchQuery) params.set("q", searchQuery);
    if (page > 1) params.set("page", String(page));
    const s = size ?? perPage;
    if (s !== DEFAULT_PAGE_SIZE) params.set("size", String(s));
    const qs = params.toString();
    return `/poems${qs ? `?${qs}` : ""}`;
  }

  function buildFilterUrl({
    language = selectedLanguage,
    genre = selectedGenreSlug,
    tag = selectedTagSlug,
    sort = selectedSort,
    q = searchQuery,
  }: {
    language?: PoemLanguage | "ALL";
    genre?: string;
    tag?: string;
    sort?: PoemSort;
    q?: string;
  }) {
    const params = new URLSearchParams();
    if (language !== "ALL") params.set("language", language);
    if (genre) params.set("genre", genre);
    if (tag) params.set("tag", tag);
    if (sort !== "popular") params.set("sort", sort);
    if (q) params.set("q", q);
    if (perPage !== DEFAULT_PAGE_SIZE) params.set("size", String(perPage));
    const qs = params.toString();
    return `/poems${qs ? `?${qs}` : ""}`;
  }
  return (
    <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 overflow-hidden">
      {/* Premium Visual Background Glow Accent */}
      <div className="absolute -top-10 left-1/3 w-[35rem] h-[35rem] bg-amber-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="relative z-10 mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium tracking-wider text-amber-300 uppercase mb-4">
          <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
          Poetry Collection
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
          Poems
        </h1>
        <p className="text-lg text-white/60 max-w-3xl font-[family-name:var(--font-inter)] leading-relaxed">
          Explore verses written in English, Hindi, and Marathi. Each poem carries its own mood,
          language, and rhythm.
        </p>
        <div className="mt-6">
          <SearchBar />
        </div>

        {/* Sort & Stats row at the top */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {(selectedLanguage !== "ALL" || selectedGenreSlug || selectedTagSlug || searchQuery) ? (
              <>
                <span className="text-xs text-white/40 mr-1">Active:</span>
                {selectedLanguage !== "ALL" && (
                  <Link
                    href={buildFilterUrl({ language: "ALL" })}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
                  >
                    Language: {poemLanguageLabel(selectedLanguage)} ×
                  </Link>
                )}
                {selectedGenre && (
                  <Link
                    href={buildFilterUrl({ genre: "" })}
                    className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-xs text-amber-100/80 hover:border-amber-200/45 hover:text-amber-100"
                  >
                    Genre: {selectedGenre.name} ×
                  </Link>
                )}
                {selectedTag && (
                  <Link
                    href={buildFilterUrl({ tag: "" })}
                    className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-xs text-amber-100/80 hover:border-amber-200/45 hover:text-amber-100"
                  >
                    Tag: #{selectedTag.name} ×
                  </Link>
                )}
                {searchQuery && (
                  <Link
                    href={buildFilterUrl({ q: "" })}
                    className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-xs text-amber-100/80 hover:border-amber-200/45 hover:text-amber-100"
                  >
                    Search: &ldquo;{searchQuery}&rdquo; ×
                  </Link>
                )}
                <Link
                  href="/poems"
                  className="text-xs text-white/45 hover:text-white underline ml-2"
                >
                  Clear all
                </Link>
              </>
            ) : (
              <span className="text-xs text-white/40">Showing all poems</span>
            )}
          </div>

          <div className="flex items-center gap-4 sm:ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs tracking-[0.16em] text-white/30 uppercase">
                Sort
              </span>
              <Link
                href={buildFilterUrl({ sort: "popular" })}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                  selectedSort === "popular"
                    ? "border-amber-300/40 bg-amber-400/10 text-amber-100"
                    : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                Popular
              </Link>
              <Link
                href={buildFilterUrl({ sort: "views" })}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                  selectedSort === "views"
                    ? "border-amber-300/40 bg-amber-400/10 text-amber-100"
                    : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                Most Read
              </Link>
              <Link
                href={buildFilterUrl({ sort: "newest" })}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                  selectedSort === "newest"
                    ? "border-amber-300/40 bg-amber-400/10 text-amber-100"
                    : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                Newest
              </Link>
            </div>

            {totalCount > 0 && (
              <span className="text-xs text-white/30 border-l border-white/10 pl-4">
                {totalCount} poem{totalCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {poems.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-10 text-center mb-8">
          <h2 className="text-2xl text-white mb-3">No poems found</h2>
          <p className="text-white/60 font-[family-name:var(--font-inter)]">
            No poems match the selected filters. Try clearing some filters or refining below.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {poems.map((poem) => {
            const language = poem.language as PoemLanguage;
            const lang = poemLanguageToHtmlLang(language);

            return (
              <article
                key={poem.id}
                className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] p-6 md:p-7 transition-all duration-300 hover:border-amber-500/30 hover:bg-amber-500/[0.01] hover:shadow-lg hover:shadow-amber-500/[0.02] flex flex-col h-full"
              >
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <Link
                    href={buildFilterUrl({ language })}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/80 hover:bg-white/10 transition-colors"
                  >
                    {poemLanguageLabel(language)}
                  </Link>
                  {poem.genre ? (
                    <Link
                      href={buildFilterUrl({ genre: poem.genre.slug })}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-wider text-white/60 hover:border-white/30 transition-colors"
                    >
                      {poem.genre.name}
                    </Link>
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

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-white/40" title="Views">
                      <span>👁</span>
                      {poem.views}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/40" title="Likes">
                      <span>♡</span>
                      {poem._count.likes}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/40" title="Comments">
                      <span>💬</span>
                      {poem._count.comments}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {poem.tags.slice(0, 3).map(({ tag }) => (
                      <Link
                        key={tag.slug}
                        href={buildFilterUrl({ tag: tag.slug })}
                        className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] uppercase tracking-wider text-white/50 hover:border-white/25 hover:text-white transition-colors"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <span className="text-xs uppercase tracking-wider text-white/40" title="Reading time">
                    {getReadingTime(poem.content)}
                  </span>
                  <Link
                    href={`/poems/${poem.slug}`}
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-white/85 hover:text-amber-400 transition-all duration-300 hover:scale-105 origin-right"
                  >
                    Read Poem
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination + Page size (directly below grid) */}
      {(totalPages > 1 || totalCount > PAGE_SIZE_OPTIONS[0]) && (
        <div className="mt-8 flex items-center justify-between mb-16">
          <div className="flex-1" />
          {totalPages > 1 ? (
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-wider text-white/60 hover:text-white hover:border-white/30 transition-colors"
                >
                  ← Prev
                </Link>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={buildPageUrl(page)}
                  className={`rounded-full border px-3.5 py-2 text-xs transition-colors ${
                    page === currentPage
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/15 text-white/50 hover:text-white hover:border-white/30"
                  }`}
                >
                  {page}
                </Link>
              ))}

              {currentPage < totalPages && (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-wider text-white/60 hover:text-white hover:border-white/30 transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          ) : (
            <div />
          )}

          <div className="flex-1 flex justify-end">
            <PageSizeSelect current={perPage} />
          </div>
        </div>
      )}

      {/* Filters and sorting panel below poems list */}
      <div className="mt-16 border-t border-white/10 pt-10">
        <h2 className="text-xl tracking-wider text-white mb-6 uppercase">Filter & Sort Collection</h2>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 space-y-6">
          {/* Languages */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase tracking-[0.15em] text-white/40 min-w-[90px]">Language:</span>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildFilterUrl({ language: "ALL" })}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                  selectedLanguage === "ALL"
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                All
              </Link>
              {poemLanguageOptions.map((langOption) => (
                <Link
                  key={langOption}
                  href={buildFilterUrl({ language: langOption })}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                    selectedLanguage === langOption
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {poemLanguageLabel(langOption)}
                </Link>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase tracking-[0.15em] text-white/40 min-w-[90px]">Genre:</span>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildFilterUrl({ genre: "" })}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                  !selectedGenreSlug
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                All Genres
              </Link>
              {allGenres.map((genre) => (
                <Link
                  key={genre.slug}
                  href={buildFilterUrl({ genre: genre.slug })}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                    selectedGenreSlug === genre.slug
                      ? "border-amber-300/40 bg-amber-400/10 text-amber-100"
                      : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-[0.15em] text-white/40 min-w-[90px]">Tags:</span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildFilterUrl({ tag: "" })}
                  className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                    !selectedTagSlug
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                  }`}
                >
                  All Tags
                </Link>
                {allTags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={buildFilterUrl({ tag: tag.slug })}
                    className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                      selectedTagSlug === tag.slug
                        ? "border-amber-300/40 bg-amber-400/10 text-amber-100"
                        : "border-white/10 bg-black/20 text-white/50 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
