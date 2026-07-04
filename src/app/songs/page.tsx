import type { Metadata } from "next";
import { getPrisma } from "@/lib/db";
import SongsClient from "@/components/songs/songs-client";

export const metadata: Metadata = {
  title: "Songs & Audio",
  description: "Listen to spoken poetry, songs, and audio creations by Renu.",
  alternates: {
    canonical: "/songs",
  },
};

export default async function SongsPage() {
  const prisma = getPrisma();
  
  const songs = await prisma.song.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      audioUrl: true,
      coverUrl: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <div className="mb-12">
        <p className="text-sm uppercase tracking-[0.22em] text-white/40 mb-3">Audio Releases</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Songs & Audio</h1>
        <p className="text-lg text-white/60 max-w-3xl font-[family-name:var(--font-inter)]">
          Listen to custom-recorded songs, spoken-word poetry, and musical collaborations. 
          Stream directly using our custom built premium player.
        </p>
      </div>

      <SongsClient initialSongs={songs} />
    </div>
  );
}
