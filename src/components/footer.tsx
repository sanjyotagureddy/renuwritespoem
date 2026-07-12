"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NewsletterSignup from "./ui/newsletter-signup";
import { InstagramIcon, BlogIcon } from "./icons";

const footerLinks = [
  { href: "/poems", label: "Poems" },
  { href: "/genres", label: "Genres" },
  { href: "/books", label: "Books" },
  { href: "/audio", label: "Audio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/shipping", label: "Shipping & Refunds" },
  { href: "/support", label: "Support" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/renuwrites_poem/",
    label: "Instagram",
    icon: <InstagramIcon className="w-5 h-5" />,
  },
  {
    href: "https://pillayrenu.blogspot.com/",
    label: "Blog",
    icon: <BlogIcon className="w-5 h-5" />,
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="bg-black/80 backdrop-blur-md border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand & Social */}
          <div className="md:col-span-3 flex flex-col justify-between gap-6">
            <div>
              <Link
                href="/"
                className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white"
              >
                Renu Writes Poem
              </Link>
              <p className="mt-3 font-[family-name:var(--font-inter)] text-sm text-white/50 leading-relaxed">
                A space for poetry, stories, and the quiet beauty of words.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-widest text-white/30">
                Connect
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all text-xs"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-white/40 mb-4">
              Explore
            </h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-[family-name:var(--font-inter)] text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h3 className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-white/40 mb-4">
              Legal
            </h3>
            <ul className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-[family-name:var(--font-inter)] text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="md:col-span-5">
            <NewsletterSignup />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="font-[family-name:var(--font-inter)] text-xs text-white/40">
            &copy; {new Date().getFullYear()} Renu Writes Poem. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
