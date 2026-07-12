"use client";

import { useState } from "react";

export type CommentLikeButtonProps = {
  commentId: string;
  initialLiked: boolean;
  initialCount: number;
  disabled: boolean;
  type: "poem" | "book" | "audio";
};

export default function CommentLikeButton({
  commentId,
  initialLiked,
  initialCount,
  disabled,
  type,
}: CommentLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  async function handleToggle() {
    if (disabled) return;
    const path = type === "book" ? "book-comments" : type === "audio" ? "audio-comments" : "comments";
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
