"use client";

import React, { useState, useTransition } from "react";
import { updateSubscriberPreferences } from "./preferences-actions";

export default function PreferencesForm({
  email,
  token,
  initialName,
  initialPrefPoems,
  initialPrefBooks,
  initialPrefAudio,
  initialUnsubscribed,
}: {
  email: string;
  token: string;
  initialName: string | null;
  initialPrefPoems: boolean;
  initialPrefBooks: boolean;
  initialPrefAudio: boolean;
  initialUnsubscribed: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialName ?? "");
  const [prefPoems, setPrefPoems] = useState(initialPrefPoems);
  const [prefBooks, setPrefBooks] = useState(initialPrefBooks);
  const [prefAudio, setPrefAudio] = useState(initialPrefAudio);
  const [isUnsubscribed, setIsUnsubscribed] = useState(initialUnsubscribed);

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setMessage("");

    startTransition(async () => {
      try {
        const res = await updateSubscriberPreferences({
          email,
          token,
          name: name.trim() || null,
          prefPoems,
          prefBooks,
          prefAudio,
          unsubscribeAll: false,
        });

        setStatus("success");
        setMessage("Preferences updated successfully!");
        setIsUnsubscribed(false);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Failed to update preferences.");
      }
    });
  }

  async function handleUnsubscribeAll() {
    if (!confirm("Are you sure you want to opt out of all future emails?")) {
      return;
    }
    setStatus("idle");
    setMessage("");

    startTransition(async () => {
      try {
        const res = await updateSubscriberPreferences({
          email,
          token,
          name: null,
          prefPoems: false,
          prefBooks: false,
          prefAudio: false,
          unsubscribeAll: true,
        });

        setStatus("success");
        setMessage("You have been unsubscribed from all email updates.");
        setIsUnsubscribed(true);
        setPrefPoems(false);
        setPrefBooks(false);
        setPrefAudio(false);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Unsubscribe failed.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {status === "success" && (
        <div className={`rounded-xl border p-4 text-xs leading-relaxed ${
          isUnsubscribed
            ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
        }`}>
          {isUnsubscribed ? "✉️ " : "✓ "} {message}
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">
          ⚠️ {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5 font-semibold">
            Your Name (Optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rahul Sharma"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-white/40 font-semibold">
            Notification Preferences
          </h3>

          <div className="space-y-3">
            {/* Poems preference */}
            <label className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.01] p-3.5 cursor-pointer hover:bg-white/[0.02] hover:border-white/10 transition-all">
              <input
                type="checkbox"
                checked={prefPoems}
                onChange={(e) => setPrefPoems(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/10 bg-black/40 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
              />
              <div>
                <p className="text-xs font-semibold text-white">New Poems & Verses</p>
                <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">
                  Receive alerts when Renu publishes new poetry in English, Hindi, or Marathi.
                </p>
              </div>
            </label>

            {/* Audio preference */}
            <label className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.01] p-3.5 cursor-pointer hover:bg-white/[0.02] hover:border-white/10 transition-all">
              <input
                type="checkbox"
                checked={prefAudio}
                onChange={(e) => setPrefAudio(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/10 bg-black/40 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
              />
              <div>
                <p className="text-xs font-semibold text-white">Audio Recitations</p>
                <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">
                  Hear new voice play recitations, story narrations, and readings recorded by Renu.
                </p>
              </div>
            </label>

            {/* Books preference */}
            <label className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.01] p-3.5 cursor-pointer hover:bg-white/[0.02] hover:border-white/10 transition-all">
              <input
                type="checkbox"
                checked={prefBooks}
                onChange={(e) => setPrefBooks(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/10 bg-black/40 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
              />
              <div>
                <p className="text-xs font-semibold text-white">Book Release & Orders</p>
                <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">
                  Get notified of printed book announcements, purchasing links, and updates.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:flex-1 rounded-full bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-semibold tracking-wider text-black uppercase transition-all disabled:opacity-40"
          >
            {isPending ? "Saving..." : "Save Preferences"}
          </button>
          
          <button
            type="button"
            onClick={handleUnsubscribeAll}
            disabled={isPending}
            className="w-full sm:w-auto rounded-full border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 px-6 py-3 text-xs font-semibold tracking-wider text-white hover:text-rose-300 uppercase transition-all disabled:opacity-40"
          >
            Unsubscribe From All
          </button>
        </div>
      </form>
    </div>
  );
}
