import Link from "next/link";
import { getPrisma } from "@/lib/db";
import ContactList from "./contact-list";

type FilterType = "all" | "unreplied" | "replied";

const PAGE_SIZE = 20;

type PageProps = {
  searchParams: Promise<{ filter?: string; page?: string }>;
};

export default async function AdminContactsPage({ searchParams }: PageProps) {
  const { filter: rawFilter, page: rawPage } = await searchParams;

  const filter: FilterType =
    rawFilter === "replied" || rawFilter === "unreplied" ? rawFilter : "all";

  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const prisma = getPrisma();

  const where =
    filter === "replied"
      ? { repliedAt: { not: null } }
      : filter === "unreplied"
        ? { repliedAt: null }
        : {};

  const [messages, totalCount, unrepliedCount, repliedCount, allCount] =
    await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { repliedAt: null } }),
      prisma.contactMessage.count({ where: { repliedAt: { not: null } } }),
      prisma.contactMessage.count(),
    ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const hasNext = page < totalPages;

  const tabs = [
    { key: "all", label: "All", count: allCount },
    { key: "unreplied", label: "Awaiting Reply", count: unrepliedCount, urgent: unrepliedCount > 0 },
    { key: "replied", label: "Replied", count: repliedCount },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white md:text-4xl">Contact Messages</h1>
          <p className="mt-2 text-sm text-white/45">
            Review and reply to messages sent from the contact form.
          </p>
        </div>

        {unrepliedCount > 0 && (
          <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-semibold text-amber-300">
              {unrepliedCount} awaiting reply
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 max-w-xl">
        {[
          ["Total", allCount],
          ["Awaiting Reply", unrepliedCount],
          ["Replied", repliedCount],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="mb-1 text-[10px] tracking-[0.18em] text-white/35 uppercase">
              {label}
            </p>
            <p className="text-2xl text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 pb-0 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = filter === tab.key;
          const isUrgent = "urgent" in tab && tab.urgent;
          return (
            <Link
              key={tab.key}
              href={`/admin/contacts?filter=${tab.key}`}
              className={`relative flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-white/5 text-white border-b-2 border-violet-400"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? "bg-violet-500/20 text-violet-300"
                    : isUrgent
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-white/10 text-white/40"
                }`}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Message list */}
      <ContactList messages={messages} />

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <span className="text-xs text-white/50">
          Page <strong className="font-semibold text-white/80">{page}</strong> of{" "}
          <strong className="font-semibold text-white/80">{totalPages}</strong>
          {" "}· {totalCount} messages
        </span>
        <div className="flex gap-2">
          <Link
            href={`/admin/contacts?filter=${filter}&page=${page - 1}`}
            className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${
              page === 1
                ? "border-white/5 bg-white/[0.01] text-white/20 cursor-not-allowed pointer-events-none"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white active:scale-95"
            }`}
          >
            Previous
          </Link>
          <Link
            href={`/admin/contacts?filter=${filter}&page=${page + 1}`}
            className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${
              !hasNext
                ? "border-white/5 bg-white/[0.01] text-white/20 cursor-not-allowed pointer-events-none"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white active:scale-95"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
