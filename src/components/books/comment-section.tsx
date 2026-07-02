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
    const res = await fetch(`/api/book-comments/${commentId}/likes`, { method: "POST" });
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
        liked ? "text-rose-400/80 hover:text-rose-300" : "text-white/30 hover:text-white/60"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
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
      .then((data) => { if (Array.isArray(data)) setComments(data); });
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

  function startEdit(comment: CommentData) { setEditingId(comment.id); setEditText(comment.body); }
  function cancelEdit() { setEditingId(null); setEditText(""); }

  async function saveEdit(commentId: string) {
    if (!editText.trim()) return;
    const res = await fetch(`/api/book-comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, body: data.body, edited: true } : c)));
      cancelEdit();
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    const res = await fetch(`/api/book-comments/${commentId}`, { method: "DELETE" });
    if (res.ok) setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  return (
    <div>
      <h3 className="text-sm uppercase tracking-[0.18em] text-white/50 mb-4">
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
            className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30 resize-none"
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="mt-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </form>
      ) : (
        <p className="text-xs text-white/40 mb-5">Sign in to leave a comment.</p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-white/30">No comments yet. Be the first.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isOwner = session?.user?.id === comment.userId;
            return (
              <div key={comment.id} className="flex gap-3">
                {comment.user.image ? (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5">
                    <Image src={comment.user.image} alt={comment.user.name} fill className="object-cover" sizes="28px" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60 shrink-0 mt-0.5">
                    {comment.user.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/80 font-medium">{comment.user.name}</span>
                    <span className="text-[10px] text-white/30">{timeAgo(comment.createdAt)}</span>
                    {comment.edited && <span className="text-[10px] text-white/25 italic">edited</span>}
                    <span className="ml-auto flex items-center gap-2">
                      {isOwner && editingId !== comment.id && (
                        <>
                          <button type="button" onClick={() => startEdit(comment)} className="text-white/25 hover:text-white/60 transition-colors" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => handleDelete(comment.id)} className="text-rose-400/30 hover:text-rose-400 transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <CommentLikeButton commentId={comment.id} initialLiked={comment.liked} initialCount={comment.likeCount} disabled={!session?.user} />
                    </span>
                  </div>
                  {editingId === comment.id ? (
                    <div className="mt-2">
                      <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} maxLength={1000} className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30 resize-none" />
                      <div className="mt-1.5 flex items-center gap-2">
                        <button type="button" onClick={() => saveEdit(comment.id)} disabled={!editText.trim()} className="text-xs text-white/70 hover:text-white transition-colors disabled:opacity-40">Save</button>
                        <button type="button" onClick={cancelEdit} className="text-xs text-white/40 hover:text-white/60 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-white/60 mt-1 whitespace-pre-line break-words">{comment.body}</p>
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
