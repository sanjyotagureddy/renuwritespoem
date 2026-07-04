import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Renu — a poet and author who weaves words into heartfelt verses on love, nature, life, and spirituality.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
        <div className="shrink-0">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden ring-4 ring-white/10 shadow-2xl">
            <Image
              src="/author.jpg"
              alt="Renu - Poet & Author"
              width={256}
              height={256}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About Renu
          </h1>
          <p className="text-lg text-white/50 italic">
            Poet &middot; Author &middot; Dreamer
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="space-y-6 text-white/70 leading-relaxed font-[family-name:var(--font-inter)]">
        <p className="text-lg">
          Renu is a poet and author whose words flow from the heart, capturing
          the beauty of everyday moments and the depth of human emotion. Through
          poetry, she explores themes of love, nature, life, spirituality, and
          the quiet magic that connects us all.
        </p>

        <p>
          Writing has been a lifelong companion — a way to make sense of the
          world, to find beauty in the ordinary, and to give voice to feelings
          that often go unspoken. Each poem is a window into a moment, an
          emotion, or a reflection that resonates with readers across the world.
        </p>

        <p>
          Whether it&apos;s the gentle rustle of leaves, the warmth of a shared
          glance, or the stillness of a rainy evening, Renu finds inspiration in
          the world around her and transforms it into verses that touch the soul.
        </p>

        <blockquote className="border-l-2 border-white/20 pl-6 py-2 my-8 font-[family-name:var(--font-playfair)] text-xl italic text-white/50">
          &ldquo;I write because words are the closest thing to magic — they can
          heal, inspire, and connect hearts across time and distance.&rdquo;
        </blockquote>

        <p>
          Beyond poetry, Renu is working on books that bring together curated
          collections of her best work, each organized around themes that matter
          most. Stay tuned for upcoming releases and new poems shared regularly
          on this platform.
        </p>
      </div>

      {/* Connect Section */}
      <div className="mt-16 pt-10 border-t border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">
          Let&apos;s Connect
        </h2>
        <p className="text-white/60 font-[family-name:var(--font-inter)] mb-6">
          Follow Renu&apos;s journey and stay updated with the latest poems and
          releases.
        </p>
        <div className="flex gap-4">
          <a
            href="https://www.instagram.com/renuwrites_poem/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:text-white transition-all text-sm font-[family-name:var(--font-inter)]"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Instagram
          </a>
          <a
            href="https://pillayrenu.blogspot.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:text-white transition-all text-sm font-[family-name:var(--font-inter)]"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3h11a3 3 0 013 3v15l-4-2H5a3 3 0 01-3-3V6a3 3 0 013-3zm0 2a1 1 0 00-1 1v10a1 1 0 001 1h10.48L17 17.76V6a1 1 0 00-1-1H5zm2 3h8v2H7V8zm0 4h6v2H7v-2z" />
            </svg>
            Blog
          </a>
        </div>
      </div>
    </div>
  );
}
