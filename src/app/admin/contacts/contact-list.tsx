"use client";

import { useRef, useState, useTransition, useCallback } from "react";
import { replyToContact, deleteContact, markAsUnread } from "../contact-actions";
import { Mail, Trash2, ChevronDown, ChevronUp, CheckCircle2, Send, MailOpen, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  repliedAt: Date | null;
  repliedNote: string | null;
  createdAt: Date;
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

function MessageCard({ msg }: { msg: ContactMessage }) {
  const [expanded, setExpanded] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [replied, setReplied] = useState(!!msg.repliedAt);
  const [repliedAt, setRepliedAt] = useState<Date | null>(msg.repliedAt);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generateAiDraft = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: msg.name,
          subject: msg.subject,
          message: msg.message,
        }),
      });
      const data = await res.json();
    if (!res.ok) {
      const errMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
      throw new Error(errMsg || "Failed to generate.");
    }
      if (textareaRef.current) {
        textareaRef.current.value = data.reply;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }, [msg.name, msg.subject, msg.message]);

  function handleReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await replyToContact(fd);
        setReplied(true);
        setRepliedAt(new Date());
        setReplyOpen(false);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send reply.");
      }
    });
  }

  function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirm(`Delete message from ${msg.name}? This cannot be undone.`)) return;
    const fd = new FormData(e.currentTarget);
    startTransition(() => deleteContact(fd));
  }

  return (
    <div
      className={`rounded-xl border backdrop-blur-sm transition-all ${
        replied
          ? "border-white/[0.06] bg-white/[0.03]"
          : "border-violet-500/20 bg-violet-500/[0.05] shadow-[0_0_20px_rgba(139,92,246,0.04)]"
      }`}
    >
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 px-5 py-4">
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Avatar */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase ${
              replied
                ? "bg-white/10 text-white/50"
                : "bg-violet-500/20 text-violet-300"
            }`}
          >
            {msg.name.charAt(0)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-white truncate">{msg.name}</p>
              {replied ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Replied
                </span>
              ) : (
                <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Awaiting Reply
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-white/40 truncate">
              <a
                href={`mailto:${msg.email}`}
                className="hover:text-white transition-colors"
              >
                {msg.email}
              </a>{" "}
              · {msg.phone}
            </p>
            <p className="mt-1 text-sm font-medium text-white/70 truncate">
              {msg.subject}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 sm:mt-0.5">
          <span className="text-[11px] text-white/30 mr-1">
            {formatDate(msg.createdAt)}
          </span>

          {/* Expand */}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 text-[11px] font-bold uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            {expanded ? (
              <><ChevronUp className="h-3.5 w-3.5" /> Hide Message</>
            ) : (
              <><ChevronDown className="h-3.5 w-3.5" /> Show Message</>
            )}
          </button>

          {/* Reply */}
          <button
            onClick={() => { setReplyOpen((p) => !p); setExpanded(true); }}
            disabled={isPending}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 text-[11px] font-bold uppercase tracking-wider text-violet-400 hover:bg-violet-500/20 transition-colors disabled:opacity-40"
          >
            <Mail className="h-3.5 w-3.5" />
            {replied ? "Re-reply" : "Reply"}
          </button>

          {/* Mark as Unread */}
          {replied && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startTransition(async () => {
                await markAsUnread(fd);
                setReplied(false);
                setRepliedAt(null);
              });
            }}>
              <input type="hidden" name="id" value={msg.id} />
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 text-[11px] font-bold uppercase tracking-wider text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-40"
                title="Mark as unread"
              >
                <MailOpen className="h-3.5 w-3.5" />
                Unread
              </button>
            </form>
          )}

          {/* Delete */}
          <form onSubmit={handleDelete}>
            <input type="hidden" name="id" value={msg.id} />
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/30 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
              title="Delete message"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Expanded message body */}
      {expanded && (
        <div className="px-5 pb-4 border-t border-white/8 pt-4 space-y-4">
          <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4">
            <p className="text-xs uppercase tracking-wider text-white/30 mb-2">Message</p>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
              {msg.message}
            </p>
          </div>

          {replied && msg.repliedNote && (
            <div className="rounded-xl bg-emerald-500/[0.04] border border-emerald-500/15 p-4">
              <p className="text-xs uppercase tracking-wider text-emerald-400/60 mb-2">
                Your Reply · {repliedAt ? formatDate(repliedAt) : ""}
              </p>
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                {msg.repliedNote}
              </p>
            </div>
          )}

          {/* Reply form */}
          {replyOpen && (
            <form ref={formRef} onSubmit={handleReply} className="space-y-3">
              <input type="hidden" name="id" value={msg.id} />

              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>⚠️ {error}</AlertDescription>
                </Alert>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase tracking-wider text-white/40">
                    Reply to {msg.name} &lt;{msg.email}&gt;
                  </label>
                  <button
                    type="button"
                    onClick={generateAiDraft}
                    disabled={isGenerating || isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-400 hover:bg-violet-500/20 transition-all disabled:opacity-40"
                  >
                    <Sparkles className={`h-3 w-3 ${isGenerating ? "animate-spin" : ""}`} />
                    {isGenerating ? "Drafting…" : "Draft with AI"}
                  </button>
                </div>
                <textarea
                  ref={textareaRef}
                  name="replyBody"
                  rows={7}
                  required
                  disabled={isPending}
                  placeholder="Write your reply or click 'Draft with AI' to generate one…"
                  className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 disabled:opacity-50 resize-none placeholder:text-white/20"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 active:scale-95 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isPending ? "Sending…" : "Send Reply"}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyOpen(false)}
                  className="text-xs text-white/40 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default function ContactList({
  messages,
}: {
  messages: ContactMessage[];
}) {
  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
        <p className="text-white/40 text-sm">No messages in this view.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <MessageCard key={msg.id} msg={msg} />
      ))}
    </div>
  );
}
