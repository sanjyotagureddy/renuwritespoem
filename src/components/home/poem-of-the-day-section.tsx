import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal-container";
import { poemLanguageLabel } from "@/lib/domain/poem-language";
import { Poem } from "@prisma/client";

type PoemOfTheDay = Poem & {
  genre: { name: string } | null;
  _count: { likes: number; comments: number };
};

type PoemOfTheDaySectionProps = {
  poemOfTheDay: PoemOfTheDay | null;
};

export default function PoemOfTheDaySection({ poemOfTheDay }: PoemOfTheDaySectionProps) {
  if (!poemOfTheDay) return null;

  return (
    <section className="w-full min-h-[calc(100vh-72px)] snap-start flex flex-col justify-center border-b border-white/5 relative group py-12">
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
  );
}
