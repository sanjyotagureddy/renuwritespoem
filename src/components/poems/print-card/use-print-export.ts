import { useState, RefObject } from "react";
import { toPng } from "html-to-image";

type UsePrintExportOptions = {
  slug: string;
  cardPreviewRef: RefObject<HTMLDivElement | null>;
  dedicatedTo: string;
  fromName: string;
  message: string;
  selectedTheme: "classic" | "minimal" | "floral";
  onSuccess?: () => void;
};

export function usePrintExport({
  slug,
  cardPreviewRef,
  dedicatedTo,
  fromName,
  message,
  selectedTheme,
  onSuccess,
}: UsePrintExportOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownloadImage = async () => {
    if (!cardPreviewRef.current) return;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      fetch(`/api/poems/${slug}/print-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dedicatedTo,
          fromName,
          message,
          theme: selectedTheme,
          orientation: "portrait",
        }),
      }).catch((logErr) => console.warn("Card log skipped:", logErr));

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

      onSuccess?.();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to generate image card.");
    } finally {
      setIsGenerating(false);
    }
  };

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

      onSuccess?.();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Something went wrong generating the PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    errorMsg,
    handleDownloadImage,
    handleDownloadPdf,
  };
}
