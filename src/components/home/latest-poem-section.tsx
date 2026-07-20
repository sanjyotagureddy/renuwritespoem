import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal-container";
import { poemLanguageLabel } from "@/lib/domain/poem-language";
import { Poem } from "@prisma/client";

type LatestPoem = Poem & {
  genre: { name: string } | null;
  _count: { likes: number; comments: number };
};

type LatestPoemSectionProps = {
  latestPoem: LatestPoem | null;
};

export default function LatestPoemSection({ latestPoem }: LatestPoemSectionProps) {
  if (!latestPoem) return null;

  return (
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
  );
}
