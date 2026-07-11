import Link from "next/link";

const footerLinks = [
  { href: "/poems", label: "Poems" },
  { href: "/genres", label: "Genres" },
  { href: "/books", label: "Books" },
  { href: "/audio", label: "Audio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/renuwrites_poem/",
    label: "Instagram",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    href: "https://pillayrenu.blogspot.com/",
    label: "Blog",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 3h11a3 3 0 013 3v15l-4-2H5a3 3 0 01-3-3V6a3 3 0 013-3zm0 2a1 1 0 00-1 1v10a1 1 0 001 1h10.48L17 17.76V6a1 1 0 00-1-1H5zm2 3h8v2H7V8zm0 4h6v2H7v-2z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-black/80 backdrop-blur-md border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
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

          {/* Quick Links */}
          <div>
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

          {/* Social */}
          <div>
            <h3 className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-white/40 mb-4">
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
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all"
                >
                  {link.icon}
                </a>
              ))}
            </div>
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
