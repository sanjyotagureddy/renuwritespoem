import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal-container";

type AuthorProfileSectionProps = {
  authorProfile: {
    whyIWrite: string | null;
    writingJourney: string | null;
  } | null;
};

export default function AuthorProfileSection({ authorProfile }: AuthorProfileSectionProps) {
  if (!authorProfile) return null;

  return (
    <section className="w-full min-h-[calc(100vh-72px)] snap-start flex flex-col justify-center border-b border-white/5 relative py-12 text-center space-y-8">
      <ScrollReveal className="mx-auto max-w-4xl px-6 w-full">
        <div>
          <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold mb-2">
            The Poet
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-playfair)] text-white">
            About the Author
          </h2>
        </div>
        <div className="space-y-6 font-light leading-relaxed text-base md:text-lg max-w-2xl mx-auto my-6">
          <p className="text-white/80 font-serif italic text-xl">
            &ldquo;{authorProfile.whyIWrite}&rdquo;
          </p>
          <p className="text-white/50 text-sm md:text-base font-[family-name:var(--font-inter)] leading-7">
            {authorProfile.writingJourney}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white/90 hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            Read Renu&apos;s Full Story
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
