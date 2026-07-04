"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Pencil, Trash2 } from "lucide-react";

type CommentData = {
  id: string;
  body: string;
  createdAt: string;
  edited: boolean;
  userId: string;
  likeCount: number;
  liked: boolean;
  user: { name: string; image: string | null };
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
}: {
  commentId: string;
  initialLiked: boolean;
  initialCount: number;
  disabled: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  async function handleToggle() {
    if (disabled) return;
    const res = await fetch(`/api/book-comments/${commentId}/likes`, {
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
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        liked
          ? "text-rose-400/80 hover:text-rose-300"
          : "text-white/30 hover:text-white/60"
      } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
      title={disabled ? "Sign in to like" : liked ? "Unlike" : "Like"}
    >
      <span className="text-lg">{liked ? "♥" : "♡"}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

export default function BookCommentSection({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetch(`/api/books/${slug}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
      });
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch(`/api/books/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() }),
    });
    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [comment, ...prev]);
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
    const res = await fetch(`/api/book-comments/${commentId}`, {
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
      cancelEdit();
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    const res = await fetch(`/api/book-comments/${commentId}`, {
      method: "DELETE",
    });
    if (res.ok) setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  return (
    <div>
      <h3 className="mb-4 text-sm tracking-[0.18em] text-white/50 uppercase">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {session?.user ? (
        <form onSubmit={handleSubmit} className="mb-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Share your thoughts..."
            className="w-full resize-none rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="mt-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs tracking-wider text-white uppercase transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </form>
      ) : (
        <p className="mb-5 text-xs text-white/40">
          Sign in to leave a comment.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-white/30">No comments yet. Be the first.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isOwner = session?.user?.id === comment.userId;
            const canDelete = isOwner || session?.user?.role === "ADMIN";
            return (
              <div key={comment.id} className="flex gap-3">
                {comment.user.image ? (
                  <div className="relative mt-0.5 h-7 w-7 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={comment.user.image}
                      alt={comment.user.name}
                      fill
                      className="object-cover"
                      sizes="28px"
                    />
                  </div>
                ) : (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-white/60">
                    {comment.user.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white/80">
                      {comment.user.name}
                    </span>
                    <span className="text-[10px] text-white/30">
                      {timeAgo(comment.createdAt)}
                    </span>
                    {comment.edited && (
                      <span className="text-[10px] text-white/25 italic">
                        edited
                      </span>
                    )}
                    <span className="ml-auto flex items-center gap-2">
                      {canDelete && editingId !== comment.id && (
                        <>
                          {isOwner && (
                            <button
                              type="button"
                              onClick={() => startEdit(comment)}
                              className="text-white/25 transition-colors hover:text-white/60"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(comment.id)}
                            className="text-rose-400/30 transition-colors hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                      <CommentLikeButton
                        commentId={comment.id}
                        initialLiked={comment.liked}
                        initialCount={comment.likeCount}
                        disabled={!session?.user}
                      />
                    </span>
                  </div>
                  {editingId === comment.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        maxLength={1000}
                        className="w-full resize-none rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                      />
                      <div className="mt-1.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(comment.id)}
                          disabled={!editText.trim()}
                          className="text-xs text-white/70 transition-colors hover:text-white disabled:opacity-40"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-xs text-white/40 transition-colors hover:text-white/60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm break-words whitespace-pre-line text-white/60">
                      {comment.body}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
