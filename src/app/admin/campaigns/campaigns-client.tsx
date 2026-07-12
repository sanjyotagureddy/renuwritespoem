"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { deleteCampaign, sendTestEmailAction, sendCampaignAction } from "../campaign-actions";

type CampaignItem = {
  id: string;
  subject: string;
  body: string;
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  sentCount: number;
  failedCount: number;
};

export default function CampaignsClient({
  initialCampaigns,
}: {
  initialCampaigns: CampaignItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testError, setTestError] = useState("");
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this campaign?")) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteCampaign(id);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  async function handleSendCampaign(id: string) {
    if (!confirm("Are you sure you want to dispatch this campaign to ALL verified newsletter subscribers now? This action cannot be undone.")) {
      return;
    }
    startTransition(async () => {
      try {
        const res = await sendCampaignAction(id);
        alert(`Campaign successfully processed! Sent: ${res.sent}, Failed/Suppressed: ${res.failed}`);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Dispatch failed");
        router.refresh();
      }
    });
  }

  function openTestModal(id: string) {
    setActiveCampaignId(id);
    setTestEmail("");
    setTestError("");
    setTestSuccess(false);
    setTestModalOpen(true);
  }

  async function handleTestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCampaignId || !testEmail.trim()) return;

    setTestSubmitting(true);
    setTestError("");
    setTestSuccess(false);

    try {
      await sendTestEmailAction(activeCampaignId, testEmail.trim());
      setTestSuccess(true);
      setTestEmail("");
      setTimeout(() => {
        setTestModalOpen(false);
      }, 1500);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : "Failed to send test email.");
    } finally {
      setTestSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-left text-xs text-white/60">
          <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] font-semibold tracking-wider text-white/45 uppercase">
            <tr>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created Date</th>
              <th className="px-6 py-4">Sent/Failed</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {initialCampaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white/30">
                  No campaigns drafted yet.
                </td>
              </tr>
            ) : (
              initialCampaigns.map((camp) => {
                let statusBadge = (
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] text-white/70 font-medium">
                    Draft
                  </span>
                );

                if (camp.status === "SENDING") {
                  statusBadge = (
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] text-amber-400 font-medium">
                      Sending
                    </span>
                  );
                } else if (camp.status === "SENT") {
                  statusBadge = (
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-400 font-medium">
                      Sent
                    </span>
                  );
                } else if (camp.status === "FAILED") {
                  statusBadge = (
                    <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] text-rose-400 font-medium">
                      Failed
                    </span>
                  );
                } else if (camp.status === "SCHEDULED") {
                  statusBadge = (
                    <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] text-purple-400 font-medium">
                      Scheduled
                    </span>
                  );
                }

                return (
                  <tr key={camp.id} className="hover:bg-white/[0.01]">
                    <td className="px-6 py-4 font-medium text-white max-w-xs truncate">
                      {camp.subject}
                    </td>
                    <td className="px-6 py-4">{statusBadge}</td>
                    <td className="px-6 py-4">
                      {new Date(camp.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {camp.status === "SENT" || camp.status === "FAILED" || camp.sentCount > 0 || camp.failedCount > 0 ? (
                        <span className="text-[11px] font-[family-name:var(--font-inter)] text-white/50">
                          {camp.sentCount} sent / {camp.failedCount} failed
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {camp.status !== "SENDING" && camp.status !== "SENT" && (
                          <Link
                            href={`/admin/campaigns/${camp.id}/edit`}
                            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 uppercase"
                          >
                            Edit
                          </Link>
                        )}
                        {camp.status !== "SENDING" && (
                          <button
                            onClick={() => openTestModal(camp.id)}
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase"
                          >
                            Test
                          </button>
                        )}
                        {camp.status === "DRAFT" && (
                          <button
                            disabled={isPending}
                            onClick={() => handleSendCampaign(camp.id)}
                            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase disabled:opacity-40"
                          >
                            Send
                          </button>
                        )}
                        {(camp.status === "SENT" || camp.status === "FAILED") && (
                          <Link
                            href={`/admin/campaigns/${camp.id}`}
                            className="text-[10px] font-bold text-white hover:text-white/80 uppercase"
                          >
                            Logs
                          </Link>
                        )}
                        {camp.status !== "SENDING" && (
                          <button
                            disabled={isPending}
                            onClick={() => handleDelete(camp.id)}
                            className="text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase disabled:opacity-40"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Test Email Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-sm font-semibold text-white">Send Test Email</h3>
            <p className="text-xs text-white/40 mt-1">
              Verify how the subject and body look by sending a preview template copy to your test email address.
            </p>

            <form onSubmit={handleTestSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-white/45 uppercase tracking-wide">
                  Test Email Recipient
                </label>
                <input
                  type="email"
                  value={testEmail}
                  required
                  placeholder="recipient@example.com"
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-amber-300/40 focus:ring-1 focus:ring-amber-300/40"
                />
              </div>

              {testError && <p className="text-[11px] text-rose-400 leading-relaxed">{testError}</p>}
              {testSuccess && <p className="text-[11px] text-emerald-400 font-medium">✓ Test email sent successfully!</p>}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={testSubmitting || testSuccess}
                  className="rounded-lg border border-amber-300/20 bg-amber-200 px-3.5 py-2 text-xs font-semibold text-stone-950 hover:bg-amber-100 disabled:opacity-40 flex items-center gap-1.5"
                >
                  {testSubmitting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Preview"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
