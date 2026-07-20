import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "./scroll-reveal-container";

export default function HeroSection() {
  return (
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
  );
}
