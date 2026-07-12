import type { Metadata } from "next";
import Image from "next/image";
import { InstagramIcon, BlogIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Renu — a poet and author who weaves words into heartfelt verses on love, nature, life, and spirituality.",
  alternates: {
    canonical: "/about",
  },
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
              alt="Renu - Poet &amp; Author"
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/80 hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:border-transparent hover:text-white transition-all text-sm font-[family-name:var(--font-inter)]"
          >
            <InstagramIcon className="w-4 h-4" />
            Instagram
          </a>
          <a
            href="https://pillayrenu.blogspot.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/80 hover:bg-[#f57d00] hover:border-transparent hover:text-white transition-all text-sm font-[family-name:var(--font-inter)]"
          >
            <BlogIcon className="w-4 h-4" />
            Blog
          </a>
        </div>
      </div>
    </div>
  );
}
