import Link from "next/link";

export type LegalFooterNavProps = {
  current: string;
};

const links = [
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/shipping", label: "Shipping & Refunds" },
  { href: "/support", label: "Support" },
];

export default function LegalFooterNav({ current }: LegalFooterNavProps) {
  return (
    <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-4">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`text-xs transition-colors ${
            l.href === current
              ? "text-white/70 pointer-events-none"
              : "text-white/35 hover:text-white"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
