"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

type LikeUser = { name: string; image: string | null };

export default function LikeButton({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [users, setUsers] = useState<LikeUser[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/poems/${slug}/likes`)
      .then((r) => r.json())
      .then((data) => {
        setLiked(data.liked);
        setCount(data.likeCount);
        setUsers(data.users ?? []);
      });
  }, [slug]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    }
    if (showPopup) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPopup]);

  async function handleToggle() {
    if (!session?.user) return;
    setLoading(true);
    const res = await fetch(`/api/poems/${slug}/likes`, { method: "POST" });
    const data = await res.json();
    setLiked(data.liked);
    setCount(data.likeCount);

    // Refresh the users list
    const listRes = await fetch(`/api/poems/${slug}/likes`);
    const listData = await listRes.json();
    setUsers(listData.users ?? []);
    setLoading(false);
  }

  function handleCountClick() {
    if (count > 0) setShowPopup((v) => !v);
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading || !session?.user}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors ${
            liked
              ? "border-rose-400/40 bg-rose-500/15 text-rose-400"
              : "border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
          } ${!session?.user ? "cursor-not-allowed opacity-50" : ""}`}
          title={!session?.user ? "Sign in to like" : liked ? "Unlike" : "Like"}
        >
          <span className="text-base">{liked ? "♥" : "♡"}</span>
          <span>Like</span>
        </button>

        {count > 0 && (
          <button
            type="button"
            onClick={handleCountClick}
            className="cursor-pointer text-sm text-white/50 transition-colors hover:text-white"
          >
            {count} {count === 1 ? "like" : "likes"}
          </button>
        )}
      </div>

      {/* Users popup */}
      {showPopup && users.length > 0 && (
        <div
          ref={popupRef}
          className="absolute top-full left-0 z-50 mt-2 max-h-72 w-64 overflow-y-auto rounded-xl border border-white/15 bg-neutral-900 shadow-xl"
        >
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs tracking-wider text-white/50 uppercase">
              Liked by {count} {count === 1 ? "person" : "people"}
            </p>
          </div>
          <div className="divide-y divide-white/8">
            {users.map((user, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs text-white/60">
                    {user.name[0]?.toUpperCase()}
                  </div>
                )}
                <span className="truncate text-sm text-white/80">
                  {user.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
