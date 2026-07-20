import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "./scroll-reveal-container";
import { Audio } from "@prisma/client";

type AudioPromoSectionProps = {
  latestAudio: Audio | null;
};

export default function AudioPromoSection({ latestAudio }: AudioPromoSectionProps) {
  if (!latestAudio) return null;

  return (
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
  );
}
