"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/auth/sign-out-button";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NavItem = {
  href: string;
  label: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export default function AdminNav({
  sessionUser,
  unrepliedCount,
  pendingCommentsCount = 0,
  pendingOrdersCount = 0,
  unverifiedSubscribersCount = 0,
  navGroups,
}: {
  sessionUser: { email: string; name: string };
  unrepliedCount: number;
  pendingCommentsCount?: number;
  pendingOrdersCount?: number;
  unverifiedSubscribersCount?: number;
  navGroups: NavGroup[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Keep track of which groups are expanded (limit to max 2)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Automatically expand the group that contains the active link on mount/route changes
  useEffect(() => {
    const activeGroup = navGroups.find((group) =>
      group.items.some((item) => isLinkActive(item.href))
    );
    if (activeGroup) {
      setExpandedGroups((prev) => {
        if (prev.includes(activeGroup.title)) return prev;
        const next = [...prev, activeGroup.title];
        if (next.length > 2) {
          return next.slice(next.length - 2);
        }
        return next;
      });
    } else if (expandedGroups.length === 0 && navGroups[0]) {
      // Default to the first group if nothing matches
      setExpandedGroups([navGroups[0].title]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => {
      if (prev.includes(title)) {
        return prev.filter((t) => t !== title);
      } else {
        const next = [...prev, title];
        if (next.length > 2) {
          return next.slice(next.length - 2);
        }
        return next;
      }
    });
  };

  function isLinkActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between bg-black/95 border-r border-white/10 p-5 md:p-6 text-white font-[family-name:var(--font-inter)]">
      <div className="space-y-6 overflow-y-auto pr-2">
        {/* Title/Logo */}
        <div>
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="font-[family-name:var(--font-playfair)] text-lg font-bold text-white block hover:text-white/80 transition-colors"
          >
            Renu Writes Poem
          </Link>
          <span className="inline-block mt-1 text-[9px] uppercase tracking-[0.2em] text-emerald-400 font-semibold">
            Admin console
          </span>
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors mt-3 font-semibold"
          >
            ← Back to Website
          </Link>
        </div>

        {/* Groups */}
        <div className="space-y-4">
          {navGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.title);
            return (
              <div key={group.title} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between text-[10px] uppercase tracking-wider text-white/30 font-bold hover:text-white/60 transition-colors py-1.5 cursor-pointer text-left focus:outline-none"
                  aria-expanded={isExpanded}
                >
                  <span>{group.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-white/30 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-white/30 shrink-0" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-1 pb-1">
                        {group.items.map((item) => {
                          const active = isLinkActive(item.href);
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all ${
                                  active
                                    ? "bg-white/10 text-white font-semibold shadow-sm"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                <span>{item.label}</span>
                                {item.label === "Messages" && unrepliedCount > 0 && (
                                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 text-[9px] font-bold text-white shrink-0 ml-2">
                                    {unrepliedCount > 99 ? "99+" : unrepliedCount}
                                  </span>
                                )}
                                {item.label === "Comments" && pendingCommentsCount > 0 && (
                                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[9px] font-bold text-white shrink-0 ml-2 animate-pulse">
                                    {pendingCommentsCount > 99 ? "99+" : pendingCommentsCount}
                                  </span>
                                )}
                                {item.label === "Orders" && pendingOrdersCount > 0 && (
                                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[9px] font-bold text-white shrink-0 ml-2">
                                    {pendingOrdersCount > 99 ? "99+" : pendingOrdersCount}
                                  </span>
                                )}
                                {item.label === "Subscribers" && unverifiedSubscribersCount > 0 && (
                                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[9px] font-bold text-white shrink-0 ml-2">
                                    {unverifiedSubscribersCount > 99 ? "99+" : unverifiedSubscribersCount}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Info / Sign out */}
      <div className="border-t border-white/10 pt-4 mt-6 flex flex-col gap-3 shrink-0">
        <div>
          <p className="text-[11px] font-semibold text-white truncate">{sessionUser.name}</p>
          <p className="text-[10px] text-white/40 truncate mt-0.5">{sessionUser.email}</p>
        </div>
        <SignOutButton />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/90 p-4 md:hidden text-white relative z-30">
        <div className="flex flex-col">
          <Link href="/" className="font-[family-name:var(--font-playfair)] text-md font-bold">
            Renu Writes Poem
          </Link>
          <span className="text-[8px] uppercase tracking-[0.2em] text-emerald-400">Admin Console</span>
        </div>
        
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
          className="rounded-lg border border-white/20 p-2 text-white hover:bg-white/5 transition-colors focus:outline-none"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-black transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-20 md:flex md:w-60 md:flex-col shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}
