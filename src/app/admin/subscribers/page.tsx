import type { Metadata } from "next";
import { getPrisma } from "@/lib/db";
import SubscribersClient from "./subscribers-client";
import { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Subscribers",
};

interface SubscribersPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function SubscribersAdminPage({ searchParams }: SubscribersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10) || 1;
  const status = params.status ?? "";
  const search = params.search ?? "";

  const prisma = getPrisma();
  
  // Construct search query
  const where: Prisma.SubscriberWhereInput = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  // Construct status filter
  if (status === "verified") {
    where.verified = true;
    where.unsubscribedAt = null;
  } else if (status === "pending") {
    where.verified = false;
    where.unsubscribedAt = null;
  } else if (status === "unsubscribed") {
    where.unsubscribedAt = { not: null };
  }

  const limit = 10;
  const offset = (page - 1) * limit;

  const [subscribers, totalCount, allSubscribers] = await Promise.all([
    prisma.subscriber.findMany({
      where,
      orderBy: { subscribedAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.subscriber.count({ where }),
    prisma.subscriber.findMany({
      select: { email: true },
    }),
  ]);

  const activeSubEmails = allSubscribers.map((s) => s.email.toLowerCase());

  const unsubscribedUsers = await prisma.user.findMany({
    where: {
      NOT: {
        email: {
          in: activeSubEmails,
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Subscribers</h2>
        <p className="text-xs text-white/40 mt-1">
          Manage newsletter subscribers, double opt-in statuses, and export mailing lists.
        </p>
      </div>

      <SubscribersClient
        initialSubscribers={subscribers}
        totalCount={totalCount}
        currentPage={page}
        statusFilter={status}
        searchQuery={search}
        unsubscribedUsers={JSON.parse(JSON.stringify(unsubscribedUsers))}
      />
    </div>
  );
}
