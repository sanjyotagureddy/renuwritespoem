import React from "react";
import AttributionAnalyticsTable from "../attribution-analytics-table";
import { Share2, Eye } from "lucide-react";

type AudienceGrowthTabProps = {
  invitesSentThisWeek: number;
  invitesAcceptedThisWeek: number;
  inviteConversionRate: number;
  subscribersThisWeek: number;
  topSharedPoems: Array<{
    title: string;
    slug: string;
    views: number;
    _count: { invites: number };
  }>;
  attributionData: Array<{ source: string; clicks: number; signups: number }>;
};

export default function AudienceGrowthTab({
  invitesSentThisWeek,
  invitesAcceptedThisWeek,
  inviteConversionRate,
  subscribersThisWeek,
  topSharedPoems,
  attributionData,
}: AudienceGrowthTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Snapshots */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-white/20 hover:bg-white/[0.03] transition-all">
          <p className="mb-2 text-[10px] tracking-widest text-white/40 uppercase font-semibold">
            Invites Sent (7d)
          </p>
          <p className="text-3xl font-bold text-white">{invitesSentThisWeek}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-5 hover:border-emerald-500/35 hover:bg-emerald-500/[0.03] transition-all">
          <p className="mb-2 text-[10px] tracking-widest text-emerald-400/60 uppercase font-semibold">
            Invites Accepted (7d)
          </p>
          <p className="text-3xl font-bold text-emerald-400">{invitesAcceptedThisWeek}</p>
        </div>
        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.02] p-5 hover:border-sky-500/35 hover:bg-sky-500/[0.03] transition-all">
          <p className="mb-2 text-[10px] tracking-widest text-sky-400/60 uppercase font-semibold">
            Invite Conv. Rate
          </p>
          <p className="text-3xl font-bold text-sky-400">{inviteConversionRate}%</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.02] p-5 hover:border-amber-500/35 hover:bg-amber-500/[0.03] transition-all">
          <p className="mb-2 text-[10px] tracking-widest text-amber-400/60 uppercase font-semibold">
            New Subscribers (7d)
          </p>
          <p className="text-3xl font-bold text-amber-400">{subscribersThisWeek}</p>
        </div>
      </div>

      {/* Visual Conversion Funnel Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-6 space-y-4">
        <h3 className="text-xs font-bold tracking-wider text-white uppercase">
          Growth conversion Funnel
        </h3>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center space-y-1 relative">
            <span className="text-[10px] uppercase text-white/40 tracking-wider font-semibold">Step 1: Invites Sent</span>
            <p className="text-2xl font-bold text-white">{invitesSentThisWeek}</p>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-white/40 w-full" />
            </div>
          </div>
          <div className="flex items-center justify-center shrink-0">
            <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 text-xs text-sky-400 font-bold">
              {inviteConversionRate}% Conversion
            </span>
          </div>
          <div className="flex-1 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl p-4 text-center space-y-1 relative">
            <span className="text-[10px] uppercase text-emerald-400/60 tracking-wider font-semibold">Step 2: Signups Accepted</span>
            <p className="text-2xl font-bold text-emerald-400">{invitesAcceptedThisWeek}</p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${inviteConversionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Shared Poems */}
        <div className="lg:col-span-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
              <Share2 className="h-4 w-4 text-emerald-400" />
              Top Shared Poems
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {topSharedPoems.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/30 italic">No shares yet.</div>
            ) : (
              topSharedPoems.map((poem) => (
                <div key={poem.slug} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.01]">
                  <p className="text-xs font-semibold text-white/90 truncate max-w-[200px]" title={poem.title}>
                    {poem.title}
                  </p>
                  <div className="flex shrink-0 items-center gap-4 text-[10px] text-white/50">
                    <span className="flex items-center gap-1" title="Views">
                      <Eye className="h-3 w-3" />
                      {poem.views}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400" title="Invites Sent">
                      <Share2 className="h-3 w-3" />
                      {poem._count.invites}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attribution Table */}
        <div className="lg:col-span-7 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Attribution Channels</h3>
            <p className="text-[10px] text-white/40">Traffic sources leading to reader actions.</p>
          </div>
          <AttributionAnalyticsTable data={attributionData} />
        </div>
      </div>
    </div>
  );
}
