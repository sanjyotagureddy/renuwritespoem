import Link from "next/link";
import { getPrisma } from "@/lib/db";

export default async function ModerationDashboard() {
  const prisma = getPrisma();

  // Aggregate pending comments
  const [
    pendingPoem,
    pendingBook,
    pendingAudio,
    unrepliedMessages
  ] = await Promise.all([
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.bookComment.count({ where: { status: "PENDING" } }),
    prisma.audioComment.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { repliedAt: null } }),
  ]);

  const totalPendingComments = pendingPoem + pendingBook + pendingAudio;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Moderation Hub</h1>
          <p className="text-sm text-white/50">
            Unified overview of tasks requiring your attention.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Comments Panel */}
        <div className="rounded-2xl border border-white/10 bg-white/3 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl text-white">Pending Comments</h2>
            </div>
            <p className="text-4xl text-white mb-2">{totalPendingComments}</p>
            <p className="text-sm text-white/40 mb-6">
              Comments awaiting approval across poems, books, and audio.
            </p>
          </div>
          <Link
            href="/admin/comments"
            className="inline-flex justify-center items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 w-full"
          >
            Review Comments →
          </Link>
        </div>

        {/* Messages Panel */}
        <div className="rounded-2xl border border-white/10 bg-white/3 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl text-white">Unreplied Messages</h2>
            </div>
            <p className="text-4xl text-white mb-2">{unrepliedMessages}</p>
            <p className="text-sm text-white/40 mb-6">
              Contact form submissions that need a response.
            </p>
          </div>
          <Link
            href="/admin/contacts"
            className="inline-flex justify-center items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 w-full"
          >
            View Messages →
          </Link>
        </div>
      </div>
    </div>
  );
}
