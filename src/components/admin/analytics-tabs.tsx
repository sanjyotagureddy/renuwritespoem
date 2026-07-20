"use client";

import React, { useState } from "react";
import AttributionAnalyticsTable from "./attribution-analytics-table";
import {
  TrendingUp,
  Coins,
  Activity,
  Eye,
  Heart,
  MessageSquare,
  ShoppingBag,
  UserCheck,
  Share2,
  Mail,
  Send,
  UserPlus,
  Clock,
  Printer,
} from "lucide-react";

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
      downloadCount?: number;
      likesCount: number;
      commentsCount: number;
    }>;
  };
  campaignData: {
    totalCampaignsSent: number;
    averageOpenRate: number;
    averageClickRate: number;
    campaignHistory: Array<{
      id: string;
      subject: string;
      sentAt: string;
      sentCount: number;
      openedCount: number;
      clickedCount: number;
      openRate: number;
      clickRate: number;
    }>;
  };
  activityFeed: Array<{
    id: string;
    type: string;
    text: string;
    timestamp: string;
  }>;
};

export default function AnalyticsTabs({
  attributionData,
  invitesSentThisWeek,
  invitesAcceptedThisWeek,
  subscribersThisWeek,
  topSharedPoems,
  salesData,
  engagementData,
  campaignData,
  activityFeed,
}: AnalyticsTabsProps) {
  const [activeTab, setActiveTab] = useState<"growth" | "sales" | "campaigns" | "engagement">("growth");

  // Calculate conversion rates
  const inviteConversionRate =
    invitesSentThisWeek > 0
      ? ((invitesAcceptedThisWeek / invitesSentThisWeek) * 100).toFixed(1)
      : "0.0";

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);
  };

  // Helper for activity feed icons
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <UserPlus className="h-3.5 w-3.5 text-sky-400" />;
      case "subscriber":
        return <Mail className="h-3.5 w-3.5 text-amber-400" />;
      case "comment":
        return <MessageSquare className="h-3.5 w-3.5 text-purple-400" />;
      case "order":
        return <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />;
      case "like":
        return <Heart className="h-3.5 w-3.5 text-rose-500" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-white/40" />;
    }
  };

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
          Activity &amp; Engagement
        </button>
      </div>

      {/* Tab 1: Growth & Audience */}
      {activeTab === "growth" && (
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
      )}

      {/* Tab 2: Sales & Orders */}
      {activeTab === "sales" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Key Sales Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-5 hover:border-emerald-500/35 hover:bg-emerald-500/[0.03] transition-all">
              <p className="mb-2 text-[10px] tracking-widest text-emerald-400/60 uppercase font-semibold">
                Total Sales Revenue
              </p>
              <p className="text-3xl font-bold text-emerald-400">
                {formatCurrency(salesData.totalRevenue)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-white/20 hover:bg-white/[0.03] transition-all">
              <p className="mb-2 text-[10px] tracking-widest text-white/40 uppercase font-semibold">
                Copies Sold
              </p>
              <p className="text-3xl font-bold text-white">{salesData.totalCopiesSold}</p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.02] p-5 hover:border-amber-500/35 hover:bg-amber-500/[0.03] transition-all">
              <p className="mb-2 text-[10px] tracking-widest text-amber-400/60 uppercase font-semibold">
                Active Order Queue
              </p>
              <p className="text-3xl font-bold text-amber-400">{salesData.activeOrdersCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Book Sales Leaderboard */}
            <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-emerald-400" />
                Book Sales Leaderboard
              </h3>
              <div className="space-y-4 pt-2">
                {salesData.bookSalesList.length === 0 ? (
                  <p className="text-xs text-white/30 italic text-center py-4">No book sales recorded.</p>
                ) : (
                  salesData.bookSalesList.map((book) => {
                    const maxCount = Math.max(...salesData.bookSalesList.map((b) => b.copiesSold), 1);
                    const percentage = Math.min(100, (book.copiesSold / maxCount) * 100);
                    return (
                      <div key={book.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-white/80 truncate max-w-[200px]" title={book.title}>
                            {book.title}
                          </span>
                          <span className="text-emerald-400 font-bold">{book.copiesSold} sold</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4">
                <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-amber-400" />
                  Recent Orders
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {salesData.recentOrders.length === 0 ? (
                  <p className="p-8 text-center text-xs text-white/30 italic">No orders received yet.</p>
                ) : (
                  salesData.recentOrders.map((ord) => (
                    <div key={ord.id} className="flex justify-between items-center px-5 py-4 text-xs font-[family-name:var(--font-inter)] hover:bg-white/[0.01]">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white/90">
                            {ord.orderNumber || "#UNNUMBERED"}
                          </span>
                          <span className="text-[10px] text-white/40">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/50 truncate max-w-[260px]">
                          {ord.name} ({ord.email}) — <span className="italic">{ord.bookTitle}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="font-bold text-white">{formatCurrency(ord.totalAmount)}</p>
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wide ${ord.status === "DELIVERED"
                            ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                            : ord.status === "SHIPPED"
                              ? "bg-sky-500/10 border border-sky-500/25 text-sky-400"
                              : ord.status === "CONFIRMED"
                                ? "bg-purple-500/10 border border-purple-500/25 text-purple-400"
                                : "bg-amber-500/10 border border-amber-500/25 text-amber-400"
                          }`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Newsletter Campaigns */}
      {activeTab === "campaigns" && (
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
      )}

      {/* Tab 4: Engagement & Activity Feed */}
      {activeTab === "engagement" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Left Column: Popular Creative Works */}
          <div className="lg:col-span-5 space-y-6">
            {/* Top Spoken Audio Releases */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4">
                <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
                  <Activity className="h-4 w-4 text-violet-400" />
                  Top Spoken Recordings
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {engagementData.topAudio.length === 0 ? (
                  <p className="p-8 text-center text-xs text-white/30 italic">No audio play stats recorded.</p>
                ) : (
                  (() => {
                    const maxAudioViews = Math.max(...engagementData.topAudio.map((a) => a.views), 1);
                    return engagementData.topAudio.map((aud) => {
                      const percentage = Math.min(100, (aud.views / maxAudioViews) * 100);
                      return (
                        <div key={aud.id} className="relative flex justify-between items-center px-5 py-4 group overflow-hidden">
                          {/* Visual Background View bar graph indicator */}
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-violet-500/5 transition-all duration-500 -z-10"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white/90 truncate max-w-[200px]" title={aud.title}>
                              {aud.title}
                            </p>
                            <p className="text-[9px] text-white/40">/audio/{aud.slug}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-4 text-[10px] text-white/50 z-10">
                            <span className="flex items-center gap-1" title="Plays">
                              <Eye className="h-3 w-3 text-violet-400" />
                              {aud.views}
                            </span>
                            <span className="flex items-center gap-1" title="Likes">
                              <Heart className="h-3 w-3 text-rose-500" />
                              {aud.likesCount}
                            </span>
                            <span className="flex items-center gap-1" title="Comments">
                              <MessageSquare className="h-3 w-3 text-sky-400" />
                              {aud.commentsCount}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>

            {/* Top Poems Engagement */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4">
                <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-400" />
                  Top Poems Engagement
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {engagementData.topPoems.length === 0 ? (
                  <p className="p-8 text-center text-xs text-white/30 italic">No poem engagement stats recorded.</p>
                ) : (
                  (() => {
                    const maxPoemViews = Math.max(...engagementData.topPoems.map((p) => p.views), 1);
                    return engagementData.topPoems.map((poem) => {
                      const percentage = Math.min(100, (poem.views / maxPoemViews) * 100);
                      return (
                        <div key={poem.id} className="relative flex justify-between items-center px-5 py-4 group overflow-hidden">
                          {/* Visual Background View bar graph indicator */}
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-amber-500/5 transition-all duration-500 -z-10"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white/90 truncate max-w-[200px]" title={poem.title}>
                              {poem.title}
                            </p>
                            <p className="text-[9px] text-white/40">/poems/{poem.slug}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-4 text-[10px] text-white/50 z-10">
                            <span className="flex items-center gap-1" title="Views">
                              <Eye className="h-3 w-3 text-amber-400" />
                              {poem.views}
                            </span>
                            <span className="flex items-center gap-1" title="Likes">
                              <Heart className="h-3 w-3 text-rose-500" />
                              {poem.likesCount}
                            </span>
                            <span className="flex items-center gap-1" title="Comments">
                              <MessageSquare className="h-3 w-3 text-sky-400" />
                              {poem.commentsCount}
                            </span>
                            <span className="flex items-center gap-1 font-medium text-amber-300" title="Cards Printed">
                              <Printer className="h-3 w-3 text-amber-400" />
                              {poem.downloadCount || 0}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Site Activity Timeline */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4 overflow-hidden h-fit">
            <div>
              <h3 className="text-sm font-semibold text-white">Live Site Activity</h3>
              <p className="text-[10px] text-white/40">Recent user registrations, subscriptions, orders, comments, and likes.</p>
            </div>

            <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2 space-y-1">
              {activityFeed.length === 0 ? (
                <p className="text-xs text-white/30 italic py-4">No recent site activities.</p>
              ) : (
                activityFeed.map((item, idx) => (
                  <div key={item.id} className="flex gap-4 items-start relative text-xs">
                    {/* Left Connector Node column */}
                    <div className="flex flex-col items-center shrink-0 relative self-stretch">
                      <div className="rounded-full border border-white/10 bg-neutral-950 p-1.5 flex items-center justify-center z-10 shadow-md">
                        {getActivityIcon(item.type)}
                      </div>
                      {/* Only render line segment if not the last item */}
                      {idx < activityFeed.length - 1 && (
                        <div className="w-[1px] bg-white/5 absolute top-7 bottom-0 left-1/2 -translate-x-1/2" />
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="space-y-0.5 pb-4 flex-1">
                      <p className="text-white/80 leading-relaxed font-medium">
                        {item.text}
                      </p>
                      <p className="text-[9px] text-white/30">
                        {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
