"use client";

import { usePathname } from "next/navigation";
import { InstagramIcon, YouTubeIcon, BlogIcon } from "./icons";

export default function SocialFloating() {
  const pathname = usePathname();

  // Do not show the floating social links on administrative back-office routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-6 z-50 hidden flex-col gap-3 sm:flex">
      <a
        href="https://www.instagram.com/renuwrites_poem/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
      >
        <InstagramIcon className="h-5 w-5" />
      </a>
      <a
        href="https://youtube.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
      >
        <YouTubeIcon className="h-5 w-5" />
      </a>
      <a
        href="https://pillayrenu.blogspot.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Blog"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
      >
        <BlogIcon className="h-5 w-5" />
      </a>
    </div>
  );
}
