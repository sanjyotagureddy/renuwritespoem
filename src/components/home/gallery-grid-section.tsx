import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "./scroll-reveal-container";
import { AuthorGalleryImage } from "@prisma/client";

type GalleryGridSectionProps = {
  galleryPhotos: AuthorGalleryImage[];
};

export default function GalleryGridSection({ galleryPhotos }: GalleryGridSectionProps) {
  if (!galleryPhotos || galleryPhotos.length === 0) return null;

  // Helper to resolve the correct image source (handling base64 fallback)
  const getImgSrc = (img: AuthorGalleryImage) => {
    if (img.url) return img.url;
    if (img.fileData && img.fileMime) {
      return `data:${img.fileMime};base64,${img.fileData}`;
    }
    return "/placeholder.jpg";
  };

  return (
    <section className="w-full min-h-[calc(100vh-72px)] snap-start flex flex-col justify-center border-b border-white/5 relative py-12">
      <ScrollReveal className="mx-auto max-w-7xl px-6 w-full">
        <div className="mb-12 text-center lg:text-left flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold mb-2">
              Captured Moments
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-playfair)] text-white">
              Sanctuary Desk &amp; Highlights
            </h2>
          </div>
          <Link
            href="/gallery"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider shrink-0 self-center sm:self-end font-[family-name:var(--font-inter)]"
          >
            Explore Full Gallery &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryPhotos.map((img) => (
            <Link
              key={img.id}
              href="/gallery"
              className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-neutral-900/30 block"
            >
              <Image
                src={getImgSrc(img)}
                alt={img.caption || "Sanctuary Highlights"}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
                  <p className="text-[10px] text-white/90 font-[family-name:var(--font-inter)] truncate">
                    {img.caption}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
