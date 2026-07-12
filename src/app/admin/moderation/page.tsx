import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { MessageCircle, Mail } from "lucide-react";

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
                <MessageCircle className="w-5 h-5" />
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
                <Mail className="w-5 h-5" />
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
