"use client";

import React, { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setStatus("error");
      setMessage("You must consent to the privacy terms to subscribe.");
      return;
    }
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || null }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      setMessage("Please check your email inbox to verify your subscription!");
      setEmail("");
      setName("");
      setConsent(false);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
      <h3 className="text-lg font-semibold text-white mb-2 font-[family-name:var(--font-playfair)]">
        Subscribe to Newsletter
      </h3>
      <p className="text-xs text-white/50 mb-5 leading-relaxed">
        Receive updates when Renu publishes new poems, audio play recitations, or updates on physical book releases.
      </p>

      {status === "success" ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300 leading-relaxed">
          ✉️ {message}
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div>
            <label className="sr-only">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div>
            <label className="sr-only">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address *"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-white/10 bg-black/40 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
            />
            <span className="text-[10px] leading-relaxed text-white/40 hover:text-white/50 transition-colors select-none">
              I consent to receive newsletter updates, new poem alerts, and book release news from Renu Writes Poem. I can unsubscribe at any time.
            </span>
          </label>

          {status === "error" && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-[11px] text-rose-300">
              ⚠️ {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white/10 border border-white/25 py-2.5 text-xs font-semibold tracking-wider text-white uppercase transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      )}
    </div>
  );
}
