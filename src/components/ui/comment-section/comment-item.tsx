"use client";

import { useState } from "react";
import Image from "next/image";
import { generateAvatarUrl } from "@/lib/utils";
import CommentLikeButton from "./comment-like-button";

export type CommentData = {
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

export type CommentItemProps = {
  comment: CommentData;
  sessionUserId?: string;
  sessionUserRole?: string;
  type: "poem" | "book" | "audio";
  onDelete: (commentId: string) => void;
  onTogglePin: (commentId: string, currentPinned: boolean) => Promise<void>;
  onDisable: (commentId: string) => void;
  onUpdateText: (commentId: string, newText: string) => void;
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

export default function CommentItem({
  comment,
  sessionUserId,
  sessionUserRole,
  type,
  onDelete,
  onTogglePin,
  onDisable,
  onUpdateText,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);

  const isOwner = sessionUserId === comment.userId;
  const canDelete = isOwner || sessionUserRole === "ADMIN";
  const commentItemApi = `/api/${type === "book" ? "book-comments" : type === "audio" ? "audio-comments" : "comments"}/${comment.id}`;

  async function saveEdit() {
    if (!editText.trim()) return;
    const res = await fetch(commentItemApi, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      onUpdateText(comment.id, data.body);
      setIsEditing(false);
    }
  }

  return (
    <div className="flex gap-2.5 items-start">
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
        <img
          src={generateAvatarUrl(comment.userId || comment.user.name)}
          alt={comment.user.name}
          className="mt-0.5 h-6 w-6 shrink-0 rounded-full border border-white/10 bg-white/5 object-cover"
        />
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
            {isEditing ? (
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
                    onClick={saveEdit}
                    disabled={!editText.trim()}
                    className="text-[10px] font-semibold text-white/80 hover:text-white transition-colors disabled:opacity-40"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(comment.body);
                    }}
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

        {!isEditing && (
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
              disabled={!sessionUserId}
              type={type}
            />

            {sessionUserRole === "ADMIN" && (
              <>
                <button
                  type="button"
                  onClick={() => onTogglePin(comment.id, comment.pinned)}
                  className={`font-semibold hover:text-white/60 transition-colors uppercase ${
                    comment.pinned ? "text-amber-400" : "text-white/40"
                  }`}
                >
                  {comment.pinned ? "Unpin" : "Pin"}
                </button>
                <button
                  type="button"
                  onClick={() => onDisable(comment.id)}
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
                    onClick={() => setIsEditing(true)}
                    className="font-semibold hover:text-white/60 transition-colors uppercase"
                  >
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
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
}
