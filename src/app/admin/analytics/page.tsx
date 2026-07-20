import { getPrisma } from "@/lib/db";
import AnalyticsTabs from "@/components/admin/analytics-tabs";
import TimeRangeFilter from "@/components/admin/time-range-filter";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AnalyticsDashboard(props: {
  searchParams: SearchParams;
}) {
  const prisma = getPrisma();
  const searchParams = await props.searchParams;
  const range = (searchParams.range as string) || "7d";

  // Calculate start date threshold
  let startDate = new Date();
  if (range === "7d") {
    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === "30d") {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  } else if (range === "90d") {
    startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  }

  // Construct dynamic date filters (no date filter if range is "all")
  const dateFilter = range === "all" ? {} : { gte: startDate };

  const [
    clicksBySource,
    signupsBySource,
    invitesSentThisWeek,
    invitesAcceptedThisWeek,
    subscribersThisWeek,
    topSharedPoems,
    paidOrders,
    activeOrdersCount,
    bookSalesRaw,
    booksInfo,
    recentOrdersRaw,
    topAudioRaw,
    topPoemsRaw,
    recentUsers,
    recentSubscribers,
    recentComments,
    recentLikes,
    recentOrdersRawFeed,
    campaignsRaw,
  ] = await Promise.all([
    prisma.attributionLog.groupBy({
      by: ["source"],
      _count: { id: true },
    }),
    prisma.user.groupBy({
      by: ["signUpSource"],
      where: { signUpSource: { not: null } },
      _count: { id: true },
    }),
    prisma.invite.count({ where: { sentAt: dateFilter } }),
    prisma.invite.count({ where: { signedUpAt: dateFilter } }),
    prisma.subscriber.count({ where: { subscribedAt: dateFilter } }),
    prisma.poem.findMany({
      orderBy: { invites: { _count: "desc" } },
      take: 5,
      select: {
        title: true,
        slug: true,
        views: true,
        _count: { select: { invites: true } },
      },
    }),
    prisma.bookOrder.findMany({
      where: {
        status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
        createdAt: dateFilter,
      },
      select: { totalAmount: true, copies: true },
    }),
    prisma.bookOrder.count({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        createdAt: dateFilter,
      },
    }),
    prisma.bookOrder.groupBy({
      by: ["bookId"],
      where: {
        status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
        createdAt: dateFilter,
      },
      _sum: { copies: true },
    }),
    prisma.book.findMany({
      select: { id: true, title: true },
    }),
    prisma.bookOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { book: { select: { title: true } } },
    }),
    prisma.audio.findMany({
      orderBy: { views: "desc" },
      take: 5,
      include: {
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.poem.findMany({
      where: { published: true },
      orderBy: { views: "desc" },
      take: 5,
      include: {
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { name: true, email: true, signUpSource: true, createdAt: true },
    }),
    prisma.subscriber.findMany({
      orderBy: { subscribedAt: "desc" },
      take: 10,
      select: { name: true, email: true, subscribedAt: true },
    }),
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        body: true,
        user: { select: { name: true, email: true } },
        poem: { select: { title: true } },
      },
    }),
    prisma.like.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        createdAt: true,
        user: { select: { name: true } },
        poem: { select: { title: true } },
      },
    }),
    prisma.bookOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        createdAt: true,
        name: true,
        copies: true,
        book: { select: { title: true } },
      },
    }),
    prisma.campaign.findMany({
      orderBy: { sentAt: "desc" },
      where: { status: "SENT", sentAt: dateFilter },
      include: {
        deliveries: {
          select: {
            openedAt: true,
            openCount: true,
            clicks: { select: { id: true } },
          },
        },
      },
    }),
  ]);

  // Process attribution source channels
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

  // Process sales statistics
  const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const totalCopiesSold = paidOrders.reduce((sum, order) => sum + order.copies, 0);

  const bookSalesList = booksInfo.map((b) => {
    const record = bookSalesRaw.find((r) => r.bookId === b.id);
    return {
      id: b.id,
      title: b.title,
      copiesSold: record?._sum?.copies ?? 0,
    };
  }).sort((a, b) => b.copiesSold - a.copiesSold);

  const recentOrders = recentOrdersRaw.map((ord) => ({
    id: ord.id,
    orderNumber: ord.orderNumber,
    name: ord.name,
    email: ord.email,
    copies: ord.copies,
    totalAmount: Number(ord.totalAmount),
    status: ord.status,
    createdAt: ord.createdAt.toISOString(),
    bookTitle: ord.book.title,
  }));

  // Process engagement statistics
  const topAudio = topAudioRaw.map((aud) => ({
    id: aud.id,
    title: aud.title,
    slug: aud.slug,
    views: aud.views,
    likesCount: aud._count.likes,
    commentsCount: aud._count.comments,
  }));

  // Query total printable cards generated
  const dbClient = prisma as unknown as { printCard?: { count: () => Promise<number> } };
  const totalCardsGenerated = typeof dbClient.printCard?.count === "function"
    ? await dbClient.printCard.count()
    : 0;

  const topPoems = topPoemsRaw.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    views: p.views,
    downloadCount: p.downloadCount || 0,
    likesCount: p._count.likes,
    commentsCount: p._count.comments,
  }));

  // Process campaign performance stats
  const campaignHistory = campaignsRaw.map((c) => {
    const sentCount = c.sentCount;
    const openedCount = c.deliveries.filter((d) => d.openCount > 0 || d.openedAt !== null).length;
    const clickedCount = c.deliveries.filter((d) => d.clicks.length > 0).length;
    return {
      id: c.id,
      subject: c.subject,
      sentAt: c.sentAt ? c.sentAt.toISOString() : c.createdAt.toISOString(),
      sentCount,
      openedCount,
      clickedCount,
      openRate: sentCount > 0 ? (openedCount / sentCount) * 100 : 0,
      clickRate: sentCount > 0 ? (clickedCount / sentCount) * 100 : 0,
    };
  });

  const totalCampaignsSent = campaignHistory.length;
  const totalSentDeliveries = campaignHistory.reduce((sum, c) => sum + c.sentCount, 0);
  const totalOpenedDeliveries = campaignHistory.reduce((sum, c) => sum + c.openedCount, 0);
  const totalClickedDeliveries = campaignHistory.reduce((sum, c) => sum + c.clickedCount, 0);

  const averageOpenRate = totalSentDeliveries > 0 ? (totalOpenedDeliveries / totalSentDeliveries) * 100 : 0;
  const averageClickRate = totalSentDeliveries > 0 ? (totalClickedDeliveries / totalSentDeliveries) * 100 : 0;

  // Process Site Activity Feed
  const activityItems: Array<{ id: string; type: string; text: string; timestamp: Date }> = [];

  recentUsers.forEach((u) => {
    activityItems.push({
      id: `user-${u.email}-${u.createdAt.getTime()}`,
      type: "user",
      text: `${u.name || u.email} registered an account${u.signUpSource ? ` via ${u.signUpSource}` : ""}`,
      timestamp: u.createdAt,
    });
  });

  recentSubscribers.forEach((s) => {
    activityItems.push({
      id: `sub-${s.email}-${s.subscribedAt.getTime()}`,
      type: "subscriber",
      text: `${s.name || s.email} subscribed to the newsletter`,
      timestamp: s.subscribedAt,
    });
  });

  recentComments.forEach((c) => {
    activityItems.push({
      id: `comment-${c.id}`,
      type: "comment",
      text: `${c.user.name || c.user.email} commented on "${c.poem.title}"`,
      timestamp: c.createdAt,
    });
  });

  recentLikes.forEach((l, idx) => {
    activityItems.push({
      id: `like-${l.poem.title}-${idx}-${l.createdAt.getTime()}`,
      type: "like",
      text: `${l.user.name || "A reader"} liked "${l.poem.title}"`,
      timestamp: l.createdAt,
    });
  });

  recentOrdersRawFeed.forEach((o, idx) => {
    activityItems.push({
      id: `order-feed-${idx}-${o.createdAt.getTime()}`,
      type: "order",
      text: `${o.name} ordered ${o.copies} cop${o.copies > 1 ? "ies" : "y"} of "${o.book.title}"`,
      timestamp: o.createdAt,
    });
  });

  const activityFeed = activityItems
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 15)
    .map((item) => ({
      ...item,
      timestamp: item.timestamp.toISOString(),
    }));

  return (
    <div className="space-y-8 font-[family-name:var(--font-inter)] text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-playfair)]">
            Analytics Dashboard
          </h1>
          <p className="text-xs text-white/40">
            Track growth metrics, newsletter campaigns, bookstore sales, and reader interactions.
          </p>
        </div>
        <div className="shrink-0">
          <TimeRangeFilter />
        </div>
      </div>

      <AnalyticsTabs
        attributionData={attributionData}
        invitesSentThisWeek={invitesSentThisWeek}
        invitesAcceptedThisWeek={invitesAcceptedThisWeek}
        subscribersThisWeek={subscribersThisWeek}
        topSharedPoems={topSharedPoems}
        salesData={{
          totalRevenue,
          totalCopiesSold,
          activeOrdersCount,
          bookSalesList,
          recentOrders,
        }}
        engagementData={{
          topAudio,
          topPoems,
          totalCardsGenerated,
        }}
        campaignData={{
          totalCampaignsSent,
          averageOpenRate,
          averageClickRate,
          campaignHistory,
        }}
        activityFeed={activityFeed}
      />
    </div>
  );
}
