import type { Metadata } from "next";
import Link from "next/link";
import { Role } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { formatDate, generateAvatarUrl } from "@/lib/utils";
import { updateUserRole, adminResendVerification, adminSendPasswordReset } from "../actions/user-actions";

async function handleResendVerification(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  try {
    await adminResendVerification(userId);
  } catch (err) {
    console.error("Admin resend verification failed:", err);
  }
}

async function handleSendPasswordReset(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  try {
    await adminSendPasswordReset(userId);
  } catch (err) {
    console.error("Admin send password reset failed:", err);
  }
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage reader accounts and admin roles.",
};

const PAGE_SIZE = 15;

type PageProps = {
  searchParams: Promise<{
    q?: string;
    role?: string;
    page?: string;
  }>;
};

function buildUrl({
  q,
  role,
  page,
}: {
  q?: string;
  role?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (role && role !== "ALL") params.set("role", role);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/admin/users${qs ? `?${qs}` : ""}`;
}

function roleBadgeClass(role: Role) {
  return role === "ADMIN"
    ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
    : "border-sky-400/25 bg-sky-500/10 text-sky-300";
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const prisma = getPrisma();

  const q = params.q?.trim() ?? "";
  const selectedRole =
    params.role === "ADMIN" || params.role === "READER" ? params.role : "ALL";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(selectedRole === "ALL" ? {} : { role: selectedRole as Role }),
    ...(q
      ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
        ],
      }
      : {}),
  };

  const [
    users,
    totalCount,
    adminCount,
    readerCount,
    recentCount,
    flaggedCount,
    disabledCount,
    orderCounts,
  ] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        signUpSource: true,
        createdAt: true,
        emailVerified: true,
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
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "READER" } }),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.user.count({ where: { flaggedAt: { not: null } } }),
    prisma.user.count({ where: { disabledAt: { not: null } } }),
    prisma.bookOrder.groupBy({
      by: ["email"],
      _count: { id: true },
    }),
  ]);

  const orderCountByEmail = new Map(
    orderCounts.map((order) => [order.email.toLowerCase(), order._count.id]),
  );
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasNext = page < totalPages;
  const tabs = [
    { key: "ALL", label: "All", count: adminCount + readerCount },
    { key: "ADMIN", label: "Admins", count: adminCount },
    { key: "READER", label: "Readers", count: readerCount },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl text-white md:text-4xl">Users</h1>
          <p className="mt-2 text-sm text-white/45">
            Search readers, review activity, and manage admin access.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Total Users", adminCount + readerCount],
          ["Admins", adminCount],
          ["Flagged", flaggedCount],
          ["Disabled", disabledCount],
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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Readers", readerCount],
          ["New 7d", recentCount],
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

      <form
        action="/admin/users"
        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row"
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or email"
          className="min-h-10 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/35"
        />
        {selectedRole !== "ALL" && (
          <input type="hidden" name="role" value={selectedRole} />
        )}
        <button
          type="submit"
          className="rounded-lg border border-white/15 bg-white/10 px-5 py-2 text-xs font-semibold tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/15"
        >
          Search
        </button>
        {(q || selectedRole !== "ALL") && (
          <Link
            href="/admin/users"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs text-white/45 transition-colors hover:bg-white/5 hover:text-white"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/10">
        {tabs.map((tab) => {
          const isActive = selectedRole === tab.key;
          return (
            <Link
              key={tab.key}
              href={buildUrl({ q, role: tab.key })}
              className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${isActive
                  ? "border-b-2 border-amber-400 bg-white/5 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-white/10 text-white/40"
                  }`}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="mb-2 text-white/60">No users found.</p>
          <p className="text-sm text-white/35">
            Try clearing the search or switching role filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] tracking-[0.18em] text-white/40 uppercase">
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Activity</th>
                  <th className="px-5 py-3 font-semibold">Source</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Manage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {users.map((user) => {
                  const commentCount =
                    user._count.comments +
                    user._count.bookComments +
                    user._count.audioComments;
                  const likeCount =
                    user._count.likes +
                    user._count.bookLikes +
                    user._count.audioLikes;
                  const orderCount =
                    orderCountByEmail.get(user.email.toLowerCase()) ?? 0;

                  return (
                    <tr key={user.id} className="text-white/75">
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.image}
                              alt=""
                              className="h-10 w-10 rounded-full border border-white/10 object-cover"
                            />
                          ) : (
                            <img
                              src={generateAvatarUrl(user.id || user.email)}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-full border border-white/10 bg-white/5 object-cover"
                            />
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="block truncate font-medium text-white hover:text-amber-200"
                            >
                              {user.name || "Unnamed reader"}
                            </Link>
                            <a
                              href={`mailto:${user.email}`}
                              className="truncate text-xs text-white/45 transition-colors hover:text-white"
                            >
                              {user.email}
                            </a>
                            {user.emailVerified ? (
                              <p className="mt-0.5 text-[10px] text-emerald-300/70 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                Verified
                              </p>
                            ) : user.signUpSource === "credentials" ? (
                              <p className="mt-0.5 text-[10px] text-amber-400/70 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                                Pending verification
                              </p>
                            ) : (
                              <p className="mt-0.5 text-[10px] text-white/30">
                                Unverified
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase ${roleBadgeClass(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase ${user.disabledAt
                                ? "border-rose-400/30 bg-rose-500/10 text-rose-300"
                                : user.flaggedAt
                                  ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                                  : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                              }`}
                          >
                            {user.disabledAt
                              ? "Disabled"
                              : user.flaggedAt
                                ? "Flagged"
                                : "Active"}
                          </span>
                          {user.moderationNote && (
                            <span className="max-w-40 truncate text-[10px] text-white/35">
                              {user.moderationNote}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2 text-xs text-white/50">
                          <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1">
                            {commentCount} comments
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1">
                            {likeCount} likes
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1">
                            {user._count.invites} invites
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1">
                            {orderCount} orders
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-white/45">
                        {user.signUpSource || "Direct / unknown"}
                      </td>
                      <td className="px-5 py-4 text-xs text-white/45">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2 items-end">
                          <form
                            action={updateUserRole}
                            className="flex justify-end gap-2"
                          >
                            <input type="hidden" name="userId" value={user.id} />
                            <select
                              name="role"
                              defaultValue={user.role}
                              className="h-9 rounded-lg border border-white/10 bg-neutral-950 px-2 text-xs text-white outline-none focus:border-white/35"
                            >
                              <option value="READER">Reader</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                            <button
                              type="submit"
                              className="h-9 rounded-lg border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white/75 transition-colors hover:bg-white/15 hover:text-white"
                            >
                              Save
                            </button>
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="inline-flex h-9 items-center rounded-lg px-3 text-xs font-semibold text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                            >
                              View
                            </Link>
                          </form>
                          {user.signUpSource === "credentials" && (
                            <div className="flex gap-2">
                              {!user.emailVerified && (
                                <form action={handleResendVerification}>
                                  <input type="hidden" name="userId" value={user.id} />
                                  <button
                                    type="submit"
                                    className="h-7 rounded-lg border border-sky-400/20 bg-sky-500/10 px-2.5 text-[10px] font-semibold text-sky-300 transition-colors hover:bg-sky-500/20"
                                  >
                                    Resend Verify
                                  </button>
                                </form>
                              )}
                              <form action={handleSendPasswordReset}>
                                <input type="hidden" name="userId" value={user.id} />
                                <button
                                  type="submit"
                                  className="h-7 rounded-lg border border-amber-400/20 bg-amber-500/10 px-2.5 text-[10px] font-semibold text-amber-300 transition-colors hover:bg-amber-400/20"
                                >
                                  Reset Password
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <span className="text-xs text-white/50">
          Page <strong className="font-semibold text-white/80">{page}</strong>{" "}
          of{" "}
          <strong className="font-semibold text-white/80">{totalPages}</strong>{" "}
          · {totalCount} users
        </span>
        <div className="flex gap-2">
          <Link
            href={buildUrl({ q, role: selectedRole, page: page - 1 })}
            className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${page === 1
                ? "pointer-events-none cursor-not-allowed border-white/5 bg-white/[0.01] text-white/20"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
          >
            Previous
          </Link>
          <Link
            href={buildUrl({ q, role: selectedRole, page: page + 1 })}
            className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${!hasNext
                ? "pointer-events-none cursor-not-allowed border-white/5 bg-white/[0.01] text-white/20"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
