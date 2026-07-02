"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const baseNavLinks = [
  { href: "/", label: "Home" },
  { href: "/poems", label: "Poems" },
  { href: "/genres", label: "Genres" },
  { href: "/books", label: "Books" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  const userDisplayName =
    session?.user?.name?.trim().split(" ")[0] ??
    session?.user?.email?.split("@")[0] ??
    "";

  const isAdmin = session?.user?.role === "ADMIN";
  const isLoggedIn = Boolean(session?.user);

  const navLinks = [...baseNavLinks];

  if (status !== "loading" && !isLoggedIn) {
    navLinks.push({ href: "/login", label: "Login" });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-bold text-white hover:text-white/90 transition-colors"
        >
          Renu Writes Poem
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-[family-name:var(--font-inter)] text-sm uppercase tracking-wider text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}

          {status !== "loading" && isLoggedIn ? (
            <li className="relative group">
              <button
                type="button"
                className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1.5 font-[family-name:var(--font-inter)] text-xs tracking-wide text-white/85 hover:bg-white/10 transition-colors cursor-pointer"
              >
                {`Hey, ${userDisplayName}`}
              </button>

              {/* Dropdown on hover */}
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="rounded-xl border border-white/15 bg-neutral-900 shadow-xl py-1 min-w-[140px]">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </li>
          ) : null}
        </ul>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 bg-neutral-950 border-white/10"
          >
            <SheetHeader>
              <SheetTitle className="font-[family-name:var(--font-playfair)] text-white text-lg">
                Renu Writes Poem
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 px-3 rounded-lg font-[family-name:var(--font-inter)] text-sm uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {isLoggedIn && (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block py-3 px-3 rounded-lg font-[family-name:var(--font-inter)] text-sm uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="border-t border-white/10 mt-2 pt-2">
                    <p className="px-3 py-2 text-xs text-white/40">
                      {`Signed in as ${userDisplayName}`}
                    </p>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left py-3 px-3 rounded-lg font-[family-name:var(--font-inter)] text-sm uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
