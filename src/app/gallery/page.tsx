import type { Metadata } from "next";
import Link from "next/link";
import { getOrCreateAuthorProfile } from "@/app/admin/author-actions";
import AuthorGallery from "@/components/home/author-gallery";

export const metadata: Metadata = {
  title: "Visual Gallery | Renu Writes Poem",
  description:
    "Explore the visual sanctuary of Renu. View photos of her writing desks, creative setups, behind-the-scenes moments, and physical book collections.",
  alternates: {
    canonical: "/gallery",
  },
  keywords: [
    "Renu Gallery",
    "Writing Desk Photos",
    "Author Gallery",
    "Creative Desk Setup",
    "Poetry Behind the Scenes",
  ],
};

export default async function GalleryPage() {
  const profile = await getOrCreateAuthorProfile();

  const galleryImages = (profile.gallery ?? []).map((img) => ({
    id: img.id,
    url: img.url,
    fileData: img.fileData,
    fileMime: img.fileMime,
    width: img.width,
    height: img.height,
    caption: img.caption,
    category: img.category,
    order: img.order,
  }));

  return (
    <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24 overflow-hidden">
      {/* Background Glow Accent */}
      <div className="absolute -top-24 left-1/3 w-[40rem] h-[40rem] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Hero Header */}
      <div className="text-center md:text-left space-y-3 mb-12 border-b border-white/5 pb-12">
        <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
          Visual Sanctuary
        </span>
        <h1 className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-playfair)] text-white">
          Gallery
        </h1>
        <p className="text-base md:text-lg text-white/50 font-[family-name:var(--font-inter)] leading-relaxed max-w-2xl">
          Step into a curated collection of Renu&apos;s physical writing desks, creative spaces, book release highlights, and captured moments.
        </p>
      </div>

      {/* Main Grid */}
      {galleryImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl p-8 font-[family-name:var(--font-inter)]">
          <p className="text-white/40 text-sm">No photos have been uploaded to the sanctuary yet.</p>
          <Link
            href="/about"
            className="mt-4 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
          >
            &larr; Return to About Profile
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <AuthorGallery images={galleryImages} />

          <div className="flex justify-center pt-8">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer font-[family-name:var(--font-inter)]"
            >
              <span>Explore Biography &amp; Story</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
