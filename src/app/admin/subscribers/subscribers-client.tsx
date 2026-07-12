"use client";

import React, { useState, useTransition } from "react";
import { deleteSubscriber, toggleSubscriberStatus, bulkSubscribeUsers } from "../subscriber-actions";
import { Loader2 } from "lucide-react";

type SubscriberItem = {
  id: string;
  email: string;
  name: string | null;
  verified: boolean;
  subscribedAt: Date | string | null;
  unsubscribedAt: Date | string | null;
};

type UnsubscribedUser = {
  id: string;
  email: string;
  name: string | null;
};

export default function SubscribersClient({
  initialSubscribers,
  totalCount,
  currentPage,
  statusFilter,
  searchQuery,
  unsubscribedUsers = [],
}: {
  initialSubscribers: SubscriberItem[];
  totalCount: number;
  currentPage: number;
  statusFilter: string;
  searchQuery: string;
  unsubscribedUsers?: UnsubscribedUser[];
}) {
  const [isPending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [tab, setTab] = useState<"manual" | "existing">("manual");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const filteredUsers = unsubscribedUsers.filter((u) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return u.email.toLowerCase().includes(q) || (u.name && u.name.toLowerCase().includes(q));
  });

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
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0f1118] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                New Subscriber
              </h3>
              <button
                onClick={() => {
                  setAddOpen(false);
                  setSelectedUserIds([]);
                  setTab("manual");
                }}
                className="text-white/40 hover:text-white text-lg"
              >
                ×
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-white/10 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setTab("manual");
                  setAddError("");
                }}
                className={`flex-1 pb-2 border-b-2 text-center transition-colors ${
                  tab === "manual" ? "border-emerald-500 text-white font-semibold" : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                Add Manually
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("existing");
                  setAddError("");
                }}
                className={`flex-1 pb-2 border-b-2 text-center transition-colors ${
                  tab === "existing" ? "border-emerald-500 text-white font-semibold" : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                From Existing Users ({unsubscribedUsers.length})
              </button>
            </div>

            {tab === "manual" ? (
              <form onSubmit={handleAddSubmit} className="space-y-4 pt-1">
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
            ) : (
              <div className="space-y-4 pt-1">
                {/* Search Bar for Existing Users */}
                <input
                  type="text"
                  value={userSearch}
                  placeholder="Filter users by name or email..."
                  onChange={(e) => setUserSearch(e.target.value)}
                  id="existing-users-search"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/35 outline-none focus:border-white/20"
                />

                {/* Bulk Select Helper Checkbox */}
                <div className="flex items-center justify-between text-[10px] text-white/45 uppercase tracking-wider px-1">
                  <span>Registered Accounts ({filteredUsers.length})</span>
                  {filteredUsers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const allFilteredIds = filteredUsers.map((u) => u.id);
                        const isAllSelected = allFilteredIds.every((id) => selectedUserIds.includes(id));
                        if (isAllSelected) {
                          // Deselect only the filtered ones
                          setSelectedUserIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
                        } else {
                          // Select all filtered ones (union with existing selection)
                          setSelectedUserIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
                        }
                      }}
                      className="text-emerald-400 hover:underline hover:text-emerald-300 font-bold"
                    >
                      {filteredUsers.every((u) => selectedUserIds.includes(u.id)) ? "Deselect All" : "Select All"}
                    </button>
                  )}
                </div>

                {/* Scrollable list of accounts */}
                <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl bg-black/25 p-2 space-y-2 scrollbar-thin">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-xs text-white/30 py-6">
                      {userSearch ? "No matching users found." : "No unregistered users found."}
                    </p>
                  ) : (
                    filteredUsers.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-start gap-2.5 text-xs text-white/80 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors border border-transparent hover:border-white/5"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUserIds((prev) => [...prev, user.id]);
                            } else {
                              setSelectedUserIds((prev) => prev.filter((id) => id !== user.id));
                            }
                          }}
                          className="accent-emerald-500 rounded border-white/20 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">
                            {user.name || "—"}
                          </p>
                          <p className="text-[10px] text-white/40 truncate">
                            {user.email}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>

                {addError && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-[10px] text-rose-300 animate-fadeIn">
                    ⚠️ {addError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (selectedUserIds.length === 0) return;
                    setBulkSubmitting(true);
                    setAddError("");
                    const selectedUsers = unsubscribedUsers.filter((u) => selectedUserIds.includes(u.id));
                    try {
                      const res = await bulkSubscribeUsers(selectedUsers.map((u) => ({ email: u.email, name: u.name })));
                      if (res.success) {
                        setAddOpen(false);
                        setSelectedUserIds([]);
                        setTab("manual");
                        window.location.reload();
                      }
                    } catch (err) {
                      setAddError(err instanceof Error ? err.message : "Failed to bulk subscribe.");
                    } finally {
                      setBulkSubmitting(false);
                    }
                  }}
                  disabled={selectedUserIds.length === 0 || bulkSubmitting}
                  className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-semibold tracking-wider text-black uppercase transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  {bulkSubmitting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    `Subscribe Selected (${selectedUserIds.length})`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
