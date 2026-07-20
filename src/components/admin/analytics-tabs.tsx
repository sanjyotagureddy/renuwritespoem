"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Coins,
  Activity,
  Send,
} from "lucide-react";

import AudienceGrowthTab from "./analytics/audience-growth-tab";
import SalesTab from "./analytics/sales-tab";
import CampaignsTab from "./analytics/campaigns-tab";
import EngagementTab from "./analytics/engagement-tab";

type AnalyticsTabsProps = {
  attributionData: Array<{ source: string; clicks: number; signups: number }>;
  invitesSentThisWeek: number;
  invitesAcceptedThisWeek: number;
  subscribersThisWeek: number;
  topSharedPoems: Array<{
    title: string;
    slug: string;
    views: number;
    _count: { invites: number };
  }>;
  salesData: {
    totalRevenue: number;
    totalCopiesSold: number;
    activeOrdersCount: number;
    bookSalesList: Array<{
      id: string;
      title: string;
      copiesSold: number;
    }>;
    recentOrders: Array<{
      id: string;
      orderNumber: string | null;
      name: string;
      email: string;
      copies: number;
      totalAmount: number;
      status: string;
      createdAt: string;
      bookTitle: string;
    }>;
  };
  engagementData: {
    totalCardsGenerated?: number;
    topAudio: Array<{
      id: string;
      title: string;
      slug: string;
      views: number;
      likesCount: number;
      commentsCount: number;
    }>;
    topPoems: Array<{
      id: string;
      title: string;
      slug: string;
      views: number;
      likesCount: number;
      commentsCount: number;
      downloadCount: number;
    }>;
  };
  activityFeed: Array<{
    id: string;
    type: string;
    text: string;
    timestamp: string;
  }>;
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

export default function AnalyticsTabs({
  attributionData,
  invitesSentThisWeek,
  invitesAcceptedThisWeek,
  subscribersThisWeek,
  topSharedPoems,
  salesData,
  engagementData,
  activityFeed,
  campaignData,
}: AnalyticsTabsProps) {
  const [activeTab, setActiveTab] = useState<"growth" | "sales" | "engagement" | "campaigns">("growth");

  // Derived metric
  const inviteConversionRate =
    invitesSentThisWeek > 0
      ? Math.round((invitesAcceptedThisWeek / invitesSentThisWeek) * 100)
      : 0;

  return (
    <div className="space-y-6 font-[family-name:var(--font-inter)]">
      {/* Dynamic Tab Switcher */}
      <div className="flex flex-wrap border-b border-white/10 gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab("growth")}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${activeTab === "growth"
              ? "border-amber-400 text-amber-400 bg-amber-400/[0.02]"
              : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.01]"
            }`}
        >
          <TrendingUp className="h-4 w-4" />
          Audience &amp; Growth
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${activeTab === "sales"
              ? "border-emerald-400 text-emerald-400 bg-emerald-400/[0.02]"
              : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.01]"
            }`}
        >
          <Coins className="h-4 w-4" />
          Sales &amp; Orders
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${activeTab === "campaigns"
              ? "border-sky-400 text-sky-400 bg-sky-400/[0.02]"
              : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.01]"
            }`}
        >
          <Send className="h-4 w-4" />
          Newsletter Campaigns
        </button>
        <button
          onClick={() => setActiveTab("engagement")}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${activeTab === "engagement"
              ? "border-violet-400 text-violet-400 bg-violet-400/[0.02]"
              : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.01]"
            }`}
        >
          <Activity className="h-4 w-4" />
          Activity & Engagement
        </button>
      </div>

      {activeTab === "growth" && (
        <AudienceGrowthTab
          invitesSentThisWeek={invitesSentThisWeek}
          invitesAcceptedThisWeek={invitesAcceptedThisWeek}
          inviteConversionRate={inviteConversionRate}
          subscribersThisWeek={subscribersThisWeek}
          topSharedPoems={topSharedPoems}
          attributionData={attributionData}
        />
      )}

      {activeTab === "sales" && (
        <SalesTab salesData={salesData} />
      )}

      {activeTab === "campaigns" && (
        <CampaignsTab campaignData={campaignData} />
      )}

      {activeTab === "engagement" && (
        <EngagementTab
          engagementData={engagementData}
          activityFeed={activityFeed}
        />
      )}
    </div>
  );
}
