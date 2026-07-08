"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Audio, Poem } from "@prisma/client";

type SlidingBannerProps = {
  featuredBooks: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    coverImage: string | null;
  }>;
  latestAudio: Array<Audio>;
  featuredPoems: Array<Poem>;
};

export default function SlidingBanner({
  featuredBooks,
  latestAudio,
  featuredPoems,
}: SlidingBannerProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Define slides data dynamically
  const slides = [];

  // Slide 0: Author Welcome (the original landing page presentation)
  slides.push({
    title: "Poetry in three languages",
    headline: "Renu Writes Poem",
    description: "Heartfelt verses on love, nature, life, and solitude — written in English, Hindi, and Marathi.",
    image: "/author.jpg",
    link: "/poems",
    linkText: "Explore Poems",
    secondaryLink: "/about",
    secondaryLinkText: "About Renu",
    badge: "Welcome",
    icon: "✍️",
    isCircular: true,
  });

  // Book slide
  if (featuredBooks.length > 0) {
    const book = featuredBooks[0];
    slides.push({
      title: "Featured Book Release",
      headline: book.title,
      description: book.description || "Discover the latest published book and order a physical copy today.",
      image: book.coverImage,
      link: `/books/${book.slug}`,
      linkText: "Order Book",
      badge: "Book",
      icon: "📚",
      isCircular: false,
    });
  }

  // Audio slide
  if (latestAudio.length > 0) {
    const audioItem = latestAudio[0];
    slides.push({
      title: "Latest Audio Release",
      headline: audioItem.title,
      description: audioItem.description || "Listen to custom-recorded songs and spoken-word poetry with our custom player.",
      image: audioItem.coverUrl,
      link: "/audio",
      linkText: "Listen Now",
      badge: "Audio",
      icon: "📻",
      isCircular: false,
    });
  }

  // Poem slide
  if (featuredPoems.length > 0) {
    const poem = featuredPoems[0];
    slides.push({
      title: "Featured Poem",
      headline: poem.title,
      description: poem.excerpt || (poem.content.length > 150 ? poem.content.slice(0, 150) + "..." : poem.content),
      image: poem.coverImage,
      link: `/poems/${poem.slug}`,
      linkText: "Read Poem",
      badge: "Poem",
      icon: "✍️",
      isCircular: false,
    });
  }

  // Auto play rotation
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative min-h-[calc(100vh-72px)] flex items-center px-6 py-20 overflow-hidden select-none">
      {/* Background with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg-scenery.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full min-h-[420px] flex items-center justify-center">
        {slides.map((slide, index) => {
          const isActive = index === activeSlide;
          return (
            <div
              key={index}
              className={`absolute inset-0 flex flex-col md:flex-row items-center gap-10 md:gap-16 transition-all duration-700 ease-in-out ${
                isActive
                  ? "opacity-100 translate-x-0 pointer-events-auto"
                  : "opacity-0 translate-x-12 pointer-events-none"
              }`}
            >
              {/* Cover Art / Portrait on the Left */}
              <div className="shrink-0 flex justify-center">
                <div className={`relative ring-4 ring-white/10 shadow-2xl overflow-hidden bg-neutral-900/60 flex items-center justify-center ${
                  slide.isCircular
                    ? "rounded-full w-44 h-44 md:w-64 md:h-64"
                    : "rounded-2xl w-40 h-52 md:w-60 md:h-76"
                }`}>
                  {slide.image ? (
                    <Image
                      src={slide.image}
                      alt={slide.headline}
                      fill
                      className="object-cover"
                      sizes={slide.isCircular ? "(max-width: 768px) 176px, 256px" : "(max-width: 768px) 160px, 240px"}
                      priority={index === 0}
                    />
                  ) : (
                    <div className="text-7xl">{slide.icon}</div>
                  )}
                </div>
              </div>

              {/* Information Content on the Right */}
              <div className="flex-1 text-center md:text-left flex flex-col justify-between h-full min-w-0">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 mb-4 select-none">
                    <span>{slide.icon}</span>
                    <span>{slide.badge}</span>
                  </div>
                  <p className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.25em] text-white/40 mb-2">
                    {slide.title}
                  </p>
                  <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl font-bold text-white mb-5 leading-tight truncate">
                    {slide.headline}
                  </h2>
                  {/* Strict 3 to 4 lines line clamping */}
                  <p className="font-[family-name:var(--font-inter)] text-base md:text-lg text-white/60 leading-relaxed max-w-xl mb-8 line-clamp-3 md:line-clamp-4">
                    {slide.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <Link
                    href={slide.link}
                    className="inline-flex rounded-full bg-white px-8 py-3 text-xs tracking-wider text-black font-semibold uppercase hover:bg-white/90 transition-all hover:scale-[1.02] shadow-lg"
                  >
                    {slide.linkText}
                  </Link>
                  {slide.secondaryLink && (
                    <Link
                      href={slide.secondaryLink}
                      className="inline-flex rounded-full border border-white/20 px-8 py-3 text-xs tracking-wider text-white/70 font-semibold uppercase hover:text-white hover:border-white/40 transition-all hover:scale-[1.02]"
                    >
                      {slide.secondaryLinkText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2.5 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeSlide ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Language links at the bottom left */}
      <div className="absolute bottom-8 left-8 hidden md:flex items-center gap-3 text-xs text-white/40 z-20 select-none">
        <span className="font-[family-name:var(--font-inter)]">Poems in:</span>
        <Link href="/poems?language=EN" className="text-white/60 hover:text-white transition-colors">English</Link>
        <span>·</span>
        <Link href="/poems?language=HI" className="text-white/60 hover:text-white transition-colors font-devanagari">हिन्दी</Link>
        <span>·</span>
        <Link href="/poems?language=MR" className="text-white/60 hover:text-white transition-colors font-devanagari">मराठी</Link>
      </div>
    </section>
  );
}
