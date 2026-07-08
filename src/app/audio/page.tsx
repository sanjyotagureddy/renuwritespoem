import type { Metadata } from "next";
import { getPrisma } from "@/lib/db";
import AudioClient from "@/components/audio/audio-client";

export const metadata: Metadata = {
  title: "Audio & Recordings",
  description: "Listen to spoken poetry, songs, and audio creations by Renu.",
  alternates: {
    canonical: "/audio",
  },
};

export default async function AudioPage() {
  const prisma = getPrisma();
  
  const tracks = await prisma.audio.findMany({
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
    <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 overflow-hidden">
      {/* Premium Visual Background Glow Accent */}
      <div className="absolute -top-10 left-1/3 w-[35rem] h-[35rem] bg-violet-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="relative z-10 mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-medium tracking-wider text-violet-300 uppercase mb-4">
          <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
          Audio Releases
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-100 via-violet-300 to-purple-400 bg-clip-text text-transparent">
          Audio & Recordings
        </h1>
        <p className="text-lg text-white/60 max-w-3xl font-[family-name:var(--font-inter)] leading-relaxed">
          Listen to custom-recorded audio recitations, spoken-word poetry, and musical collaborations by Renu. 
          Stream directly using our custom-built, premium player.
        </p>
      </div>

      <div className="relative z-10">
        <AudioClient initialAudio={tracks} />
      </div>
    </div>
  );
}
