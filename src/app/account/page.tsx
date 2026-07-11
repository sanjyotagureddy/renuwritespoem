import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function AccountOverviewPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) redirect("/login");

  const prisma = getPrisma();
  const userId = session.user.id;
  const userEmail = session.user.email ?? "";

  const [
    poemLikeCount,
    bookLikeCount,
    audioLikeCount,
    poemCommentCount,
    bookCommentCount,
    audioCommentCount,
    inviteCount,
    orderCount,
    recentPoemLikes,
    recentComments,
    recentInvites,
  ] = await Promise.all([
    prisma.like.count({ where: { userId } }),
    prisma.bookLike.count({ where: { userId } }),
    prisma.audioLike.count({ where: { userId } }),
    prisma.comment.count({ where: { userId } }),
    prisma.bookComment.count({ where: { userId } }),
    prisma.audioComment.count({ where: { userId } }),
    prisma.invite.count({ where: { inviterUserId: userId } }),
    prisma.bookOrder.count({ where: { email: userEmail } }),
    prisma.like.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { poem: { select: { title: true, slug: true } } },
    }),
    prisma.comment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { poem: { select: { title: true, slug: true } } },
    }),
    prisma.invite.findMany({
      where: { inviterUserId: userId },
      orderBy: { sentAt: "desc" },
      take: 5,
    }),
  ]);

  const totalLikes = poemLikeCount + bookLikeCount + audioLikeCount;
  const totalComments = poemCommentCount + bookCommentCount + audioCommentCount;

  const stats = [
    { label: "Likes", value: totalLikes, href: "/account/likes" },
    { label: "Comments", value: totalComments, href: "/account/comments" },
    { label: "Invites Sent", value: inviteCount, href: "/account/invites" },
    { label: "Book Orders", value: orderCount, href: "/account/orders" },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
          >
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              {s.label}
            </p>
            <p className="text-2xl font-semibold text-white group-hover:text-amber-200 transition-colors">
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Likes */}
        <ActivityPanel title="Recent Likes" href="/account/likes">
          {recentPoemLikes.length === 0 ? (
            <EmptyText>No likes yet.</EmptyText>
          ) : (
            recentPoemLikes.map((like) => (
              <Link
                key={like.poemId}
                href={`/poems/${like.poem.slug}`}
                className="block rounded-xl border border-white/8 bg-black/15 p-3 transition-colors hover:bg-white/5"
              >
                <p className="truncate text-sm text-white/75">
                  {like.poem.title}
                </p>
                <p className="mt-1 text-xs text-white/35">
                  {formatDate(like.createdAt)}
                </p>
              </Link>
            ))
          )}
        </ActivityPanel>

        {/* Recent Comments */}
        <ActivityPanel title="Recent Comments" href="/account/comments">
          {recentComments.length === 0 ? (
            <EmptyText>No comments yet.</EmptyText>
          ) : (
            recentComments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-white/8 bg-black/15 p-3"
              >
                <p className="line-clamp-2 text-sm leading-6 text-white/70">
                  {comment.body}
                </p>
                <Link
                  href={`/poems/${comment.poem.slug}`}
                  className="mt-1.5 block truncate text-xs text-white/40 hover:text-white"
                >
                  {comment.poem.title}
                </Link>
              </div>
            ))
          )}
        </ActivityPanel>

        {/* Recent Invites */}
        <ActivityPanel title="Recent Invites" href="/account/invites">
          {recentInvites.length === 0 ? (
            <EmptyText>No invites sent yet.</EmptyText>
          ) : (
            recentInvites.map((invite) => (
              <div
                key={invite.id}
                className="rounded-xl border border-white/8 bg-black/15 p-3"
              >
                <p className="truncate text-sm text-white/75">
                  {invite.inviteeName}
                </p>
                <p className="mt-1 truncate text-xs text-white/40">
                  {invite.inviteeEmail}
                </p>
                <p className="mt-1 text-xs text-white/30">
                  {formatDate(invite.sentAt)}
                </p>
              </div>
            ))
          )}
        </ActivityPanel>
      </div>
    </div>
  );
}

function ActivityPanel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
          {title}
        </h2>
        <Link
          href={href}
          className="text-xs text-white/35 transition-colors hover:text-white"
        >
          View all →
        </Link>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-white/35">{children}</p>;
}
