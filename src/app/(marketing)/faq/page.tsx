import type { Metadata } from "next";
import Link from "next/link";
import LegalFooterNav from "@/components/ui/legal-footer-nav";

export const metadata: Metadata = {
  title: "FAQ | Readers Ask",
  description:
    "Frequently asked questions from readers of Renu Writes Poem. Find answers on collaborations, book purchases, invitations, and more.",
  alternates: {
    canonical: "/faq",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FAQPage() {
  return (
    <div className="relative max-w-3xl mx-auto px-6 py-16 md:py-24 overflow-hidden font-[family-name:var(--font-inter)]">
      {/* Background Glow Accent */}
      <div className="absolute -top-24 left-1/4 w-[30rem] h-[30rem] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="mb-12 text-center sm:text-left">
        <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold mb-3">
          Frequently Asked Questions
        </span>
        <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-playfair)] text-white mb-4">
          Readers Ask
        </h1>
        <p className="text-sm text-white/55 leading-7 max-w-xl">
          Find answers to common questions about collaborations, invitations, ordering signed books, and how to get in touch.
        </p>
      </div>

      {/* FAQ Items Accordion */}
      <div className="space-y-4 mb-16">
        <details className="group rounded-2xl border border-white/5 bg-white/[0.01] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]">
          <summary className="flex items-center justify-between cursor-pointer list-none text-base font-semibold text-white/90 hover:text-white [&::-webkit-details-marker]:hidden">
            <span>When did you start writing?</span>
            <span className="text-amber-400 text-xs transition-transform duration-300 group-open:rotate-180">
              ▼
            </span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-white/60 font-[family-name:var(--font-inter)] border-t border-white/5 pt-4">
            Writing has been my companion since childhood—a silent medium to translate the whispers of my heart into words. What began as simple musings evolved over the years into a deep-seated passion for storytelling and poetry.
          </p>
        </details>

        <details className="group rounded-2xl border border-white/5 bg-white/[0.01] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]">
          <summary className="flex items-center justify-between cursor-pointer list-none text-base font-semibold text-white/90 hover:text-white [&::-webkit-details-marker]:hidden">
            <span>Can I collaborate?</span>
            <span className="text-amber-400 text-xs transition-transform duration-300 group-open:rotate-180">
              ▼
            </span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-white/60 font-[family-name:var(--font-inter)] border-t border-white/5 pt-4">
            Yes, I always welcome creative collaborations with fellow poets, writers, musicians, and artists. If you have an idea that blends words, sound, or visuals into a unique creative experience, please reach out.
          </p>
        </details>

        <details className="group rounded-2xl border border-white/5 bg-white/[0.01] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]">
          <summary className="flex items-center justify-between cursor-pointer list-none text-base font-semibold text-white/90 hover:text-white [&::-webkit-details-marker]:hidden">
            <span>Can I invite you?</span>
            <span className="text-amber-400 text-xs transition-transform duration-300 group-open:rotate-180">
              ▼
            </span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-white/60 font-[family-name:var(--font-inter)] border-t border-white/5 pt-4">
            I would be honored to be part of poetry readings, literary festivals, panel discussions, and podcasts. Please send the details via the <Link href="/contact" className="text-amber-400 hover:underline">Contact Page</Link> to discuss availability.
          </p>
        </details>

        <details className="group rounded-2xl border border-white/5 bg-white/[0.01] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]">
          <summary className="flex items-center justify-between cursor-pointer list-none text-base font-semibold text-white/90 hover:text-white [&::-webkit-details-marker]:hidden">
            <span>Can I purchase signed books?</span>
            <span className="text-amber-400 text-xs transition-transform duration-300 group-open:rotate-180">
              ▼
            </span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-white/60 font-[family-name:var(--font-inter)] border-t border-white/5 pt-4">
            Absolutely! You can order physical copies directly through the <Link href="/books" className="text-amber-400 hover:underline">Books Page</Link>. If you would like a personalized message or signature, please mention it in the order notes or reach out immediately after purchasing.
          </p>
        </details>

        <details className="group rounded-2xl border border-white/5 bg-white/[0.01] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]">
          <summary className="flex items-center justify-between cursor-pointer list-none text-base font-semibold text-white/90 hover:text-white [&::-webkit-details-marker]:hidden">
            <span>How do I contact you?</span>
            <span className="text-amber-400 text-xs transition-transform duration-300 group-open:rotate-180">
              ▼
            </span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-white/60 font-[family-name:var(--font-inter)] border-t border-white/5 pt-4">
            You can send a direct message through the <Link href="/contact" className="text-amber-400 hover:underline">Contact Page</Link>. You are also welcome to connect with me on <a href="https://www.instagram.com/renuwrites_poem/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Instagram</a> or read my regular updates on my <a href="https://pillayrenu.blogspot.com/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Blog</a>.
          </p>
        </details>
      </div>

      {/* Still have questions banner */}
      <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.02] p-8 text-center space-y-4">
        <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-white">
          Still Have Questions?
        </h3>
        <p className="text-sm text-white/65 leading-relaxed font-[family-name:var(--font-inter)] max-w-md mx-auto">
          If you didn&apos;t find what you were looking for, please don&apos;t hesitate to send a message directly.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/10 active:scale-95 w-fit"
        >
          <span>Send Message</span>
        </Link>
      </div>

      <LegalFooterNav current="/faq" />
    </div>
  );
}
