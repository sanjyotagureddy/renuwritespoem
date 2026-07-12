"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toggleCommentPin, updateCommentStatus } from "@/app/admin/comment-actions";
import CommentForm from "./comment-section/comment-form";
import CommentItem, { CommentData } from "./comment-section/comment-item";

export default function CommentSection({
  slug,
  type,
}: {
  slug: string;
  type: "poem" | "book" | "audio";
}) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Pagination states
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandCount, setExpandCount] = useState(0);

  const commentsApi = `/api/${type === "book" ? "books" : type === "audio" ? "audio" : "poems"}/${slug}/comments`;
  const commentItemApi = (commentId: string) => `/api/${type === "book" ? "book-comments" : type === "audio" ? "audio-comments" : "comments"}/${commentId}`;

  useEffect(() => {
    fetch(`${commentsApi}?limit=4&offset=0`)
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.comments)) {
          setComments(data.comments);
          setHasMore(data.hasMore);
          setTotalCount(data.totalCount);
        }
      });
  }, [commentsApi]);

  async function handleLoadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`${commentsApi}?limit=4&offset=${comments.length}`);
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, ...data.comments]);
        setHasMore(data.hasMore);
        setTotalCount(data.totalCount);
        setExpandCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Failed to load more comments:", err);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);

    const res = await fetch(commentsApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (res.ok) {
      const comment = await res.json();
      if (comment.status === "PENDING") {
        setNotice("Your comment is pending moderation because of its tone.");
        setTimeout(() => setNotice(null), 6000);
      } else {
        setComments((prev) => [comment, ...prev]);
        setTotalCount((prev) => prev + 1);
        setNotice(null);
      }
      setText("");
    }
    setSubmitting(false);
  }

  function handleUpdateCommentText(commentId: string, newText: string) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, body: newText, edited: true } : c
      )
    );
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    const res = await fetch(commentItemApi(commentId), { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotalCount((prev) => Math.max(0, prev - 1));
    }
  }

  async function handleTogglePin(commentId: string, currentPinned: boolean) {
    try {
      await toggleCommentPin(commentId, type, !currentPinned);
      setComments((prev) => {
        const updated = prev.map((c) => (c.id === commentId ? { ...c, pinned: !currentPinned } : c));
        return [...updated].sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      });
    } catch {
      alert("Failed to toggle pin.");
    }
  }

  async function handleDisable(commentId: string) {
    if (!confirm("Are you sure you want to disable (soft-delete) this comment?")) return;
    try {
      await updateCommentStatus(commentId, type, "REJECTED");
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch {
      alert("Failed to disable comment.");
    }
  }

  return (
    <div>
      <h3 className="mb-4 text-sm tracking-[0.18em] text-white/50 uppercase">
        Comments {totalCount > 0 && `(${totalCount})`}
      </h3>

      {notice && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
          ⚠️ {notice}
        </div>
      )}

      {/* Post comment form */}
      <CommentForm
        text={text}
        setText={setText}
        submitting={submitting}
        onSubmit={handleSubmit}
        hasSession={!!session?.user}
      />

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-sm text-white/30">No comments yet. Be the first.</p>
      ) : (
        <div>
          <div className={`space-y-3 ${expandCount >= 3 ? "max-h-[380px] overflow-y-auto pr-1" : ""}`}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                sessionUserId={session?.user?.id}
                sessionUserRole={session?.user?.role}
                type={type}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
                onDisable={handleDisable}
                onUpdateText={handleUpdateCommentText}
              />
            ))}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="mt-3 text-xs font-semibold text-white/50 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more comments"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
