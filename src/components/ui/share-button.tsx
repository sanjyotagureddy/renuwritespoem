"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Link2, Check, Mail } from "lucide-react";

type ShareButtonProps = {
  shareUrl: string;
  title: string;
  shareText: string; // The formatted quote/intro message
  accentClass?: string; // e.g. "text-amber-400 hover:bg-amber-500/10" or "text-emerald-400 hover:bg-emerald-500/10"
};

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="16"
    height="16"
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.791-4.382 9.794-9.786.002-2.618-1.01-5.08-2.858-6.93C16.315 2.04 13.856.999 11.237 1c-5.41.001-9.803 4.384-9.806 9.794-.002 1.702.451 3.361 1.307 4.8l-.988 3.605 3.698-.97c1.463.798 2.91 1.216 4.199 1.216zm12.302-6.52c-.33-.165-1.951-.963-2.251-1.073-.3-.109-.518-.165-.736.165-.218.329-.84 1.058-1.03 1.277-.189.218-.379.245-.709.08-1.023-.513-1.722-.875-2.427-1.482-.843-.726-1.396-1.562-1.562-1.838-.165-.275-.018-.424.147-.589.148-.148.33-.384.495-.577.165-.191.218-.328.328-.547.11-.219.055-.411-.028-.577-.082-.165-.736-1.771-1.009-2.43-.267-.641-.539-.553-.736-.563-.19-.01-.408-.012-.627-.012-.218 0-.573.082-.873.411-.3.33-1.145 1.12-1.145 2.73 0 1.61 1.173 3.16 1.336 3.38.164.22 2.307 3.523 5.59 4.945.781.338 1.391.54 1.868.692.784.249 1.497.214 2.061.129.629-.094 1.951-.797 2.224-1.562.272-.764.272-1.42.19-1.562-.08-.14-.294-.222-.624-.388z" />
  </svg>
);

export default function ShareButton({
  shareUrl,
  title,
  shareText,
  accentClass = "text-amber-400 hover:bg-amber-500/10 border-amber-500/30",
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleCopyText = async () => {
    try {
      const fullText = `${shareText}\n${shareUrl}`;
      await navigator.clipboard.writeText(fullText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error("Failed to copy quote:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error invoking Web Share API:", err);
      }
    }
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText}\n${shareUrl}`
  )}`;

  const emailShareUrl = `mailto:?subject=${encodeURIComponent(
    title
  )}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold tracking-wider text-white uppercase transition-all hover:bg-white/10 active:scale-98"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/95 p-2 shadow-2xl backdrop-blur-md"
          >
            <div className="space-y-1">
              {/* WhatsApp Option */}
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>Share via WhatsApp</span>
              </a>

              {/* Email Option */}
              <a
                href={emailShareUrl}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-sky-500/10 hover:text-sky-400"
              >
                <Mail className="h-4 w-4" />
                <span>Share via Email</span>
              </a>

              {/* Copy Quote Text */}
              <button
                onClick={handleCopyText}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-white/80 transition-colors ${accentClass}`}
              >
                <span className="flex items-center gap-2.5">
                  <Copy className="h-4 w-4" />
                  <span>Copy Share Text</span>
                </span>
                {copiedText && <Check className="h-3.5 w-3.5" />}
              </button>

              {/* Copy Direct Link */}
              <button
                onClick={handleCopyLink}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
              >
                <span className="flex items-center gap-2.5">
                  <Link2 className="h-4 w-4" />
                  <span>Copy Direct Link</span>
                </span>
                {copiedLink && <Check className="h-3.5 w-3.5" />}
              </button>

              {/* Native Web Share Fallback */}
              {typeof navigator !== "undefined" && navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white border-t border-white/5 mt-1 pt-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>More Sharing Options</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
