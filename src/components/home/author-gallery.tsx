"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";

type AuthorGalleryImage = {
  id: string;
  url: string | null;
  fileData: string | null;
  fileMime: string | null;
  width: number;
  height: number;
  caption?: string | null;
  category?: string | null;
};

type AuthorGalleryProps = {
  images: AuthorGalleryImage[];
};

const GALLERY_CATEGORIES = [
  "Professional photos",
  "Book launches",
  "Writing desk",
  "Coffee moments",
  "Travel",
  "Reader meetups",
  "Signing books",
  "Events"
];

export default function AuthorGallery({ images }: AuthorGalleryProps) {
  const [selectedTab, setSelectedTab] = useState<string>("All");

  if (!images || images.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center font-[family-name:var(--font-inter)]">
        <p className="text-white/40 text-sm">No gallery photos added yet.</p>
      </div>
    );
  }

  // Filter images based on selected tab
  const filteredImages = useMemo(() => {
    if (selectedTab === "All") return images;
    return images.filter((img) => img.category === selectedTab);
  }, [images, selectedTab]);

  // Helper to resolve the correct image source (handling base64 fallback)
  const getImgSrc = (img: AuthorGalleryImage) => {
    if (img.url) return img.url;
    if (img.fileData && img.fileMime) {
      return `data:${img.fileMime};base64,${img.fileData}`;
    }
    return "/placeholder.jpg";
  };

  // Partition filtered images to balance masonry columns
  const col1: AuthorGalleryImage[] = [];
  const col2: AuthorGalleryImage[] = [];
  let h1 = 0;
  let h2 = 0;

  filteredImages.forEach((img) => {
    const ratio = img.width && img.height ? img.height / img.width : 1.0;
    if (h1 <= h2) {
      col1.push(img);
      h1 += ratio;
    } else {
      col2.push(img);
      h2 += ratio;
    }
  });

  const renderColumn = (colImages: AuthorGalleryImage[]) => (
    <div className="flex flex-col gap-4">
      {colImages.map((img) => (
        <div
          key={img.id}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/30 shadow-lg"
        >
          <Image
            src={getImgSrc(img)}
            alt={img.caption || "Author gallery image"}
            width={img.width || 800}
            height={img.height || 600}
            className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          {/* Caption & Category tag Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none select-none">
            {img.category && (
              <span className="inline-block rounded bg-amber-500/25 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 tracking-wider uppercase mb-1.5">
                {img.category}
              </span>
            )}
            {img.caption && (
              <p className="text-xs text-white/95 font-[family-name:var(--font-inter)] tracking-wide">
                {img.caption}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 bg-white/[0.01] border border-white/5 p-2 rounded-2xl max-w-fit font-[family-name:var(--font-inter)]">
        <button
          onClick={() => setSelectedTab("All")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
            selectedTab === "All"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10 scale-105"
              : "text-white/50 hover:text-white hover:bg-white/5"
          }`}
        >
          All
        </button>
        {GALLERY_CATEGORIES.map((cat) => {
          const count = images.filter((img) => img.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedTab(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                selectedTab === cat
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10 scale-105"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{cat}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    selectedTab === cat
                      ? "bg-black/15 text-black"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl p-8 font-[family-name:var(--font-inter)]">
          <p className="text-white/40 text-sm">No photos in the &quot;{selectedTab}&quot; album yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderColumn(col1)}
          {renderColumn(col2)}
        </div>
      )}
    </div>
  );
}
