"use client";

import { useState, useRef } from "react";
import { Printer, Sparkles, X, Loader2, Check, Image as ImageIcon } from "lucide-react";
import { THEMES } from "./print-card/themes";
import PrintCardPreview from "./print-card/print-card-preview";
import { usePrintExport } from "./print-card/use-print-export";

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

  const cardPreviewRef = useRef<HTMLDivElement>(null);
  const activeThemeObj = THEMES.find((t) => t.id === selectedTheme) || THEMES[0];

  const poemLines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const {
    isGenerating,
    errorMsg,
    handleDownloadImage,
    handleDownloadPdf,
  } = usePrintExport({
    slug,
    cardPreviewRef,
    dedicatedTo,
    fromName,
    message,
    selectedTheme,
    onSuccess: () => setIsOpen(false),
  });

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
                    <ImageIcon className="w-3.5 h-3.5" /> Real-time Card Preview
                  </span>
                  <span className="text-[10px] text-white/40 font-bold uppercase">
                    A5 Portrait Keepsake
                  </span>
                </div>

                {/* Portrait Preview Box (Ref attached for DOM-to-PNG export) */}
                <div className="flex items-center justify-center bg-black/40 rounded-2xl p-4 border border-white/10 min-h-[400px]">
                  <PrintCardPreview
                    cardPreviewRef={cardPreviewRef}
                    activeThemeObj={activeThemeObj}
                    selectedTheme={selectedTheme}
                    poemTitle={poemTitle}
                    poemLines={poemLines}
                    dedicatedTo={dedicatedTo}
                    fromName={fromName}
                    message={message}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
