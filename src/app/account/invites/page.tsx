import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Invites",
};

const PAGE_SIZE = 20;

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AccountInvitesPage({ searchParams }: PageProps) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const prisma = getPrisma();
  const userId = session.user.id;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [totalCount, invites] = await Promise.all([
    prisma.invite.count({ where: { inviterUserId: userId } }),
    prisma.invite.findMany({
      where: { inviterUserId: userId },
      orderBy: { sentAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { poem: { select: { title: true, slug: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasNext = page < totalPages;

  function buildUrl(p: number) {
    return p > 1 ? `/account/invites?page=${p}` : "/account/invites";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Invite History</h2>
        <p className="mt-1 text-sm text-white/40 font-[family-name:var(--font-inter)]">
          Friends you&apos;ve invited to read poems.
        </p>
      </div>

      {invites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-white/60">You haven&apos;t sent any invites yet.</p>
          <p className="mt-1 text-sm text-white/35">
            Share a{" "}
            <Link href="/poems" className="text-white/60 underline underline-offset-2 hover:text-white">
              poem
            </Link>{" "}
            with a friend to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white/80">
                  {invite.inviteeName}
                </p>
                <p className="mt-0.5 truncate text-xs text-white/40">
                  {invite.inviteeEmail}
                </p>
                {invite.poem && (
                  <Link
                    href={`/poems/${invite.poem.slug}`}
                    className="mt-1.5 block truncate text-xs text-white/40 hover:text-white transition-colors"
                  >
                    Shared: {invite.poem.title}
                  </Link>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-white/35">
                  {formatDate(invite.sentAt)}
                </p>
                <div className="mt-1.5 flex flex-col items-end gap-1">
                  {invite.clickedAt && (
                    <span className="rounded-full border border-sky-400/25 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                      Clicked
                    </span>
                  )}
                  {invite.signedUpAt && (
                    <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      Signed Up
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <span className="text-xs text-white/50">
            Page{" "}
            <strong className="font-semibold text-white/80">{page}</strong> of{" "}
            <strong className="font-semibold text-white/80">{totalPages}</strong>{" "}
            · {totalCount} invites
          </span>
          <div className="flex gap-2">
            <Link
              href={buildUrl(page - 1)}
              className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${
                page === 1
                  ? "pointer-events-none border-white/5 bg-white/[0.01] text-white/20"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Previous
            </Link>
            <Link
              href={buildUrl(page + 1)}
              className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${
                !hasNext
                  ? "pointer-events-none border-white/5 bg-white/[0.01] text-white/20"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
