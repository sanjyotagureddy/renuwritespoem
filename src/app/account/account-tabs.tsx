"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/account", label: "Overview" },
  { href: "/account/likes", label: "Likes" },
  { href: "/account/comments", label: "Comments" },
  { href: "/account/invites", label: "Invites" },
  { href: "/account/orders", label: "Orders" },
];

export default function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-white/10">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-amber-400 bg-white/5 text-white"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
