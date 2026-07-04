"use client";

import { useState } from "react";

type BookDescriptionProps = {
  description: string;
};

export default function BookDescription({ description }: BookDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Split description by double newlines to find paragraphs/blocks
  const blocks = description.split(/\n\n+/);

  // Helper to determine if a block is a poem
  const isPoemBlock = (block: string) => {
    const lines = block.split("\n").map((l) => l.trim());
    if (lines.length < 2) return false;

    // Check if most lines are relatively short (e.g., under 65 chars)
    const shortLinesCount = lines.filter((l) => l.length < 65).length;
    return shortLinesCount / lines.length > 0.8;
  };

  // Classify blocks
  const classifiedBlocks = blocks.map((block) => ({
    text: block,
    isPoem: isPoemBlock(block),
  }));

  // Find if there is a poem block at the beginning
  const poemBlocks: string[] = [];
  let detailBlocks: string[] = [];

  let readingPoem = true;
  for (const block of classifiedBlocks) {
    if (readingPoem && block.isPoem) {
      poemBlocks.push(block.text);
    } else {
      readingPoem = false;
      detailBlocks.push(block.text);
    }
  }

  // If no poem blocks at the beginning, treat all as details
  if (poemBlocks.length === 0 && classifiedBlocks.length > 0) {
    detailBlocks = blocks;
  }

  const detailText = detailBlocks.join("\n\n");
  const isDetailsLong = detailText.length > 250;

  return (
    <div className="space-y-6">
      {/* Poem Section (Always fully visible at the top, italicized with Playfair font) */}
      {poemBlocks.length > 0 && (
        <div className="border-l-2 border-amber-300/30 pl-5 py-1.5 my-4 bg-amber-500/[0.02] rounded-r-xl">
          {poemBlocks.map((poem, idx) => (
            <p
              key={idx}
              className="font-[family-name:var(--font-playfair)] text-lg md:text-xl italic leading-relaxed text-amber-100/90 whitespace-pre-line"
            >
              {poem}
            </p>
          ))}
        </div>
      )}

      {/* Details Section (Collapsible if long) */}
      {detailText && (
        <div className="space-y-3">
          <div
            className={`font-[family-name:var(--font-inter)] text-sm md:text-[15px] leading-relaxed text-white/70 whitespace-pre-line transition-all duration-300 ${
              isDetailsLong && !isExpanded ? "line-clamp-4 opacity-85" : "opacity-100"
            }`}
          >
            {detailText}
          </div>

          {isDetailsLong && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs uppercase tracking-wider text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1.5 focus:outline-none"
            >
              {isExpanded ? (
                <>
                  <span>Read Less</span>
                  <span className="text-[10px]">▲</span>
                </>
              ) : (
                <>
                  <span>Read More</span>
                  <span className="text-[10px]">▼</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
