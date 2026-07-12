"use client";

import React from "react";

export type CommentFormProps = {
  text: string;
  setText: (val: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  hasSession: boolean;
};

export default function CommentForm({
  text,
  setText,
  submitting,
  onSubmit,
  hasSession,
}: CommentFormProps) {
  if (!hasSession) {
    return (
      <p className="mb-5 text-xs text-white/40">
        Sign in to leave a comment.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mb-5">
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
  );
}
