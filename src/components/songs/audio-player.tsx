"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Track = {
  id: string;
  title: string;
  coverUrl: string | null;
  audioUrl: string;
};

type AudioPlayerProps = {
  activeTrack: Track | null;
  isPlaying: boolean;
  onPlayPauseToggle: (playing: boolean) => void;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
};

export default function AudioPlayer({
  activeTrack,
  isPlaying,
  onPlayPauseToggle,
  onNextTrack,
  onPrevTrack,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Sync audio play state
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    // Handle track change
    if (activeTrack && audio.src !== activeTrack.audioUrl) {
      audio.src = activeTrack.audioUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch((err) => console.log("Play interrupted:", err));
      }
    }

    // Handle play/pause
    if (isPlaying) {
      audio.play().catch((err) => console.log("Play interrupted:", err));
    } else {
      audio.pause();
    }
  }, [activeTrack, isPlaying]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      onPlayPauseToggle(false);
      if (onNextTrack) onNextTrack();
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [onPlayPauseToggle, onNextTrack]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  if (!activeTrack) return null;

  function togglePlay() {
    onPlayPauseToggle(!isPlaying);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }

  function formatTime(secs: number) {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/75 p-4 backdrop-blur-xl transition-all duration-300 md:px-8"
      onContextMenu={(e) => e.preventDefault()} // Disable right-click context menu
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        
        {/* Track Info */}
        <div className="flex items-center gap-3 md:w-1/4">
          {activeTrack.coverUrl ? (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10">
              <Image
                src={activeTrack.coverUrl}
                alt={activeTrack.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg">
              🎵
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{activeTrack.title}</p>
            <p className="text-[11px] text-white/40 mt-0.5">Renu Writes Poem</p>
          </div>
        </div>

        {/* Player Controls & Timeline */}
        <div className="flex flex-1 flex-col items-center gap-1.5 md:w-2/4">
          <div className="flex items-center gap-4">
            <button
              onClick={onPrevTrack}
              disabled={!onPrevTrack}
              className="text-white/40 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ⏮
            </button>
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button
              onClick={onNextTrack}
              disabled={!onNextTrack}
              className="text-white/40 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ⏭
            </button>
          </div>

          {/* Progress Timeline */}
          <div className="flex w-full items-center gap-2 text-[10px] text-white/40 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-lg bg-white/20 accent-white outline-none focus:outline-none"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="hidden items-center justify-end gap-2 md:flex md:w-1/4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-white/50 hover:text-white transition-colors text-xs"
          >
            {isMuted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="h-1 w-20 cursor-pointer appearance-none rounded-lg bg-white/20 accent-white outline-none"
          />
        </div>

      </div>
    </div>
  );
}
