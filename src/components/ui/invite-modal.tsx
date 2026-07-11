"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Mail, X, Check, Loader2 } from "lucide-react";

type InviteModalProps = {
  poemId?: string;
  accentClass?: string; // e.g. "text-amber-400 border-amber-500/30" or "text-emerald-400 border-emerald-500/30"
  buttonAccent?: string; // e.g. "hover:border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400"
};

export default function InviteModal({
  poemId,
  accentClass = "text-amber-400 border-amber-500/30",
  buttonAccent = "hover:border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400",
}: InviteModalProps) {
  const { data: session, status: authStatus } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [inviteeName, setInviteeName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill sender name from session when available
  useEffect(() => {
    if (session?.user?.name) {
      setSenderName(session.user.name);
    }
  }, [session]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset state on close
      setInviteeName("");
      setRecipientEmail("");
      setPersonalNote("");
      setSuccess(false);
      setError(null);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          inviteeName,
          recipientEmail,
          personalNote,
          poemId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite.");
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = authStatus === "authenticated";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold tracking-wider uppercase transition-all active:scale-98 ${buttonAccent}`}
      >
        <UserPlus className="h-4 w-4" />
        Invite a Friend
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {!isLoggedIn ? (
                /* Login Prompt Screen */
                <div className="py-6 text-center space-y-4 font-[family-name:var(--font-inter)]">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Sign In to Invite Friends</h3>
                  <p className="text-xs text-white/50 leading-relaxed max-w-xs mx-auto">
                    Please sign in with your account to invite friends and share the beauty of these poems.
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = `/api/auth/signin?callbackUrl=${encodeURIComponent(
                        window.location.href
                      )}`;
                    }}
                    className="rounded-xl bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black transition-transform hover:scale-102 active:scale-98"
                  >
                    Sign In Now
                  </button>
                </div>
              ) : success ? (
                /* Success Screen */
                <div className="py-8 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Invitation Sent!</h3>
                  <p className="text-sm text-white/60 font-[family-name:var(--font-inter)] leading-relaxed">
                    A beautiful email preview has been sent to <strong className="text-white/80">{recipientEmail}</strong> on your behalf.
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-4 rounded-xl bg-white px-6 py-2 text-xs font-semibold uppercase tracking-wider text-black transition-transform hover:scale-102 active:scale-98"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Invite Form Screen */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Mail className={`h-5 w-5 ${accentClass.split(" ")[0] || "text-white/60"}`} />
                      Invite a Friend
                    </h3>
                    <p className="text-xs text-white/50 font-[family-name:var(--font-inter)] mt-1">
                      Share the beauty of this sanctuary. We will email them a personalized invitation card with a premium website preview.
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400 font-[family-name:var(--font-inter)]">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3 font-[family-name:var(--font-inter)]">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="e.g. John"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 focus:border-white/20 focus:bg-white/10 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1">
                          Friend&apos;s Name
                        </label>
                        <input
                          type="text"
                          required
                          value={inviteeName}
                          onChange={(e) => setInviteeName(e.target.value)}
                          placeholder="e.g. Sarah"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 focus:border-white/20 focus:bg-white/10 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1">
                          Friend&apos;s Email
                        </label>
                        <input
                          type="email"
                          required
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="sarah@example.com"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 focus:border-white/20 focus:bg-white/10 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/50">
                          Personal Note <span className="text-[10px] text-white/30">(Optional)</span>
                        </label>
                        <span className="text-[10px] text-white/35">
                          {100 - personalNote.length} characters left
                        </span>
                      </div>
                      <textarea
                        maxLength={100}
                        value={personalNote}
                        onChange={(e) => setPersonalNote(e.target.value)}
                        placeholder="Say something warm..."
                        rows={2}
                        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-white/20 focus:bg-white/10 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Invitation"
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
