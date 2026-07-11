import { getPrisma } from "@/lib/db";
import AttributionAnalyticsTable from "@/components/admin/attribution-analytics-table";

export default async function AnalyticsDashboard() {
  const prisma = getPrisma();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    clicksBySource,
    signupsBySource,
    invitesSentThisWeek,
    invitesAcceptedThisWeek,
    subscribersThisWeek,
    topSharedPoems,
  ] = await Promise.all([
    prisma.attributionLog.groupBy({
      by: ["source"],
      _count: { id: true }
    }),
    prisma.user.groupBy({
      by: ["signUpSource"],
      where: { signUpSource: { not: null } },
      _count: { id: true }
    }),
    prisma.invite.count({ where: { sentAt: { gte: sevenDaysAgo } } }),
    prisma.invite.count({ where: { signedUpAt: { gte: sevenDaysAgo } } }),
    prisma.subscriber.count({ where: { subscribedAt: { gte: sevenDaysAgo } } }),
    prisma.poem.findMany({
      orderBy: { invites: { _count: "desc" } },
      take: 5,
      select: {
        title: true,
        slug: true,
        views: true,
        _count: { select: { invites: true } }
      }
    })
  ]);

  const sourceMap: Record<string, { clicks: number; signups: number }> = {};

  clicksBySource.forEach((c) => {
    if (c.source) {
      const src = c.source.toLowerCase();
      if (!sourceMap[src]) sourceMap[src] = { clicks: 0, signups: 0 };
      sourceMap[src].clicks += c._count.id;
    }
  });

  signupsBySource.forEach((s) => {
    if (s.signUpSource) {
      const src = s.signUpSource.toLowerCase();
      if (!sourceMap[src]) sourceMap[src] = { clicks: 0, signups: 0 };
      sourceMap[src].signups += s._count.id;
    }
  });

  const attributionData = Object.entries(sourceMap)
    .map(([source, stats]) => ({
      source,
      clicks: stats.clicks,
      signups: stats.signups,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl text-white md:text-4xl">Analytics</h1>
      </div>

      {/* Growth Snapshot */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl text-white">Growth Snapshot</h2>
          <p className="mt-1 text-xs text-white/40">Weekly performance of growth features and sharing.</p>
        </div>
        
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
            <p className="mb-2 text-xs tracking-[0.18em] text-white/40 uppercase">
              Invites Sent (7d)
            </p>
            <p className="text-3xl text-white">{invitesSentThisWeek}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
            <p className="mb-2 text-xs tracking-[0.18em] text-white/40 uppercase">
              Invites Accepted (7d)
            </p>
            <p className="text-3xl text-emerald-400">{invitesAcceptedThisWeek}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
            <p className="mb-2 text-xs tracking-[0.18em] text-white/40 uppercase">
              New Subscribers (7d)
            </p>
            <p className="text-3xl text-amber-400">{subscribersThisWeek}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/3">
          <div className="border-b border-white/10 bg-white/2 px-5 py-4">
            <h3 className="text-sm tracking-wider text-white uppercase">Top Shared Poems</h3>
          </div>
          <div className="divide-y divide-white/8">
            {topSharedPoems.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-[family-name:var(--font-inter)] text-white/50">
                  No shares yet.
                </p>
              </div>
            ) : (
              topSharedPoems.map((poem) => (
                <div key={poem.slug} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{poem.title}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-1" title="Views">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {poem.views}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400/80" title="Invites Sent">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      {poem._count.invites}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Attribution Analytics */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl text-white">Attribution Analytics</h2>
          <p className="text-xs text-white/40 mt-1">Track which sharing channels drive the most traffic and signup conversions.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/3 p-5">
          <AttributionAnalyticsTable data={attributionData} />
        </div>
      </section>
    </div>
  );
}
