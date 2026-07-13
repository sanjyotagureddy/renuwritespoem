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
    recentBookLikes,
    recentAudioLikes,
    recentComments,
    recentBookComments,
    recentAudioComments,
    recentInvites,
    recentPoemViews,
    recentBookViews,
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
    prisma.bookLike.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { book: { select: { title: true, slug: true } } },
    }),
    prisma.audioLike.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { audio: { select: { title: true, slug: true } } },
    }),
    prisma.comment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { poem: { select: { title: true, slug: true } } },
    }),
    prisma.bookComment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { book: { select: { title: true, slug: true } } },
    }),
    prisma.audioComment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { audio: { select: { title: true, slug: true } } },
    }),
    prisma.invite.findMany({
      where: { inviterUserId: userId },
      orderBy: { sentAt: "desc" },
      take: 5,
    }),
    prisma.readerPoemView.findMany({
      where: { userId }, orderBy: { viewedAt: "desc" }, take: 5,
      include: { poem: { select: { title: true, slug: true } } },
    }),
    prisma.readerBookView.findMany({
      where: { userId }, orderBy: { viewedAt: "desc" }, take: 5,
      include: { book: { select: { title: true, slug: true } } },
    }),
  ]);

  const totalLikes = poemLikeCount + bookLikeCount + audioLikeCount;
  const totalComments = poemCommentCount + bookCommentCount + audioCommentCount;
  const recentLikes = [
    ...recentPoemLikes.map((like) => ({
      id: `poem-${like.poemId}`,
      href: `/poems/${like.poem.slug}`,
      title: like.poem.title,
      type: "Poem",
      createdAt: like.createdAt,
    })),
    ...recentBookLikes.map((like) => ({
      id: `book-${like.bookId}`,
      href: `/books/${like.book.slug}`,
      title: like.book.title,
      type: "Book",
      createdAt: like.createdAt,
    })),
    ...recentAudioLikes.map((like) => ({
      id: `audio-${like.audioId}`,
      href: `/audio/${like.audio.slug}`,
      title: like.audio.title,
      type: "Audio",
      createdAt: like.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  const recentActivityComments = [
    ...recentComments.map((comment) => ({
      id: `poem-${comment.id}`,
      body: comment.body,
      href: `/poems/${comment.poem.slug}`,
      title: comment.poem.title,
      type: "Poem",
      createdAt: comment.createdAt,
    })),
    ...recentBookComments.map((comment) => ({
      id: `book-${comment.id}`,
      body: comment.body,
      href: `/books/${comment.book.slug}`,
      title: comment.book.title,
      type: "Book",
      createdAt: comment.createdAt,
    })),
    ...recentAudioComments.map((comment) => ({
      id: `audio-${comment.id}`,
      body: comment.body,
      href: `/audio/${comment.audio.slug}`,
      title: comment.audio.title,
      type: "Audio",
      createdAt: comment.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  const recentViews = [
    ...recentPoemViews.map((view) => ({ id: `poem-${view.poemId}`, href: `/poems/${view.poem.slug}`, title: view.poem.title, type: "Poem", viewedAt: view.viewedAt })),
    ...recentBookViews.map((view) => ({ id: `book-${view.bookId}`, href: `/books/${view.book.slug}`, title: view.book.title, type: "Book", viewedAt: view.viewedAt })),
  ].sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime()).slice(0, 5);

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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Likes */}
        <ActivityPanel title="Recent Likes" href="/account/likes">
          {recentLikes.length === 0 ? (
            <EmptyText>No likes yet.</EmptyText>
          ) : (
            recentLikes.map((like) => (
              <Link
                key={like.id}
                href={like.href}
                className="block rounded-xl border border-white/8 bg-black/15 p-3 transition-colors hover:bg-white/5"
              >
                <p className="truncate text-sm text-white/75">{like.title}</p>
                <p className="mt-1 text-xs text-white/35">
                  {like.type} · {formatDate(like.createdAt)}
                </p>
              </Link>
            ))
          )}
        </ActivityPanel>

        {/* Recent Comments */}
        <ActivityPanel title="Recent Comments" href="/account/comments">
          {recentActivityComments.length === 0 ? (
            <EmptyText>No comments yet.</EmptyText>
          ) : (
            recentActivityComments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-white/8 bg-black/15 p-3"
              >
                <p className="line-clamp-2 text-sm leading-6 text-white/70">
                  {comment.body}
                </p>
                <Link
                  href={comment.href}
                  className="mt-1.5 block truncate text-xs text-white/40 hover:text-white"
                >
                  {comment.type} · {comment.title}
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

        <ActivityPanel title="Recently Viewed" href="/account/library">
          {recentViews.length === 0 ? (
            <EmptyText>Content you view while signed in will appear here.</EmptyText>
          ) : (
            recentViews.map((view) => (
              <Link key={view.id} href={view.href} className="block rounded-xl border border-white/8 bg-black/15 p-3 transition-colors hover:bg-white/5">
                <p className="truncate text-sm text-white/75">{view.title}</p>
                <p className="mt-1 text-xs text-white/35">{view.type} · {formatDate(view.viewedAt)}</p>
              </Link>
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
