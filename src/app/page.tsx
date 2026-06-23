import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 pb-24">
      {/* Background scenery */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg-scenery.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <main className="relative z-10 flex flex-col md:flex-row items-center gap-16 md:gap-20 max-w-4xl w-full">
        {/* Author image */}
        <div className="shrink-0">
          <div className="w-56 h-56 md:w-80 md:h-80 rounded-full overflow-hidden">
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

        {/* Content */}
        <div className="text-center md:text-left">
          {/* Title */}
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-white mb-4">
            Renu Writes Poem
          </h1>

          {/* Tagline */}
          <p className="font-[family-name:var(--font-inter)] text-lg md:text-xl text-stone-300 mb-8">
            A space for poetry, stories, and the quiet beauty of words.
          </p>

          {/* Coming Soon badge */}
          <div className="inline-block border border-stone-400 rounded-full px-6 py-2 mb-8">
            <span className="font-[family-name:var(--font-inter)] text-sm uppercase tracking-widest text-stone-200">
              Coming Soon
            </span>
          </div>

          {/* Poem excerpt */}
          <blockquote className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl italic text-stone-300 leading-relaxed mb-8">
            &ldquo;Where words bloom like wildflowers,<br />
            and every verse finds its home.&rdquo;
          </blockquote>

          {/* Social links */}
          <div className="flex items-center gap-5 justify-center md:justify-start">
            <a
              href="https://www.instagram.com/renuwrites_poem/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-stone-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-stone-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="https://blog.example.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Blog"
              className="text-stone-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center z-10">
        <p className="font-[family-name:var(--font-inter)] text-xs text-stone-400">
          &copy; {new Date().getFullYear()} Renu Writes Poem. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
