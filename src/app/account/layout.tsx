import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import AccountTabs from "./account-tabs";

export const metadata: Metadata = {
  title: { default: "My Account", template: "%s | My Account" },
  description: "View your activity, liked poems, comments, and orders.",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getPrisma().user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      {/* Profile Header */}
      <div className="mb-8 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="h-20 w-20 rounded-full border-2 border-white/10 object-cover shadow-lg"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/10 bg-white/5 text-2xl font-semibold text-white/60">
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-semibold text-white md:text-3xl">
            {user.name || "Reader"}
          </h1>
          <p className="mt-1 text-sm text-white/45 font-[family-name:var(--font-inter)]">
            {user.email}
          </p>
          <p className="mt-1 text-xs text-white/30 font-[family-name:var(--font-inter)]">
            Joined {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <AccountTabs />

      {/* Content */}
      <div className="mt-6">{children}</div>
    </div>
  );
}
