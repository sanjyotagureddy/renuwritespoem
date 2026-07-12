import type { Metadata } from "next";
import Link from "next/link";
import { getPrisma } from "@/lib/db";
import CampaignsClient from "./campaigns-client";

export const metadata: Metadata = {
  title: "Newsletter Campaigns — Admin",
};

export default async function CampaignsAdminPage() {
  const prisma = getPrisma();

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 font-[family-name:var(--font-inter)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Newsletter Campaigns</h2>
          <p className="text-xs text-white/40 mt-1">
            Compose, test, and broadcast email campaigns to your verified subscriber audience.
          </p>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="inline-flex items-center justify-center rounded-lg border border-amber-200/30 bg-amber-200 px-4 py-2.5 text-xs font-semibold text-stone-950 transition-colors hover:bg-amber-100"
        >
          + Compose Campaign
        </Link>
      </div>

      <CampaignsClient initialCampaigns={JSON.parse(JSON.stringify(campaigns))} />
    </div>
  );
}
