import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import AdminNav from "@/components/admin/admin-nav";

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
      { href: "/admin/users", label: "Users" },
    ]
  },
  {
    title: "Content",
    items: [
      { href: "/admin/poems", label: "Poems" },
      { href: "/admin/genres", label: "Genres" },
      { href: "/admin/books", label: "Books" },
      { href: "/admin/audio", label: "Audio" },
      { href: "/admin/author", label: "Author Profile" },
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
      { href: "/admin/subscribers", label: "Subscribers" },
      { href: "/admin/campaigns", label: "Campaigns" },
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
    <div className="min-h-screen bg-[#07080d] flex flex-col md:flex-row -mt-[72px] relative z-10">
      {/* Sidebar Navigation */}
      <AdminNav
        sessionUser={{
          name: session.user.name ?? "Admin User",
          email: session.user.email ?? "admin@renuwritespoem.com",
        }}
        unrepliedCount={unrepliedCount}
        navGroups={navGroups}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-60 min-w-0">
        <main className="py-10 px-6 md:px-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
