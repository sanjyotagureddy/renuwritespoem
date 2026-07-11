import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/auth/sign-out-button";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  description: "Manage poems and content.",
};

const navGroups = [
  {
    title: "Core",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/analytics", label: "Analytics" },
    ]
  },
  {
    title: "Content",
    items: [
      { href: "/admin/poems", label: "Poems" },
      { href: "/admin/genres", label: "Genres" },
      { href: "/admin/books", label: "Books" },
      { href: "/admin/audio", label: "Audio" },
    ]
  },
  {
    title: "Moderation",
    items: [
      { href: "/admin/moderation", label: "Hub" },
      { href: "/admin/comments", label: "Comments" },
      { href: "/admin/contacts", label: "Messages" },
    ]
  },
  {
    title: "Commerce & Growth",
    items: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/invites", label: "Invitations" },
    ]
  }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: Although middleware.ts restricts /admin routes to ADMINs,
  // we check the session here too as a component-level safety fallback to prevent
  // accidental data exposure if middleware matching rules are ever modified or bypassed.
  let session = await getServerAuthSession();

  if (process.env.NODE_ENV === "development") {
    if (!session) {
      session = {
        user: {
          id: "dev-admin-id",
          name: "Dev Admin",
          email: "admin@renuwritespoem.com",
          role: "ADMIN",
        },
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    } else if (session.user) {
      session.user.role = "ADMIN";
    }
  }

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

  // Fetch unreplied messages count for the nav badge
  let unrepliedCount = 0;
  try {
    unrepliedCount = await getPrisma().contactMessage.count({
      where: { repliedAt: null },
    });
  } catch {
    // Silently ignore — don't break the entire admin layout
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
      <nav className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
        {navGroups.map((group, index) => (
          <div key={group.title} className="flex items-center gap-1">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                {item.label}
                {item.label === "Messages" && unrepliedCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 text-[10px] font-bold text-white">
                    {unrepliedCount > 99 ? "99+" : unrepliedCount}
                  </span>
                )}
              </Link>
            ))}
            {index < navGroups.length - 1 && (
              <div className="w-px h-6 bg-white/10 mx-2 flex-shrink-0" />
            )}
          </div>
        ))}
      </nav>

      {children}
    </div>
  );
}

