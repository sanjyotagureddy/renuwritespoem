"use client";

import React, { useState, useTransition } from "react";
import { deleteSubscriber, toggleSubscriberStatus } from "../subscriber-actions";

type SubscriberItem = {
  id: string;
  email: string;
  name: string | null;
  verified: boolean;
  subscribedAt: Date | string | null;
  unsubscribedAt: Date | string | null;
};

export default function SubscribersClient({
  initialSubscribers,
  totalCount,
  currentPage,
  statusFilter,
  searchQuery,
}: {
  initialSubscribers: SubscriberItem[];
  totalCount: number;
  currentPage: number;
  statusFilter: string;
  searchQuery: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Client-side actions
  async function handleAction(id: string, action: "verify" | "unsubscribe" | "delete") {
    if (action === "delete" && !confirm("Are you sure you want to permanently delete this subscriber?")) {
      return;
    }

    startTransition(async () => {
      try {
        if (action === "delete") {
          await deleteSubscriber(id);
        } else {
          await toggleSubscriberStatus(id, action);
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "Action failed");
      }
    });
  }

  // Handle Manual Add Submit
  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAddSubmitting(true);
    setAddError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim(), name: newName.trim() || null }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to add subscriber");
      }

      setAddOpen(false);
      setNewName("");
      setNewEmail("");
      // Force refresh the server page to show the new pending subscriber
      window.location.reload();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAddSubmitting(false);
    }
  }

  // Export to CSV
  function handleExport() {
    // Generate CSV content
    const headers = ["ID", "Name", "Email", "Verified", "Subscribed At", "Unsubscribed At"];
    const rows = initialSubscribers.map((s) => [
      s.id,
      s.name ?? "",
      s.email,
      s.verified ? "Yes" : "No",
      s.subscribedAt ? new Date(s.subscribedAt).toISOString() : "",
      s.unsubscribedAt ? new Date(s.unsubscribedAt).toISOString() : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const totalPages = Math.ceil(totalCount / 10);

  function handleFilterChange(status: string) {
    const params = new URLSearchParams(window.location.search);
    if (status) params.set("status", status);
    else params.delete("status");
    params.set("page", "1");
    window.location.search = params.toString();
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const search = fd.get("search") as string;
    const params = new URLSearchParams(window.location.search);
    if (search) params.set("search", search.trim());
    else params.delete("search");
    params.set("page", "1");
    window.location.search = params.toString();
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    window.location.search = params.toString();
  }

  return (
    <div className="space-y-6 font-[family-name:var(--font-inter)]">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:max-w-md">
          <input
            name="search"
            type="text"
            defaultValue={searchQuery}
            placeholder="Search email or name..."
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-white/20"
          />
          <button
            type="submit"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            disabled={initialSubscribers.length === 0}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-semibold text-black transition-colors"
          >
            + Add Subscriber
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 pb-3">
        {[
          { label: "All Statuses", value: "" },
          { label: "Verified", value: "verified" },
          { label: "Pending", value: "pending" },
          { label: "Unsubscribed", value: "unsubscribed" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table container */}
      <div className={`overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
        <table className="w-full text-left text-xs text-white/70">
          <thead className="bg-white/5 text-white/45 uppercase text-[10px] tracking-wider border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Subscribed At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {initialSubscribers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white/30">
                  No subscribers found.
                </td>
              </tr>
            ) : (
              initialSubscribers.map((sub) => {
                let statusBadge = <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] text-amber-400 font-medium">Pending</span>;
                if (sub.unsubscribedAt) {
                  statusBadge = <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] text-rose-400 font-medium">Unsubscribed</span>;
                } else if (sub.verified) {
                  statusBadge = <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-400 font-medium">Verified</span>;
                }

                return (
                  <tr key={sub.id} className="hover:bg-white/[0.01]">
                    <td className="px-6 py-4 font-medium text-white">{sub.name || "—"}</td>
                    <td className="px-6 py-4">{sub.email}</td>
                    <td className="px-6 py-4">{statusBadge}</td>
                    <td className="px-6 py-4">
                      {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                      {!sub.verified && !sub.unsubscribedAt && (
                        <button
                          onClick={() => handleAction(sub.id, "verify")}
                          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase"
                        >
                          Verify
                        </button>
                      )}
                      {sub.verified && !sub.unsubscribedAt && (
                        <button
                          onClick={() => handleAction(sub.id, "unsubscribe")}
                          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 uppercase"
                        >
                          Unsubscribe
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(sub.id, "delete")}
                        className="text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/40">
            Showing Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0f1118] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Add Subscriber Manually
              </h3>
              <button
                onClick={() => setAddOpen(false)}
                className="text-white/40 hover:text-white text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/40">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/40">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20"
                />
              </div>

              {addError && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-[10px] text-rose-300">
                  ⚠️ {addError}
                </div>
              )}

              <button
                type="submit"
                disabled={addSubmitting}
                className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-semibold tracking-wider text-black uppercase transition-all disabled:opacity-40"
              >
                {addSubmitting ? "Adding..." : "Add & Send Verification"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
