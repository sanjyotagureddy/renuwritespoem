import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "./scroll-reveal-container";
import { HomepageCacheData } from "@/types/domain";

type FeaturedBookSectionProps = {
  featuredBook: HomepageCacheData["featuredBook"];
};

export default function FeaturedBookSection({ featuredBook }: FeaturedBookSectionProps) {
  if (!featuredBook) return null;

  return (
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
  );
}
