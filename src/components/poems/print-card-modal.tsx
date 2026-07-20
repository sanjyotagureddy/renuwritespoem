"use client";

import { useState, useRef } from "react";
import { Printer, Sparkles, X, Loader2, Check, Eye, Image as ImageIcon } from "lucide-react";
import { toPng } from "html-to-image";

type ThemeOption = {
  id: "classic" | "minimal" | "floral";
  name: string;
  desc: string;
  cardBg: string;
  cardBorder: string;
  cardText: string;
  cardTitle: string;
  cardAccent: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
};

const THEMES: ThemeOption[] = [
  {
    id: "classic",
    name: "Classic Sanctuary",
    desc: "Warm golden-ivory parchment with gold filigree borders",
    cardBg: "bg-[#FDFBF7]",
    cardBorder: "border-[#D4AF37]",
    cardText: "text-[#2A2A2A]",
    cardTitle: "text-[#1A1A1A]",
    cardAccent: "text-[#B8860B]",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-400",
  },
  {
    id: "minimal",
    name: "Minimalist Solitude",
    desc: "Stark off-white background with refined slate borders",
    cardBg: "bg-[#FAFAFA]",
    cardBorder: "border-[#5A626A]",
    cardText: "text-[#2B2D30]",
    cardTitle: "text-[#0F1115]",
    cardAccent: "text-[#4A5568]",
    badgeBg: "bg-white/10",
    badgeBorder: "border-white/20",
    badgeText: "text-white/80",
  },
  {
    id: "floral",
    name: "Romantic Rose",
    desc: "Soft blush rose background with deep burgundy wine trim",
    cardBg: "bg-[#FDE8EC]",
    cardBorder: "border-[#8B263E]",
    cardText: "text-[#3D1A24]",
    cardTitle: "text-[#4A0E1C]",
    cardAccent: "text-[#8B263E]",
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/30",
    badgeText: "text-rose-400",
  },
];

type PrintCardModalProps = {
  slug: string;
  poemTitle: string;
  content?: string;
};

