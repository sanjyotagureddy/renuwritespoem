import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/auth/sign-out-button";
import { getServerAuthSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  description: "Manage poems and content.",
};

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/poems", label: "Poems" },
  { href: "/admin/poems/new", label: "New Poem" },
  { href: "/admin/genres", label: "Genres" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/books/new", label: "New Book" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/comments", label: "Comments" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 md:py-24">
        <div className="rounded-2xl border border-rose-200/20 bg-rose-500/5 p-8">
          <h1 className="text-3xl text-white mb-3">Access Denied</h1>
          <p className="text-white/70 font-[family-name:var(--font-inter)]">
            Your account is signed in but does not have admin access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">Admin Panel</p>
          <p className="text-sm text-white/50 font-[family-name:var(--font-inter)]">
            {session.user.email}
          </p>
        </div>
        <SignOutButton />
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-1 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
