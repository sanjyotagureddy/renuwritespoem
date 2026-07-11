"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Quote, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

export type TestimonialItem = {
  id: string;
  body: string;
  userName: string;
  targetTitle: string;
  targetLink: string;
};

type TestimonialsSectionProps = {
  testimonials: TestimonialItem[];
};

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFloater, setShowFloater] = useState(true);

  // Auto rotation
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Hide the floating indicator when user scrolls past the testimonials section
  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById("testimonials");
      if (element) {
        const rect = element.getBoundingClientRect();
        // If the top of testimonials is visible or passed, hide the floater
        if (rect.top <= window.innerHeight) {
          setShowFloater(false);
        } else {
          setShowFloater(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex];
  const initial = current.userName.trim().charAt(0).toUpperCase() || "R";

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const scrollToTestimonials = () => {
    document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Floating Read Reactions Indicator */}
      <AnimatePresence>
        {showFloater && (
          <motion.button
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            onClick={scrollToTestimonials}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-amber-500/20 bg-neutral-900/90 px-4 py-2.5 text-xs font-semibold tracking-wider text-amber-300 shadow-2xl backdrop-blur-md transition-all hover:bg-neutral-900 hover:border-amber-500/40 hover:scale-105 active:scale-98"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <MessageCircle className="h-3.5 w-3.5 text-amber-400" />
            <span>Read Testimonials</span>
          </motion.button>
        )}
      </AnimatePresence>

      <section
        id="testimonials"
        className="py-20 bg-neutral-950/40 border-t border-white/5 relative overflow-hidden font-[family-name:var(--font-inter)]"
      >
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <MessageSquare className="h-3 w-3" />
              Reader Reactions
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-white tracking-wide">
              Heartfelt Musings
            </h2>
            <p className="text-sm text-white/50 leading-relaxed">
              Standout reflections, connections, and reactions shared by readers on the sanctuary.
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div className="relative min-h-[280px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-full rounded-3xl border border-white/10 bg-white/[0.01] p-8 sm:p-12 hover:border-white/15 transition-all duration-300 relative"
              >
                {/* Pull Quote Mark */}
                <div className="absolute top-8 right-8 text-white/5">
                  <Quote className="h-16 w-16 rotate-180" />
                </div>

                <div className="space-y-6 max-w-2xl">
                  <p className="text-lg sm:text-xl text-white/90 leading-relaxed italic font-light font-serif">
                    &ldquo;{current.body}&rdquo;
                  </p>
                  
                  <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-base font-bold shadow-md">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{current.userName}</p>
                      <p className="text-xs text-white/45 truncate mt-0.5">
                        On{" "}
                        <Link
                          href={current.targetLink}
                          className="text-amber-400/80 hover:text-amber-300 underline decoration-amber-400/20 hover:decoration-amber-300 transition-colors"
                        >
                          {current.targetTitle}
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Navigation Controls */}
            {testimonials.length > 1 && (
              <div className="flex items-center justify-between gap-4 mt-8 px-4 w-full">
                <button
                  onClick={handlePrev}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center justify-center gap-1.5 flex-1 max-w-xs mx-auto">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? "w-6 bg-amber-400" : "w-1.5 bg-white/20 hover:bg-white/45"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
