import React from "react";
import { Activity, Printer, Eye, Heart, MessageSquare, Clock, UserPlus, Mail, ShoppingBag } from "lucide-react";

type EngagementTabProps = {
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
};

export default function EngagementTab({ engagementData, activityFeed }: EngagementTabProps) {
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
      case "print_card":
        return <Printer className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-white/40" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Key Creative Engagement Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.02] p-5 hover:border-amber-500/35 hover:bg-amber-500/[0.03] transition-all">
          <p className="mb-2 text-[10px] tracking-widest text-amber-400/60 uppercase font-semibold flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Keepsake Cards Created</span>
          </p>
          <p className="text-3xl font-bold text-amber-400">
            {(engagementData.totalCardsGenerated ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] text-white/40">Anonymous PDF and WhatsApp image cards created by readers</p>
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.02] p-5 hover:border-violet-500/35 hover:bg-violet-500/[0.03] transition-all">
          <p className="mb-2 text-[10px] tracking-widest text-violet-400/60 uppercase font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-violet-400" />
            <span>Audio Recording Plays</span>
          </p>
          <p className="text-3xl font-bold text-violet-400">
            {engagementData.topAudio.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] text-white/40">Total spoken-word poem recording streams</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-white/20 hover:bg-white/[0.03] transition-all">
          <p className="mb-2 text-[10px] tracking-widest text-white/40 uppercase font-semibold flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-white/60" />
            <span>Poem Page Reads</span>
          </p>
          <p className="text-3xl font-bold text-white">
            {engagementData.topPoems.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] text-white/40">Total anonymous and reader poem page views</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
  </div>
  );
}
