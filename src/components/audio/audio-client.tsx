"use client";

import { useState } from "react";
import Image from "next/image";
import AudioPlayer from "./audio-player";
import LikeButton from "@/components/ui/like-button";
import CommentSection from "@/components/ui/comment-section";

type Track = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  audioUrl: string;
  coverUrl: string | null;
  views: number;
  published?: boolean;
};

export default function AudioClient({ initialAudio }: { initialAudio: Track[] }) {
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [openCommentsAudio, setOpenCommentsAudio] = useState<Track | null>(null);

  function handleTrackSelect(track: Track) {
    if (activeTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrack(track);
      setIsPlaying(true);
      
      const viewedKey = `viewed_audio:${track.id}`;
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, "true");
        fetch(`/api/audio/${track.id}/view`, { method: "POST" })
          .then(() => {
            window.dispatchEvent(new CustomEvent("achievement-check"));
          })
          .catch((err) => console.error("Failed to track view:", err));
      }
    }
  }

  const activeIndex = activeTrack
    ? initialAudio.findIndex((s) => s.id === activeTrack.id)
    : -1;

  function playNext() {
    if (activeIndex !== -1 && activeIndex < initialAudio.length - 1) {
      setActiveTrack(initialAudio[activeIndex + 1]);
      setIsPlaying(true);
    }
  }

  function playPrev() {
    if (activeIndex > 0) {
      setActiveTrack(initialAudio[activeIndex - 1]);
      setIsPlaying(true);
    }
  }

  if (initialAudio.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
        <p className="text-white/50 font-[family-name:var(--font-inter)]">
          No audio recordings are currently available for streaming. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24" onContextMenu={(e) => e.preventDefault()}>
      <div className="columns-1 md:columns-2 gap-6 space-y-6">
        {initialAudio.map((track) => {
          const isActive = activeTrack?.id === track.id;
          return (
            <div
              key={track.id}
              onClick={() => handleTrackSelect(track)}
              className={`break-inside-avoid group flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 cursor-pointer select-none ${
                isActive
                  ? "border-violet-500 bg-violet-500/[0.03] shadow-lg shadow-violet-500/5"
                  : "border-white/10 bg-white/[0.02] hover:border-violet-500/30 hover:bg-violet-500/[0.01] hover:shadow-lg hover:shadow-violet-500/[0.02]"
              }`}
            >
              {/* Cover Art */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                {track.coverUrl ? (
                  <Image
                    src={track.coverUrl}
                    alt={track.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl text-violet-400">
                    📻
                  </div>
                )}
                {/* Playing overlay */}
                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}>
                  <span className="text-white text-xl">
                    {isActive && isPlaying ? "⏸" : "▶"}
                  </span>
                </div>
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-lg font-semibold truncate transition-colors duration-300 flex items-center gap-2 ${isActive ? "text-violet-400" : "text-white group-hover:text-violet-200"}`}>
                    <span>{track.title}</span>
                    {track.published === false && (
                      <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] text-amber-300 font-normal uppercase tracking-wider select-none shrink-0">
                        Draft
                      </span>
                    )}
                  </h3>
                  {isActive && isPlaying && (
                    <span className="flex items-end gap-0.5 h-3 shrink-0">
                      <span className="w-0.5 bg-violet-400 animate-bounce h-full" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }}></span>
                      <span className="w-0.5 bg-violet-400 animate-bounce h-full" style={{ animationDelay: '0.3s', animationDuration: '0.8s' }}></span>
                      <span className="w-0.5 bg-violet-400 animate-bounce h-full" style={{ animationDelay: '0.2s', animationDuration: '0.7s' }}></span>
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-white/50 line-clamp-2 font-[family-name:var(--font-inter)] leading-relaxed">
                  {track.description || "No description provided."}
                </p>
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] tracking-wider text-white/50 uppercase whitespace-nowrap">
                      {track.views.toLocaleString()} {track.views === 1 ? 'play' : 'plays'}
                    </span>
                    <LikeButton slug={track.slug} type="audio" />
                    <button
                      type="button"
                      onClick={() => setOpenCommentsAudio(track)}
                      className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/60 transition-colors hover:border-violet-500/40 hover:text-white"
                    >
                      <span>💬</span>
                      <span>Comments</span>
                    </button>
                  </div>
                  <div className="text-[10px] text-white/30 font-[family-name:var(--font-inter)] select-none">
                    Audio Protected
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Audio Player */}
      <AudioPlayer
        activeTrack={activeTrack}
        isPlaying={isPlaying}
        onPlayPauseToggle={setIsPlaying}
        onNextTrack={activeIndex < initialAudio.length - 1 ? playNext : undefined}
        onPrevTrack={activeIndex > 0 ? playPrev : undefined}
      />

      {/* Drawer overlay for comments */}
      {openCommentsAudio && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setOpenCommentsAudio(null)}
        >
          <div
            className="w-full max-w-md h-full bg-neutral-950 border-l border-white/10 p-6 overflow-y-auto flex flex-col shadow-2xl transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white truncate pr-4">Comments: {openCommentsAudio.title}</h2>
              <button
                onClick={() => setOpenCommentsAudio(null)}
                className="text-white/40 hover:text-white text-lg h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              <CommentSection slug={openCommentsAudio.slug} type="audio" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
