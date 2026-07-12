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
        className="flex h-10 w-10 items-center justify-center rounded-full text-white bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-lg shadow-pink-500/20 transition-all duration-300 hover:scale-110 hover:shadow-pink-500/40"
      >
        <InstagramIcon className="h-5 w-5" />
      </a>
      <a
        href="https://youtube.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
        className="flex h-10 w-10 items-center justify-center rounded-full text-white bg-[#FF0000] shadow-lg shadow-red-500/20 transition-all duration-300 hover:scale-110 hover:shadow-red-500/40"
      >
        <YouTubeIcon className="h-5 w-5" />
      </a>
      <a
        href="https://pillayrenu.blogspot.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Blog"
        className="flex h-10 w-10 items-center justify-center rounded-full text-white bg-[#f57d00] shadow-lg shadow-orange-500/20 transition-all duration-300 hover:scale-110 hover:shadow-orange-500/40"
      >
        <BlogIcon className="h-5 w-5" />
      </a>
    </div>
  );
}
