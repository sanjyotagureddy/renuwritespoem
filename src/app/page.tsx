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
          <div className="w-56 h-56 md:w-80 md:h-80 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
            <Image
              src="/author.jpg"
              alt="Renu - Poet & Author"
              width={320}
              height={320}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center md:text-left">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-white mb-4">
            Renu Writes Poem
          </h1>

          <p className="font-[family-name:var(--font-inter)] text-lg md:text-xl text-white/70 mb-8">
            A space for poetry, stories, and the quiet beauty of words.
          </p>

          <div className="inline-block border border-white/40 rounded-full px-6 py-2 mb-8">
            <span className="font-[family-name:var(--font-inter)] text-sm uppercase tracking-widest text-white/90">
              Coming Soon
            </span>
          </div>

          <blockquote className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl italic text-white/60 leading-relaxed">
            &ldquo;Where words bloom like wildflowers,<br />
            and every verse finds its home.&rdquo;
          </blockquote>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center z-10">
        <p className="font-[family-name:var(--font-inter)] text-xs text-white/40">
          &copy; {new Date().getFullYear()} Renu Writes Poem. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
