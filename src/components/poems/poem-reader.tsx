"use client";

import React, { useState, useEffect } from "react";
import { poemLanguageFontClass, type PoemLanguage } from "@/lib/domain/poem-language";

type PoemReaderProps = {
  title: string;
  content: string;
  excerpt?: string | null;
  font?: string | null;
  language: PoemLanguage;
  lang: string;
};

type TextSize = "sm" | "md" | "lg";

export default function PoemReader({
  title,
  content,
  excerpt,
  font,
  language,
  lang,
}: PoemReaderProps) {
  const [textSize, setTextSize] = useState<TextSize>("md");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("renuwritespoem:textsize");
    if (saved === "sm" || saved === "md" || saved === "lg") {
      setTextSize(saved);
    }
  }, []);

  const changeSize = (size: TextSize) => {
    setTextSize(size);
    localStorage.setItem("renuwritespoem:textsize", size);
  };

  // Class definitions matching the design system
  const sizeClasses = {
    sm: "text-base md:text-lg leading-[1.8]",
    md: "text-lg md:text-xl leading-[2]",
    lg: "text-xl md:text-2xl leading-[2.2]",
  };

  const fontStyle = font ? { fontFamily: `'${font}', serif` } : undefined;

  return (
    <div className="space-y-8">
      {/* Title & Sizing Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/5 pb-6">
        <h1
          lang={lang}
          className={`max-w-2xl text-4xl leading-tight text-white md:text-5xl ${poemLanguageFontClass(
            language,
          )}`}
          style={fontStyle}
        >
          {title}
        </h1>

        {/* Text size selector panel (sleek glassmorphic design) */}
        {mounted && (
          <div className="shrink-0 flex items-center gap-2.5 self-end sm:self-start bg-neutral-900/50 border border-white/10 rounded-full p-1 shadow-lg backdrop-blur-sm">
            <span className="text-[10px] uppercase tracking-wider text-white/40 pl-2">
              Text:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeSize("sm")}
                className={`h-7 w-8 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  textSize === "sm"
                    ? "bg-amber-400 text-black shadow font-bold scale-105"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
                aria-label="Decrease text size"
                title="Small text"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => changeSize("md")}
                className={`h-7 w-8 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  textSize === "md"
                    ? "bg-amber-400 text-black shadow font-bold scale-105"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
                aria-label="Reset text size"
                title="Normal text"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => changeSize("lg")}
                className={`h-7 w-8 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  textSize === "lg"
                    ? "bg-amber-400 text-black shadow font-bold scale-105"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
                aria-label="Increase text size"
                title="Large text"
              >
                A+
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Excerpt */}
      {excerpt && (
        <p
          lang={lang}
          className={`max-w-2xl border-l border-amber-200/25 pl-4 text-lg leading-relaxed text-white/70 ${poemLanguageFontClass(
            language,
          )}`}
          style={fontStyle}
        >
          {excerpt}
        </p>
      )}

      {/* Main Content */}
      <div
        lang={lang}
        className={`max-w-[42rem] whitespace-pre-line text-white/90 transition-all duration-300 ${
          sizeClasses[textSize]
        } ${poemLanguageFontClass(language)}`}
        style={fontStyle}
      >
        {content}
      </div>
    </div>
  );
}
