"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { type PoemLanguage } from "@/lib/domain/poem-language";

type ListenButtonProps = {
  content: string;
  title: string;
  language: PoemLanguage;
};

function findBestVoice(voices: SpeechSynthesisVoice[], langCode: string): SpeechSynthesisVoice | null {
  // Normalize and filter voices by language prefix (e.g. "hi-", "hi_")
  const langVoices = voices.filter(
    (v) => v.lang.toLowerCase().replace("_", "-").startsWith(langCode.toLowerCase())
  );

  if (langVoices.length === 0) return null;

  // Priority 1: Search for high-quality Microsoft Natural, Google Premium, or Edge Online voices
  const premiumKeywords = ["natural", "neural", "google", "online", "premium", "microsoft"];
  for (const keyword of premiumKeywords) {
    const match = langVoices.find((v) => v.name.toLowerCase().includes(keyword));
    if (match) return match;
  }

  // Priority 2: Use local offline service voices (usually better than legacy generic synthetics)
  const localMatch = langVoices.find((v) => v.localService);
  if (localMatch) return localMatch;

  // Fallback: Return first available voice for language
  return langVoices[0];
}

export default function ListenButton({ content, title, language }: ListenButtonProps) {
  const [playState, setPlayState] = useState<"IDLE" | "PLAYING" | "PAUSED">("IDLE");
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsSupported(true);
    }
  }, []);

  // Cleanup synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!isSupported) return;

    const synth = window.speechSynthesis;

    if (playState === "PLAYING") {
      synth.pause();
      setPlayState("PAUSED");
      return;
    }

    if (playState === "PAUSED") {
      synth.resume();
      setPlayState("PLAYING");
      return;
    }

    // IDLE state - start new utterance
    synth.cancel(); // Clear any ongoing speech

    // Prepare text: read title, pause, then the poem content
    const textToRead = `${title}. \n\n ${content}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utteranceRef.current = utterance;

    // Set voice based on language
    const voices = synth.getVoices();
    let selectedVoice = null;

    if (language === "HI") {
      selectedVoice = findBestVoice(voices, "hi");
    } else if (language === "MR") {
      // Fallback to Hindi premium voice if Marathi is not installed
      selectedVoice = findBestVoice(voices, "mr") || findBestVoice(voices, "hi");
    } else {
      selectedVoice = findBestVoice(voices, "en");
    }

    // Set language code explicitly
    if (language === "HI") {
      utterance.lang = "hi-IN";
    } else if (language === "MR") {
      utterance.lang = "mr-IN";
    } else {
      utterance.lang = "en-US";
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      // Keep utterance.lang synchronized with selected voice
      utterance.lang = selectedVoice.lang;
    }

    // Set rate slightly slower for poetry pacing
    utterance.rate = 0.82;
    utterance.pitch = 1.0;

    // Utterance events
    utterance.onend = () => {
      setPlayState("IDLE");
    };

    utterance.onerror = (e) => {
      if (e.error !== "interrupted") {
        setPlayState("IDLE");
      }
    };

    setPlayState("PLAYING");
    synth.speak(utterance);
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setPlayState("IDLE");
  };

  if (!isSupported) return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.01] p-3 transition-colors hover:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white/50 uppercase">
          <Volume2 className="h-3.5 w-3.5 text-amber-400" />
          Audio Reader
        </span>
        {playState !== "IDLE" && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        )}
      </div>

      <div className="flex gap-2 mt-1">
        <button
          onClick={handlePlayPause}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
            playState === "PLAYING"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
          }`}
        >
          {playState === "PLAYING" ? (
            <>
              <Pause className="h-3.5 w-3.5 fill-current" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              Listen
            </>
          )}
        </button>

        {playState !== "IDLE" && (
          <button
            onClick={handleStop}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Stop reading"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
}
