import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";

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
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  const totalRecipients = campaign.sentCount + campaign.failedCount;

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

      {/* Analytics Summary Cards */}
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

      {/* Recipients Log Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold tracking-wider text-white/50 uppercase">Recipient Delivery Logs</h4>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-left text-xs text-white/60">
            <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] font-semibold tracking-wider text-white/45 uppercase">
              <tr>
                <th className="px-6 py-4">Recipient Email</th>
                <th className="px-6 py-4">Delivery Status</th>
                <th className="px-6 py-4">Trace Details / Fail Reason</th>
                <th className="px-6 py-4 text-right">Delivery Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaign.deliveries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/30">
                    No recipient records logged for this campaign.
                  </td>
                </tr>
              ) : (
                campaign.deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-white/[0.01]">
                    <td className="px-6 py-4 font-medium text-white">{delivery.email}</td>
                    <td className="px-6 py-4">
                      {delivery.status === "SUCCESS" ? (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-400 font-medium">
                          Success
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] text-rose-400 font-medium">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-sm truncate text-white/45">
                      {delivery.error || "Completed successfully"}
                    </td>
                    <td className="px-6 py-4 text-right text-white/50">
                      {new Date(delivery.sentAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
