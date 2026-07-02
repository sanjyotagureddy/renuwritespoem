"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

type LikeUser = { name: string; image: string | null };

export default function BookLikeButton({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [users, setUsers] = useState<LikeUser[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/books/${slug}/likes`)
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
    const res = await fetch(`/api/books/${slug}/likes`, { method: "POST" });
    const data = await res.json();
    setLiked(data.liked);
    setCount(data.likeCount);

    const listRes = await fetch(`/api/books/${slug}/likes`);
    const listData = await listRes.json();
    setUsers(listData.users ?? []);
    setLoading(false);
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
              : "border-white/15 bg-white/5 text-white/60 hover:text-white hover:border-white/30"
          } ${!session?.user ? "opacity-50 cursor-not-allowed" : ""}`}
          title={!session?.user ? "Sign in to like" : liked ? "Unlike" : "Like"}
        >
          <span className="text-base">{liked ? "♥" : "♡"}</span>
          <span>Like</span>
        </button>

        {count > 0 && (
          <button
            type="button"
            onClick={() => count > 0 && setShowPopup((v) => !v)}
            className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            {count} {count === 1 ? "like" : "likes"}
          </button>
        )}
      </div>

      {showPopup && users.length > 0 && (
        <div
          ref={popupRef}
          className="absolute top-full left-0 mt-2 z-50 w-64 max-h-72 overflow-y-auto rounded-xl border border-white/15 bg-neutral-900 shadow-xl"
        >
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-xs uppercase tracking-wider text-white/50">
              Liked by {count} {count === 1 ? "person" : "people"}
            </p>
          </div>
          <div className="divide-y divide-white/8">
            {users.map((user, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                {user.image ? (
                  <img src={user.image} alt={user.name} width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">
                    {user.name[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-white/80 truncate">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
