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
};

export default function SongsClient({ initialSongs }: { initialSongs: Track[] }) {
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [openCommentsSong, setOpenCommentsSong] = useState<Track | null>(null);

  function handleTrackSelect(track: Track) {
    if (activeTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrack(track);
      setIsPlaying(true);
    }
  }

  const activeIndex = activeTrack
    ? initialSongs.findIndex((s) => s.id === activeTrack.id)
    : -1;

  function playNext() {
    if (activeIndex !== -1 && activeIndex < initialSongs.length - 1) {
      setActiveTrack(initialSongs[activeIndex + 1]);
      setIsPlaying(true);
    }
  }

  function playPrev() {
    if (activeIndex > 0) {
      setActiveTrack(initialSongs[activeIndex - 1]);
      setIsPlaying(true);
    }
  }

  if (initialSongs.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
        <p className="text-white/50 font-[family-name:var(--font-inter)]">
          No songs are currently available for streaming. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24" onContextMenu={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialSongs.map((song) => {
          const isActive = activeTrack?.id === song.id;
          return (
            <div
              key={song.id}
              onClick={() => handleTrackSelect(song)}
              className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 cursor-pointer select-none ${
                isActive
                  ? "border-amber-400 bg-amber-400/[0.03] shadow-lg shadow-amber-400/5"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              {/* Cover Art */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                {song.coverUrl ? (
                  <Image
                    src={song.coverUrl}
                    alt={song.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl">
                    🎵
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
                  <h3 className={`text-lg font-semibold truncate ${isActive ? "text-amber-400" : "text-white"}`}>
                    {song.title
                  }</h3>
                  {isActive && isPlaying && (
                    <span className="flex items-end gap-0.5 h-3 shrink-0">
                      <span className="w-0.5 bg-amber-400 animate-bounce h-full" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }}></span>
                      <span className="w-0.5 bg-amber-400 animate-bounce h-full" style={{ animationDelay: '0.3s', animationDuration: '0.8s' }}></span>
                      <span className="w-0.5 bg-amber-400 animate-bounce h-full" style={{ animationDelay: '0.2s', animationDuration: '0.7s' }}></span>
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-white/50 line-clamp-2 font-[family-name:var(--font-inter)] leading-relaxed">
                  {song.description || "No description provided."}
                </p>
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <LikeButton slug={song.slug} type="song" />
                    <button
                      type="button"
                      onClick={() => setOpenCommentsSong(song)}
                      className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/60 transition-colors hover:border-white/30 hover:text-white"
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
        onNextTrack={activeIndex < initialSongs.length - 1 ? playNext : undefined}
        onPrevTrack={activeIndex > 0 ? playPrev : undefined}
      />

      {/* Drawer overlay for comments */}
      {openCommentsSong && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setOpenCommentsSong(null)}
        >
          <div
            className="w-full max-w-md h-full bg-neutral-950 border-l border-white/10 p-6 overflow-y-auto flex flex-col shadow-2xl transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white truncate pr-4">Comments: {openCommentsSong.title}</h2>
              <button
                onClick={() => setOpenCommentsSong(null)}
                className="text-white/40 hover:text-white text-lg h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              <CommentSection slug={openCommentsSong.slug} type="song" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
