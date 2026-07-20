"use client";
import { CommentType } from "@/types/domain";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateCommentStatus, deleteCommentAdmin, toggleCommentPin } from "@/app/admin/actions/comment-actions";
import { Check, X, Trash2, BookOpen, FileText, Pin, Music } from "lucide-react";

export type CommentItem = {
  id: string;
  body: string;
  createdAt: string; // ISO string from server
  status: "PENDING" | "APPROVED" | "REJECTED";
  user: { name: string | null; email: string };
  commentType: CommentType;
  targetTitle: string;
  targetLink: string;
  pinned: boolean;
};

type CommentsListProps = {
  initialComments: CommentItem[];
  counts: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    ALL: number;
  };
  filter: "PENDING" | "APPROVED" | "REJECTED" | "ALL";
  page: number;
  hasNextPage: boolean;
};

function statusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    case "APPROVED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    case "REJECTED":
      return "border-rose-500/20 bg-rose-500/10 text-rose-400";
    default:
      return "border-white/10 bg-white/5 text-white/50";
  }
}

export default function CommentsList({
  initialComments,
  counts,
  filter,
  page,
  hasNextPage,
}: CommentsListProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [localCounts, setLocalCounts] = useState(counts);
  const [isPending, startTransition] = useTransition();

  // Keep local comments state in sync when initialComments updates via SSR/URL changes
  useState(() => {
    setComments(initialComments);
  });
  useState(() => {
    setLocalCounts(counts);
  });

  async function handleStatusChange(
    id: string,
    commentType: CommentType,
    newStatus: "PENDING" | "APPROVED" | "REJECTED",
  ) {
    const oldComment = comments.find((c) => c.id === id && c.commentType === commentType);
    if (!oldComment) return;
    const prevStatus = oldComment.status;

    startTransition(async () => {
      try {
        await updateCommentStatus(id, commentType, newStatus);
        setComments((prev) =>
          prev.map((c) => (c.id === id && c.commentType === commentType ? { ...c, status: newStatus } : c)),
        );
        setLocalCounts((prev) => {
          const next = { ...prev };
          if (prevStatus !== newStatus) {
            next[prevStatus] = Math.max(0, next[prevStatus] - 1);
            next[newStatus] = next[newStatus] + 1;
          }
          return next;
        });
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to update status.");
      }
    });
  }

  async function handleTogglePin(id: string, commentType: CommentType, newPinned: boolean) {
    startTransition(async () => {
      try {
        await toggleCommentPin(id, commentType, newPinned);
        setComments((prev) =>
          prev.map((c) => (c.id === id && c.commentType === commentType ? { ...c, pinned: newPinned } : c)),
        );
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to update pin status.");
      }
    });
  }

  async function handleDelete(id: string, commentType: CommentType) {
    const oldComment = comments.find((c) => c.id === id && c.commentType === commentType);
    if (!oldComment) return;
    const prevStatus = oldComment.status;

    if (!confirm("Are you sure you want to permanently delete this comment?")) return;
    startTransition(async () => {
      try {
        await deleteCommentAdmin(id, commentType);
        setComments((prev) => prev.filter((c) => !(c.id === id && c.commentType === commentType)));
        setLocalCounts((prev) => {
          const next = { ...prev };
          next[prevStatus] = Math.max(0, next[prevStatus] - 1);
          next.ALL = Math.max(0, next.ALL - 1);
          return next;
        });
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete comment.");
      }
    });
  }

  const filteredComments = comments.filter((c) => {
    if (filter === "ALL") return true;
    return c.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex gap-2">
          {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((status) => {
            const count = localCounts[status];
            const isActive = filter === status;
            return (
              <Link
                key={status}
                href={`/admin/comments?filter=${status.toLowerCase()}&page=1`}
                className={`rounded-lg px-4 py-2 text-xs uppercase tracking-wider transition-colors border ${
                  isActive
                    ? "bg-white/10 border-white/20 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                {status.toLowerCase()} ({count})
              </Link>
            );
          })}
        </div>
      </div>

      {/* Table/List */}
      {filteredComments.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-16 text-center text-white/40">
          No {filter === "ALL" ? "" : filter.toLowerCase()} comments found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={`${comment.commentType}-${comment.id}`}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Meta details */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/45">
                    <span className="font-semibold text-white/80">
                      {comment.user.name ?? "Anonymous"}
                    </span>
                    <span>&middot;</span>
                    <span className="truncate max-w-[200px]" title={comment.user.email}>
                      {comment.user.email}
                    </span>
                    <span>&middot;</span>
                    <span className="relative font-[family-name:var(--font-inter)]">{new Date(comment.createdAt).toLocaleString("en-IN")}</span>
                    <span>&middot;</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase font-semibold ${statusBadge(comment.status)}`}>
                      {comment.status}
                    </span>
                    {comment.pinned && (
                      <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] uppercase font-semibold text-amber-400">
                        <Pin className="h-2.5 w-2.5 fill-current" />
                        Pinned
                      </span>
                    )}
                  </div>

                  {/* Target reference */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {comment.commentType === "book" ? (
                      <BookOpen className="h-3.5 w-3.5 text-emerald-400/80" />
                    ) : comment.commentType === "audio" ? (
                      <Music className="h-3.5 w-3.5 text-violet-400/80" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-amber-400/80" />
                    )}
                    <span className="text-white/40 uppercase tracking-wider text-[10px]">
                      {comment.commentType}:
                    </span>
                    <Link
                      href={comment.targetLink}
                      target="_blank"
                      className="text-white/70 hover:text-white underline decoration-white/20 hover:decoration-white transition-colors"
                    >
                      {comment.targetTitle}
                    </Link>
                  </div>

                  {/* Comment Body */}
                  <p className="text-sm text-white/80 whitespace-pre-wrap font-[family-name:var(--font-inter)] leading-relaxed pt-1">
                    {comment.body}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-start">
                  {comment.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(comment.id, comment.commentType, "APPROVED")}
                        disabled={isPending}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 text-xs tracking-wider text-emerald-400 uppercase transition-colors hover:bg-emerald-500/20 disabled:opacity-40"
                        title="Approve comment"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(comment.id, comment.commentType, "REJECTED")}
                        disabled={isPending}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 text-xs tracking-wider text-rose-400 uppercase transition-colors hover:bg-rose-500/20 disabled:opacity-40"
                        title="Reject comment"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </>
                  )}

                  {comment.status === "APPROVED" && (
                    <>
                      <button
                        onClick={() => handleTogglePin(comment.id, comment.commentType, !comment.pinned)}
                        disabled={isPending}
                        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs tracking-wider uppercase transition-colors ${
                          comment.pinned
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                        }`}
                        title={comment.pinned ? "Unpin comment" : "Pin comment"}
                      >
                        <Pin className="h-3.5 w-3.5" />
                        {comment.pinned ? "Pinned" : "Pin"}
                      </button>

                      <button
                        onClick={() => handleStatusChange(comment.id, comment.commentType, "REJECTED")}
                        disabled={isPending}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 text-xs tracking-wider text-rose-400/80 uppercase transition-colors hover:bg-rose-500/10"
                        title="Reject/Unpublish comment"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {comment.status === "REJECTED" && (
                    <button
                      onClick={() => handleStatusChange(comment.id, comment.commentType, "APPROVED")}
                      disabled={isPending}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 text-xs tracking-wider text-emerald-400/80 uppercase transition-colors hover:bg-emerald-500/10"
                      title="Approve comment"
                    >
                      Approve
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(comment.id, comment.commentType)}
                    disabled={isPending}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/40 uppercase transition-colors hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 disabled:opacity-40"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <span className="text-xs text-white/50">
          Page <strong className="font-semibold text-white/80">{page}</strong> of{" "}
          <strong className="font-semibold text-white/80">{Math.ceil(localCounts[filter] / 15) || 1}</strong>
        </span>
        <div className="flex gap-2">
          <Link
            href={`/admin/comments?filter=${filter.toLowerCase()}&page=${page - 1}`}
            className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${
              page === 1
                ? "border-white/5 bg-white/[0.01] text-white/20 cursor-not-allowed pointer-events-none"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 active:scale-95"
            }`}
          >
            Previous
          </Link>
          <Link
            href={`/admin/comments?filter=${filter.toLowerCase()}&page=${page + 1}`}
            className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${
              !hasNextPage
                ? "border-white/5 bg-white/[0.01] text-white/20 cursor-not-allowed pointer-events-none"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 active:scale-95"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}


