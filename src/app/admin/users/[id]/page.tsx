import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/utils";
import { updateUserModeration, updateUserRole } from "../../user-actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "User Detail",
  description: "Review reader activity and moderation status.",
};

function roleBadgeClass(role: Role) {
  return role === "ADMIN"
    ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
    : "border-sky-400/25 bg-sky-500/10 text-sky-300";
}

function statusLabel(user: {
  flaggedAt: Date | null;
  disabledAt: Date | null;
}) {
  if (user.disabledAt) return "Disabled";
  if (user.flaggedAt) return "Flagged";
  return "Active";
}

function statusBadgeClass(user: {
  flaggedAt: Date | null;
  disabledAt: Date | null;
}) {
  if (user.disabledAt) {
    return "border-rose-400/30 bg-rose-500/10 text-rose-300";
  }
  if (user.flaggedAt) {
    return "border-amber-400/30 bg-amber-500/10 text-amber-300";
  }
  return "border-emerald-400/30 bg-emerald-500/10 text-emerald-300";
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      signUpSource: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      flaggedAt: true,
      disabledAt: true,
      moderationNote: true,
      _count: {
        select: {
          comments: true,
          likes: true,
          bookComments: true,
          bookLikes: true,
          audioComments: true,
          audioLikes: true,
          invites: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const [
    poemComments,
    bookComments,
    audioComments,
    poemLikes,
    bookLikes,
    audioLikes,
    invites,
    orders,
  ] = await Promise.all([
    prisma.comment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { poem: { select: { title: true, slug: true } } },
    }),
    prisma.bookComment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { book: { select: { title: true, slug: true } } },
    }),
    prisma.audioComment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { audio: { select: { title: true, slug: true } } },
    }),
    prisma.like.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { poem: { select: { title: true, slug: true } } },
    }),
    prisma.bookLike.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { book: { select: { title: true, slug: true } } },
    }),
    prisma.audioLike.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { audio: { select: { title: true, slug: true } } },
    }),
    prisma.invite.findMany({
      where: { inviterUserId: user.id },
      orderBy: { sentAt: "desc" },
      take: 12,
      include: { poem: { select: { title: true, slug: true } } },
    }),
    prisma.bookOrder.findMany({
      where: { email: user.email },
      orderBy: { createdAt: "desc" },
      take: 12,
      omit: { paymentData: true, paymentMime: true },
      include: { book: { select: { title: true, slug: true } } },
    }),
  ]);

  const allComments = [
    ...poemComments.map((comment) => ({
      id: comment.id,
      type: "Poem",
      targetTitle: comment.poem.title,
      targetHref: `/poems/${comment.poem.slug}`,
      body: comment.body,
      status: comment.status,
      pinned: comment.pinned,
      createdAt: comment.createdAt,
    })),
    ...bookComments.map((comment) => ({
      id: comment.id,
      type: "Book",
      targetTitle: comment.book.title,
      targetHref: `/books/${comment.book.slug}`,
      body: comment.body,
      status: comment.status,
      pinned: comment.pinned,
      createdAt: comment.createdAt,
    })),
    ...audioComments.map((comment) => ({
      id: comment.id,
      type: "Audio",
      targetTitle: comment.audio.title,
      targetHref: "/audio",
      body: comment.body,
      status: comment.status,
      pinned: comment.pinned,
      createdAt: comment.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 12);

  const allLikes = [
    ...poemLikes.map((like) => ({
      id: `${like.poemId}-poem`,
      type: "Poem",
      targetTitle: like.poem.title,
      targetHref: `/poems/${like.poem.slug}`,
      createdAt: like.createdAt,
    })),
    ...bookLikes.map((like) => ({
      id: `${like.bookId}-book`,
      type: "Book",
      targetTitle: like.book.title,
      targetHref: `/books/${like.book.slug}`,
      createdAt: like.createdAt,
    })),
    ...audioLikes.map((like) => ({
      id: `${like.audioId}-audio`,
      type: "Audio",
      targetTitle: like.audio.title,
      targetHref: "/audio",
      createdAt: like.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 12);

  const commentCount =
    user._count.comments + user._count.bookComments + user._count.audioComments;
  const likeCount =
    user._count.likes + user._count.bookLikes + user._count.audioLikes;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/users"
            className="mb-3 inline-flex text-xs tracking-[0.18em] text-white/40 uppercase hover:text-white"
          >
            Back to Users
          </Link>
          <h1 className="text-3xl text-white md:text-4xl">
            {user.name || "Unnamed reader"}
          </h1>
          <a
            href={`mailto:${user.email}`}
            className="mt-2 block text-sm text-white/45 hover:text-white"
          >
            {user.email}
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase ${roleBadgeClass(user.role)}`}
          >
            {user.role}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase ${statusBadgeClass(user)}`}
          >
            {statusLabel(user)}
          </span>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-start gap-4">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt=""
                className="h-16 w-16 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-white/60">
                {(user.name ?? user.email).charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ["Joined", formatDate(user.createdAt)],
                  ["Updated", formatDateTime(user.updatedAt)],
                  ["Signup Source", user.signUpSource || "Direct / unknown"],
                  [
                    "Email",
                    user.emailVerified
                      ? `Verified ${formatDate(user.emailVerified)}`
                      : "Not verified",
                  ],
                  ["Flagged", user.flaggedAt ? formatDateTime(user.flaggedAt) : "No"],
                  [
                    "Disabled",
                    user.disabledAt ? formatDateTime(user.disabledAt) : "No",
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="mb-1 text-[10px] tracking-[0.18em] text-white/35 uppercase">
                      {label}
                    </p>
                    <p className="text-sm text-white/75">{value}</p>
                  </div>
                ))}
              </div>
              {user.moderationNote && (
                <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
                  <p className="mb-1 text-[10px] tracking-[0.18em] text-amber-200/50 uppercase">
                    Moderation Note
                  </p>
                  <p className="text-sm leading-6 text-amber-50/80">
                    {user.moderationNote}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <form action={updateUserRole} className="space-y-3">
            <input type="hidden" name="userId" value={user.id} />
            <label className="block text-xs tracking-[0.18em] text-white/40 uppercase">
              Role
            </label>
            <div className="flex gap-2">
              <select
                name="role"
                defaultValue={user.role}
                className="h-10 flex-1 rounded-lg border border-white/10 bg-neutral-950 px-3 text-sm text-white outline-none focus:border-white/35"
              >
                <option value="READER">Reader</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                type="submit"
                className="rounded-lg border border-white/15 bg-white/10 px-4 text-xs font-semibold text-white/75 hover:bg-white/15 hover:text-white"
              >
                Save
              </button>
            </div>
          </form>

          <form action={updateUserModeration} className="space-y-3 border-t border-white/10 pt-4">
            <input type="hidden" name="userId" value={user.id} />
            <label className="block text-xs tracking-[0.18em] text-white/40 uppercase">
              Moderation Note
            </label>
            <textarea
              name="moderationNote"
              defaultValue={user.moderationNote ?? ""}
              rows={4}
              className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/35"
              placeholder="Reason, context, or follow-up notes"
            />
            <div className="grid grid-cols-3 gap-2">
              <button
                type="submit"
                name="action"
                value="flag"
                className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/15"
              >
                Flag
              </button>
              <button
                type="submit"
                name="action"
                value="disable"
                className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/15"
              >
                Disable
              </button>
              <button
                type="submit"
                name="action"
                value="restore"
                className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/15"
              >
                Restore
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Comments", commentCount],
          ["Likes", likeCount],
          ["Invites", user._count.invites],
          ["Orders", orders.length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="mb-1 text-[10px] tracking-[0.18em] text-white/35 uppercase">
              {label}
            </p>
            <p className="text-2xl text-white">{value}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <ActivityPanel title="Moderation History">
          <div className="space-y-3 text-sm">
            {user.flaggedAt || user.disabledAt || user.moderationNote ? (
              <>
                {user.flaggedAt && (
                  <HistoryRow
                    label="Flagged"
                    value={formatDateTime(user.flaggedAt)}
                  />
                )}
                {user.disabledAt && (
                  <HistoryRow
                    label="Disabled"
                    value={formatDateTime(user.disabledAt)}
                  />
                )}
                {user.moderationNote && (
                  <HistoryRow label="Latest note" value={user.moderationNote} />
                )}
              </>
            ) : (
              <EmptyText>No moderation actions recorded.</EmptyText>
            )}
          </div>
        </ActivityPanel>

        <ActivityPanel title="Recent Orders">
          {orders.length === 0 ? (
            <EmptyText>No matching book orders.</EmptyText>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-white/10 bg-black/15 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-white">{order.book.title}</p>
                    <p className="mt-1 text-xs text-white/40">
                      #{order.orderNumber ?? order.id} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/55">
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </ActivityPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <ActivityPanel title="Recent Comments">
          {allComments.length === 0 ? (
            <EmptyText>No comments yet.</EmptyText>
          ) : (
            allComments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-white/10 bg-black/15 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/50">
                    {comment.type}
                  </span>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/50">
                    {comment.status}
                  </span>
                  {comment.pinned && (
                    <span className="rounded-full border border-amber-400/20 px-2 py-0.5 text-[10px] text-amber-300">
                      Pinned
                    </span>
                  )}
                </div>
                <p className="line-clamp-3 text-sm leading-6 text-white/70">
                  {comment.body}
                </p>
                <Link
                  href={comment.targetHref}
                  target="_blank"
                  className="mt-2 block truncate text-xs text-white/40 hover:text-white"
                >
                  {comment.targetTitle}
                </Link>
              </div>
            ))
          )}
        </ActivityPanel>

        <ActivityPanel title="Recent Likes">
          {allLikes.length === 0 ? (
            <EmptyText>No likes yet.</EmptyText>
          ) : (
            allLikes.map((like) => (
              <Link
                key={like.id}
                href={like.targetHref}
                target="_blank"
                className="block rounded-xl border border-white/10 bg-black/15 p-3 hover:bg-white/5"
              >
                <p className="text-xs text-white/40">{like.type}</p>
                <p className="mt-1 truncate text-sm text-white/75">
                  {like.targetTitle}
                </p>
                <p className="mt-1 text-xs text-white/35">
                  {formatDate(like.createdAt)}
                </p>
              </Link>
            ))
          )}
        </ActivityPanel>

        <ActivityPanel title="Recent Invites">
          {invites.length === 0 ? (
            <EmptyText>No invites sent.</EmptyText>
          ) : (
            invites.map((invite) => (
              <div key={invite.id} className="rounded-xl border border-white/10 bg-black/15 p-3">
                <p className="truncate text-sm text-white/75">
                  {invite.inviteeName}
                </p>
                <p className="mt-1 truncate text-xs text-white/40">
                  {invite.inviteeEmail}
                </p>
                <p className="mt-2 text-xs text-white/35">
                  {formatDate(invite.sentAt)}
                  {invite.poem ? ` · ${invite.poem.title}` : ""}
                </p>
              </div>
            ))
          )}
        </ActivityPanel>
      </section>
    </div>
  );
}

function ActivityPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-sm tracking-[0.18em] text-white/50 uppercase">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-white/35">{children}</p>;
}

function HistoryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 p-3">
      <p className="mb-1 text-[10px] tracking-[0.18em] text-white/35 uppercase">
        {label}
      </p>
      <p className="text-sm leading-6 text-white/70">{value}</p>
    </div>
  );
}