export default function PrintCardModal({ slug, poemTitle, content = "" }: PrintCardModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dedicatedTo, setDedicatedTo] = useState("");
  const [fromName, setFromName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<"classic" | "minimal" | "floral">("classic");
  const [exportFormat, setExportFormat] = useState<"png" | "pdf">("png");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cardPreviewRef = useRef<HTMLDivElement>(null);
  const activeThemeObj = THEMES.find((t) => t.id === selectedTheme) || THEMES[0];

  // Excerpt for portrait live preview
  const poemLines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 16);

  // Client-Side High-Res PNG Card Generation (for WhatsApp & Social Sharing)
  const handleDownloadImage = async () => {
    if (!cardPreviewRef.current) return;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const dataUrl = await toPng(cardPreviewRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
      });

      const link = document.createElement("a");
      link.download = `${slug}-keepsake-card.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setIsOpen(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to generate image card.");
    } finally {
      setIsGenerating(false);
    }
  };

  // PDF Document Generation (for Paper Printing)
  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`/api/poems/${slug}/print-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dedicatedTo,
          fromName,
          message,
          theme: selectedTheme,
          orientation: "portrait",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate PDF card.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slug}-keepsake-card.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsOpen(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Something went wrong generating the PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    if (exportFormat === "png") {
      handleDownloadImage();
    } else {
      handleDownloadPdf();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all shadow-sm"
      >
        <Printer className="w-4 h-4 text-amber-400" />
        <span>Share Poem Card</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl border border-white/15 bg-neutral-900 p-6 md:p-8 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" /> Printable &amp; Shareable Keepsake Card
                </span>
                <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-white mt-1">
                  Design Keepsake Card for &quot;{poemTitle}&quot;
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Controls */}
              <form onSubmit={handleExport} className="lg:col-span-6 space-y-5">
                {/* 1. Theme Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                    1. Choose Design Theme
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {THEMES.map((t) => {
                      const isSelected = selectedTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTheme(t.id)}
                          className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                            isSelected
                              ? `${t.badgeBorder} bg-white/[0.08] shadow-md ring-1 ring-amber-400/30`
                              : "border-white/10 bg-white/[0.02] hover:border-white/20"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {t.name}
                              </span>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${t.badgeBg} ${t.badgeBorder} ${t.badgeText}`}
                              >
                                Style
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50">{t.desc}</p>
                          </div>
                          {isSelected && (
                            <div className="rounded-full bg-amber-500/20 p-1 text-amber-400 shrink-0">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Dedication Inputs */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                    2. Add Personal Dedication
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <span className="block text-[11px] text-white/50 mb-1">Dedicated To (For)</span>
                      <input
                        type="text"
                        maxLength={40}
                        value={dedicatedTo}
                        onChange={(e) => setDedicatedTo(e.target.value)}
                        placeholder="e.g. Elena"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] text-white/50 mb-1">From (Sender Name)</span>
                      <input
                        type="text"
                        maxLength={40}
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value)}
                        placeholder="e.g. Julian"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-white/50">Personal Note / Quote</span>
                      <span className="text-[10px] text-white/40">{message.length}/150</span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={150}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. Thinking of you as you read these quiet verses..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* 3. Export Format Switcher */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                    3. Choose Download Format
                  </label>
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1.5">
                    <button
                      type="button"
                      onClick={() => setExportFormat("png")}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-bold transition-all ${
                        exportFormat === "png"
                          ? "bg-amber-400 text-neutral-950 shadow-md"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>PNG Image (WhatsApp)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportFormat("pdf")}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-bold transition-all ${
                        exportFormat === "pdf"
                          ? "bg-amber-400 text-neutral-950 shadow-md"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PDF Card (Print)</span>
                    </button>
                  </div>
                </div>

                {/* Actions: Single Unified Hero CTA Bar */}
                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl border border-white/10 px-5 py-3 text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-950 active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                        <span>Generating Card...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-neutral-950" />
                        <span>
                          {exportFormat === "png"
                            ? "Download Image Card"
                            : "Download PDF Card"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Right Column: Live Interactive Portrait Preview */}
              <div className="lg:col-span-6 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Eye className="w-3.5 h-3.5" /> Real-time Card Preview
                  </span>
                  <span className="text-[10px] text-white/40 font-bold uppercase">
                    A5 Portrait Keepsake
                  </span>
                </div>

                {/* Portrait Preview Box (Ref attached for DOM-to-PNG export) */}
                <div className="flex items-center justify-center bg-black/40 rounded-2xl p-4 border border-white/10 min-h-[400px]">
                  <div
                    ref={cardPreviewRef}
                    className={`relative rounded-2xl border-2 p-6 shadow-2xl transition-all duration-300 flex flex-col justify-between w-full max-w-xs aspect-[3/4] min-h-[400px] ${activeThemeObj.cardBg} ${activeThemeObj.cardBorder}`}
                  >
                    {/* Decorative Outer Border */}
                    <div
                      className={`absolute inset-2 border rounded-xl pointer-events-none ${activeThemeObj.cardBorder} opacity-40`}
                    />

                    {/* Bottom-Right Expressive Vector SVG Line Art Motif */}
                    <div className={`absolute bottom-14 right-5 pointer-events-none opacity-[0.28] ${activeThemeObj.cardAccent}`}>
                      {selectedTheme === "classic" && (
                        <svg className="w-16 h-16 stroke-current fill-none stroke-[1.5]" viewBox="-50 -50 100 100">
                          <path d="M 15 -35 C 20 -20 28 -5 18 20 C 12 30 0 38 -8 40 M 18 20 C 25 15 32 5 28 -10 M 15 -25 C 22 -20 26 -12 25 -2 M 12 -15 C 18 -10 22 -2 20 8 M 5 25 C -5 28 -15 25 -22 18 C -28 10 -25 -2 -15 -8 C -5 -12 8 -8 15 -2 C 22 5 25 18 18 28 M -12 5 C -18 12 -12 22 -2 20" />
                        </svg>
                      )}
                      {selectedTheme === "minimal" && (
                        <svg className="w-16 h-16 stroke-current fill-none stroke-[1.5]" viewBox="-50 -50 100 100">
                          <path d="M -35 35 L -10 -10 L 10 15 L 35 35 M -10 -10 L 15 -35 M -20 20 L 5 -15 M -15 -25 C -8 -25 -5 -18 -8 -10 C -1 -12 3 -20 -3 -27 M 15 -20 C 20 -25 25 -22 28 -20 C 25 -15 20 -18 15 -20 M -25 -10 C -20 -15 -15 -12 -12 -10 C -15 -5 -20 -8 -25 -10" />
                        </svg>
                      )}
                      {selectedTheme === "floral" && (
                        <svg className="w-16 h-16 stroke-current fill-none stroke-[1.5]" viewBox="-50 -50 100 100">
                          <path d="M 0 -15 C -8 -25 8 -25 0 -15 M -5 -20 C -18 -15 -12 0 0 5 C 12 0 18 -15 5 -20 M -12 -8 C -22 2 -8 18 0 18 C 8 18 22 2 12 -8 M 0 18 C 0 30 -5 38 -10 45 M -3 28 C -15 25 -20 35 -10 40 C -2 38 -3 28 -3 28 M 0 32 C 12 30 18 40 8 42 C 2 40 0 32 0 32" />
                        </svg>
                      )}
                    </div>

                    {/* Header Watermark */}
                    <div className="text-center mb-3">
                      <span
                        className={`text-[8px] font-bold uppercase tracking-[0.2em] ${activeThemeObj.cardAccent}`}
                      >
                        RENU WRITES POEM — KEEPSAKE CARD
                      </span>
                    </div>

                    {/* Dedication Banner */}
                    {(dedicatedTo || fromName || message) && (
                      <div className="text-center mb-3 space-y-0.5 bg-black/5 rounded-xl p-2 border border-black/5">
                        {(dedicatedTo || fromName) && (
                          <p className={`text-[11px] font-bold ${activeThemeObj.cardAccent}`}>
                            {dedicatedTo && fromName
                              ? `Dedicated to ${dedicatedTo} · From ${fromName}`
                              : dedicatedTo
                              ? `Dedicated to ${dedicatedTo}`
                              : `From ${fromName}`}
                          </p>
                        )}
                        {message && (
                          <p className={`text-[10px] italic leading-tight ${activeThemeObj.cardText}`}>
                            &quot;{message}&quot;
                          </p>
                        )}
                      </div>
                    )}

                    {/* Poem Content Section */}
                    <div className="text-center space-y-2 my-auto">
                      <h4
                        className={`text-base font-bold font-[family-name:var(--font-playfair)] ${activeThemeObj.cardTitle}`}
                      >
                        {poemTitle}
                      </h4>
                      <p className={`text-[9px] font-medium opacity-60 ${activeThemeObj.cardText}`}>
                        by Renu
                      </p>

                      <div className="space-y-0.5 max-w-xs mx-auto pt-1">
                        {poemLines.map((line, idx) => (
                          <p
                            key={idx}
                            className={`text-[10px] font-[family-name:var(--font-inter)] leading-snug ${activeThemeObj.cardText}`}
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Footer URL Watermark */}
                    <div className="text-center mt-4 pt-2 border-t border-black/10">
                      <span className={`text-[7px] tracking-wider opacity-60 ${activeThemeObj.cardText}`}>
                        Read full poem online at renuwritespoem.vercel.app
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
