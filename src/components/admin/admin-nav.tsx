"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/auth/sign-out-button";
import { Menu, X } from "lucide-react";

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
  navGroups,
}: {
  sessionUser: { email: string; name: string };
  unrepliedCount: number;
  navGroups: NavGroup[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <div className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="text-[10px] uppercase tracking-wider text-white/30 font-bold">
                {group.title}
              </h3>
              <ul className="space-y-1">
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
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 text-[9px] font-bold text-white">
                            {unrepliedCount > 99 ? "99+" : unrepliedCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
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
