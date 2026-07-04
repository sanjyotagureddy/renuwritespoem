"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toggleCommentPin, updateCommentStatus } from "@/app/admin/actions";

type CommentData = {
  id: string;
  body: string;
  createdAt: string;
  edited: boolean;
  userId: string;
  likeCount: number;
  liked: boolean;
  user: { name: string; image: string | null };
  pinned: boolean;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function CommentLikeButton({
  commentId,
  initialLiked,
  initialCount,
  disabled,
  isBook,
}: {
  commentId: string;
  initialLiked: boolean;
  initialCount: number;
  disabled: boolean;
  isBook: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  async function handleToggle() {
    if (disabled) return;
    const path = isBook ? "book-comments" : "comments";
    const res = await fetch(`/api/${path}/${commentId}/likes`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.likeCount);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      className={`flex items-center gap-1 transition-colors text-[10px] font-semibold uppercase ${
        liked
          ? "text-rose-400 font-semibold"
          : "text-white/40 hover:text-white/60"
      } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
      title={disabled ? "Sign in to like" : liked ? "Unlike" : "Like"}
    >
      <span className="text-xs">{liked ? "♥" : "♡"}</span>
      <span>{liked ? "Liked" : "Like"}</span>
      {count > 0 && <span className="text-white/60">({count})</span>}
    </button>
  );
}

export default function CommentSection({
  slug,
  type,
}: {
  slug: string;
  type: "poem" | "book";
}) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // Pagination states
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandCount, setExpandCount] = useState(0);

  const isBook = type === "book";
  const commentsApi = `/api/${isBook ? "books" : "poems"}/${slug}/comments`;
  const commentItemApi = (commentId: string) => `/api/${isBook ? "book-comments" : "comments"}/${commentId}`;

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

  function startEdit(comment: CommentData) {
    setEditingId(comment.id);
    setEditText(comment.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  async function saveEdit(commentId: string) {
    if (!editText.trim()) return;
    const res = await fetch(commentItemApi(commentId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, body: data.body, edited: true } : c,
        ),
      );
      setEditingId(null);
      setEditText("");
    }
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
      await toggleCommentPin(commentId, isBook, !currentPinned);
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
      await updateCommentStatus(commentId, isBook, "REJECTED");
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

      {/* Post comment */}
      {session?.user ? (
        <form onSubmit={handleSubmit} className="mb-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Share your thoughts..."
            className="w-full resize-none rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="mt-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[10px] tracking-wider text-white uppercase transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </form>
      ) : (
        <p className="mb-5 text-xs text-white/40">
          Sign in to leave a comment.
        </p>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-sm text-white/30">No comments yet. Be the first.</p>
      ) : (
        <div>
          <div className={`space-y-3 ${expandCount >= 3 ? "max-h-[380px] overflow-y-auto pr-1" : ""}`}>
            {comments.map((comment) => {
              const isOwner = session?.user?.id === comment.userId;
              const canDelete = isOwner || session?.user?.role === "ADMIN";
              return (
                <div key={comment.id} className="flex gap-2.5 items-start">
                  {comment.user.image ? (
                    <div className="relative mt-0.5 h-6 w-6 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={comment.user.image}
                        alt={comment.user.name}
                        fill
                        className="object-cover"
                        sizes="24px"
                      />
                    </div>
                  ) : (
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white/60">
                      {comment.user.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className={`inline-block max-w-full px-3 py-1.5 rounded-2xl border transition-colors ${
                      comment.pinned
                        ? "border-amber-500/20 bg-amber-500/5"
                        : "border-white/5 bg-white/5"
                    }`}>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-white/95 leading-tight">
                          {comment.user.name}
                        </span>
                        {editingId === comment.id ? (
                          <div className="mt-1">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              rows={2}
                              maxLength={1000}
                              className="w-full min-w-[200px] resize-none rounded-xl border border-white/15 bg-black/40 px-2.5 py-1 text-xs text-white outline-none focus:border-white/30"
                            />
                            <div className="mt-1 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveEdit(comment.id)}
                                disabled={!editText.trim()}
                                className="text-[10px] font-semibold text-white/80 hover:text-white transition-colors disabled:opacity-40"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-[10px] font-semibold text-white/40 hover:text-white/60 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-0.5 text-xs break-words whitespace-pre-line text-white/80 leading-normal">
                            {comment.body}
                          </p>
                        )}
                      </div>
                    </div>

                    {editingId !== comment.id && (
                      <div className="mt-0.5 flex flex-wrap items-center gap-3 px-2 text-[10px] text-white/40">
                        <span>{timeAgo(comment.createdAt)}</span>
                        {comment.edited && <span className="italic">edited</span>}
                        {comment.pinned && (
                          <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                            📌 Pinned
                          </span>
                        )}

                        <CommentLikeButton
                          commentId={comment.id}
                          initialLiked={comment.liked}
                          initialCount={comment.likeCount}
                          disabled={!session?.user}
                          isBook={isBook}
                        />

                        {session?.user?.role === "ADMIN" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleTogglePin(comment.id, comment.pinned)}
                              className={`font-semibold hover:text-white/60 transition-colors uppercase ${
                                comment.pinned ? "text-amber-400" : "text-white/40"
                              }`}
                            >
                              {comment.pinned ? "Unpin" : "Pin"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDisable(comment.id)}
                              className="text-rose-400/50 font-semibold hover:text-rose-400 transition-colors uppercase"
                            >
                              Disable
                            </button>
                          </>
                        )}

                        {canDelete && (
                          <>
                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => startEdit(comment)}
                                className="font-semibold hover:text-white/60 transition-colors uppercase"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(comment.id)}
                              className="text-rose-400/40 font-semibold hover:text-rose-400 transition-colors uppercase"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
