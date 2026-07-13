"use client";

import React from "react";
import Image from "next/image";

type AuthorGalleryImage = {
  id: string;
  url: string | null;
  fileData: string | null;
  fileMime: string | null;
  width: number;
  height: number;
  caption?: string | null;
};

type AuthorGalleryProps = {
  images: AuthorGalleryImage[];
};

export default function AuthorGallery({ images }: AuthorGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="text-white/40 text-sm">No gallery photos added yet.</p>
      </div>
    );
  }

  // Helper to resolve the correct image source (handling base64 fallback)
  const getImgSrc = (img: AuthorGalleryImage) => {
    if (img.url) return img.url;
    if (img.fileData && img.fileMime) {
      return `data:${img.fileMime};base64,${img.fileData}`;
    }
    return "/placeholder.jpg";
  };

  // Greedy Masonry Partitioning to balance column heights mathematically
  const col1: AuthorGalleryImage[] = [];
  const col2: AuthorGalleryImage[] = [];
  let h1 = 0;
  let h2 = 0;

  images.forEach((img) => {
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
          {img.caption && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none select-none">
              <p className="text-xs text-white/95 font-[family-name:var(--font-inter)] tracking-wide">
                {img.caption}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {renderColumn(col1)}
      {renderColumn(col2)}
    </div>
  );
}
