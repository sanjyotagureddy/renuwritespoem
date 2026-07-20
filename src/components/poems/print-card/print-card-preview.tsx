import { RefObject } from "react";
import { ThemeOption } from "./themes";

type PrintCardPreviewProps = {
  cardPreviewRef: RefObject<HTMLDivElement | null>;
  activeThemeObj: ThemeOption;
  selectedTheme: "classic" | "minimal" | "floral";
  poemTitle: string;
  poemLines: string[];
  dedicatedTo: string;
  fromName: string;
  message: string;
};

export default function PrintCardPreview({
  cardPreviewRef,
  activeThemeObj,
  selectedTheme,
  poemTitle,
  poemLines,
  dedicatedTo,
  fromName,
  message,
}: PrintCardPreviewProps) {
  const totalLines = poemLines.length;
  const poemTextSizeClass =
    totalLines > 32
      ? "text-[6.5px] leading-[1.1]"
      : totalLines > 22
      ? "text-[7.5px] leading-tight"
      : totalLines > 14
      ? "text-[8.5px] leading-snug"
      : "text-[10px] leading-relaxed";

  return (
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
              className={`font-[family-name:var(--font-inter)] ${poemTextSizeClass} ${activeThemeObj.cardText}`}
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
  );
}
