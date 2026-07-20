import React from "react";
import { Send } from "lucide-react";

type CampaignsTabProps = {
  campaignData: {
    totalCampaignsSent: number;
    averageOpenRate: number;
    averageClickRate: number;
    campaignHistory: Array<{
      id: string;
      subject: string;
      sentAt: string;
      sentCount: number;
      openRate: number;
      clickRate: number;
    }>;
  };
};

export default function CampaignsTab({ campaignData }: CampaignsTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Key Email Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.02] p-5 hover:border-sky-500/35 hover:bg-sky-500/[0.03] transition-all">
          <p className="mb-2 text-[10px] tracking-widest text-sky-400/60 uppercase font-semibold">
            Sent Campaigns
          </p>
          <p className="text-3xl font-bold text-sky-400">{campaignData.totalCampaignsSent}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-white/20 hover:bg-white/[0.03] transition-all">
          <p className="mb-2 text-[10px] tracking-widest text-white/40 uppercase font-semibold">
            Average Open Rate
          </p>
          <p className="text-3xl font-bold text-white">{campaignData.averageOpenRate.toFixed(1)}%</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-5 hover:border-emerald-500/35 hover:bg-emerald-500/[0.03] transition-all">
          <p className="mb-2 text-[10px] tracking-widest text-emerald-400/60 uppercase font-semibold">
            Average CTR
          </p>
          <p className="text-3xl font-bold text-emerald-400">{campaignData.averageClickRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Campaign History Log */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
            <Send className="h-4 w-4 text-sky-400" />
            Campaign Performance History
          </h3>
        </div>
        <div className="divide-y divide-white/5">
          {campaignData.campaignHistory.length === 0 ? (
            <p className="p-8 text-center text-xs text-white/30 italic">No sent campaigns found.</p>
          ) : (
            campaignData.campaignHistory.map((camp) => (
              <div key={camp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-[family-name:var(--font-inter)] hover:bg-white/[0.01]">
                <div className="min-w-0 space-y-1">
                  <p className="font-bold text-white text-sm truncate max-w-[340px]" title={camp.subject}>
                    {camp.subject}
                  </p>
                  <p className="text-[10px] text-white/40">
                    Sent on {new Date(camp.sentAt).toLocaleDateString()} at {new Date(camp.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — To {camp.sentCount} recipients
                  </p>
                </div>
                <div className="flex items-center gap-6 shrink-0 text-right">
                  <div className="space-y-1 min-w-[70px]">
                    <span className="text-[9px] uppercase tracking-wide text-white/40 font-semibold block">Open Rate</span>
                    <span className="font-bold text-white">{camp.openRate.toFixed(1)}%</span>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full mt-0.5">
                      <div className="h-full bg-sky-400" style={{ width: `${camp.openRate}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1 min-w-[70px]">
                    <span className="text-[9px] uppercase tracking-wide text-emerald-400/60 font-semibold block">Click Rate (CTR)</span>
                    <span className="font-bold text-emerald-400">{camp.clickRate.toFixed(1)}%</span>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full mt-0.5">
                      <div className="h-full bg-emerald-500" style={{ width: `${camp.clickRate}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
