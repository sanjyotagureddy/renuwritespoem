import type { Metadata } from "next";
import { getPrisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Invitations Dashboard",
};

export default async function AdminInvitesPage() {
  const prisma = getPrisma();

  const [totalInvites, dailyInvites, suppressedCount, recentInvites] = await Promise.all([
    prisma.invite.count(),
    prisma.invite.count({
      where: { sentAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    }),
    prisma.unsubscribedEmail.count(),
    prisma.invite.findMany({
      orderBy: { sentAt: "desc" },
      take: 20,
      include: {
        inviter: { select: { email: true, name: true } },
        poem: { select: { title: true } }
      }
    })
  ]);

  const topInvitersGroup = await prisma.invite.groupBy({
    by: ["inviterUserId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5
  });

  const topInviters = await Promise.all(
    topInvitersGroup.map(async (group) => {
      const user = await prisma.user.findUnique({
        where: { id: group.inviterUserId },
        select: { name: true, email: true }
      });
      return {
        name: user?.name ?? "Unknown",
        email: user?.email ?? "Unknown",
        count: group._count.id
      };
    })
  );

  return (
    <div className="space-y-8 font-[family-name:var(--font-inter)]">
      <div>
        <h1 className="text-3xl text-white font-serif">Invitations Monitoring</h1>
        <p className="text-sm text-white/50 mt-1">Monitor sharing limits and abuse prevention metrics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/2 p-6">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Total Invites Sent</p>
          <p className="text-3xl font-medium text-white">{totalInvites}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/2 p-6">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Sent (Last 24 Hours)</p>
          <p className="text-3xl font-medium text-white">{dailyInvites}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/2 p-6">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Suppressed Emails</p>
          <p className="text-3xl font-medium text-amber-400">{suppressedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Recent Invites */}
        <div className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-base font-semibold text-white">Recent Invitations</h2>
          </div>
          {recentInvites.length === 0 ? (
            <div className="p-8 text-center text-sm text-white/40">No invitations sent yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.01] text-white/55">
                    <th className="px-6 py-3 font-semibold">Sent At</th>
                    <th className="px-6 py-3 font-semibold">Inviter</th>
                    <th className="px-6 py-3 font-semibold">Invitee (Friend)</th>
                    <th className="px-6 py-3 font-semibold">Target Poem</th>
                    <th className="px-6 py-3 font-semibold">Personal Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {recentInvites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-white/60">
                        {formatDate(invite.sentAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-white">{invite.inviter.name || "Reader"}</div>
                        <div className="text-white/40 text-[10px]">{invite.inviter.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-white">{invite.inviteeName}</div>
                        <div className="text-white/40 text-[10px]">{invite.inviteeEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white/70">
                        {invite.poem?.title || <span className="text-white/30 italic">General Site</span>}
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-white/60 italic">
                        {invite.personalNote || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Inviters */}
        <div className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-base font-semibold text-white">Top Inviters</h2>
          </div>
          {topInviters.length === 0 ? (
            <div className="p-8 text-center text-sm text-white/40">No invitations sent yet.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {topInviters.map((user) => (
                <div key={user.email} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{user.email}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="inline-flex items-center rounded-full bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-300">
                      {user.count} sent
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
