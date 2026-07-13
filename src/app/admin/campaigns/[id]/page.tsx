import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import DeliveryLogsClient from "./delivery-logs-client";

export const metadata: Metadata = {
  title: "Campaign Details & Analytics — Admin",
};

interface CampaignDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  const { id } = await params;
  const prisma = getPrisma();

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      deliveries: {
        orderBy: { sentAt: "desc" },
        include: {
          clicks: true,
        },
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  const totalRecipients = campaign.sentCount + campaign.failedCount;
  const allDeliveries = campaign.deliveries;
  
  // Calculate delivery stats
  const successfulDeliveries = allDeliveries.filter((d) => d.status === "SUCCESS");
  const totalSuccessCount = successfulDeliveries.length;
  
  // Calculate open stats
  const openedDeliveries = successfulDeliveries.filter((d) => d.openedAt !== null);
  const totalOpensCount = openedDeliveries.length;
  const openRate = totalSuccessCount > 0 ? (totalOpensCount / totalSuccessCount) * 100 : 0;
  
  // Calculate click stats
  const clickedDeliveries = successfulDeliveries.filter((d) => d.clicks.length > 0);
  const totalClicksCount = clickedDeliveries.length;
  const clickRate = totalSuccessCount > 0 ? (totalClicksCount / totalSuccessCount) * 100 : 0;

  // Aggregate clicked links across all deliveries
  const linkCountsMap: Record<string, number> = {};
  allDeliveries.forEach((d) => {
    d.clicks.forEach((c) => {
      linkCountsMap[c.url] = (linkCountsMap[c.url] || 0) + 1;
    });
  });

  const topClickedLinks = Object.entries(linkCountsMap)
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count);

  const maxClickCount = topClickedLinks.length > 0 ? Math.max(...topClickedLinks.map((l) => l.count)) : 1;

  return (
    <div className="space-y-6 font-[family-name:var(--font-inter)] text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-semibold">Campaign Details &amp; Analytics</h2>
          <p className="text-xs text-white/40 mt-1">
            Review mailing metrics, subscriber outcomes, and SMTP delivery traces.
          </p>
        </div>
        <Link
          href="/admin/campaigns"
          className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
        >
          ← Back to Campaigns
        </Link>
      </div>

      {/* Campaign Metadata Details */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
        <div>
          <span className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">Subject</span>
          <h3 className="text-lg font-semibold text-white mt-0.5">{campaign.subject}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div>
            <span className="text-[10px] font-semibold tracking-wide text-white/40 uppercase block">Status</span>
            <span className={`inline-block mt-1.5 rounded-full px-2.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider ${
              campaign.status === "SENT" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
              campaign.status === "SENDING" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
              campaign.status === "FAILED" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
              "bg-white/10 text-white/70 border border-white/20"
            }`}>
              {campaign.status}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold tracking-wide text-white/40 uppercase block">Created At</span>
            <span className="text-xs font-medium block mt-1.5 text-white/80">
              {new Date(campaign.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {campaign.sentAt && (
            <div>
              <span className="text-[10px] font-semibold tracking-wide text-white/40 uppercase block">Dispatched At</span>
              <span className="text-xs font-medium block mt-1.5 text-white/80">
                {new Date(campaign.sentAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Summary Cards - Row 1 (Delivery Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.01] p-5 text-center">
          <span className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">Total Target Recipients</span>
          <p className="text-3xl font-bold mt-2 text-white">{totalRecipients}</p>
        </div>

        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-5 text-center">
          <span className="text-[10px] font-semibold tracking-wide text-emerald-400/60 uppercase">Successful Deliveries</span>
          <p className="text-3xl font-bold mt-2 text-emerald-400">{campaign.sentCount}</p>
        </div>

        <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-5 text-center">
          <span className="text-[10px] font-semibold tracking-wide text-rose-400/60 uppercase">Failed / Suppressed</span>
          <p className="text-3xl font-bold mt-2 text-rose-400">{campaign.failedCount}</p>
        </div>
      </div>

      {/* Analytics Summary Cards - Row 2 (Engagement Stats) */}
      {campaign.status === "SENT" && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.01] p-5 text-center">
            <span className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">Unique Opens</span>
            <p className="text-3xl font-bold mt-2 text-sky-400">{totalOpensCount}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.01] p-5 text-center">
            <span className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">Unique Clicks</span>
            <p className="text-3xl font-bold mt-2 text-indigo-400">{totalClicksCount}</p>
          </div>

          <div className="rounded-xl border border-sky-500/10 bg-sky-500/5 p-5 text-center">
            <span className="text-[10px] font-semibold tracking-wide text-sky-400/60 uppercase block">Open Rate</span>
            <p className="text-3xl font-bold mt-2 text-sky-400">{openRate.toFixed(1)}%</p>
          </div>

          <div className="rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-5 text-center">
            <span className="text-[10px] font-semibold tracking-wide text-indigo-400/60 uppercase block">Click-Through Rate</span>
            <p className="text-3xl font-bold mt-2 text-indigo-400">{clickRate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Top Clicked Links */}
      {topClickedLinks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold tracking-wider text-white/50 uppercase">Top Clicked Links</h4>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            {topClickedLinks.map(({ url, count }) => (
              <div key={url} className="space-y-2">
                <div className="flex justify-between text-xs items-center">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline truncate max-w-[80%] font-mono"
                  >
                    {url}
                  </a>
                  <span className="text-white/60 font-semibold">{count} {count === 1 ? "click" : "clicks"}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${(count / maxClickCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipients Log Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold tracking-wider text-white/50 uppercase">Recipient Delivery Logs</h4>
        <DeliveryLogsClient deliveries={campaign.deliveries} />
      </div>
    </div>
  );
}

