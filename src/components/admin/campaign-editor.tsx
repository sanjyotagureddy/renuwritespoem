"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createCampaign, updateCampaign } from "@/app/admin/campaign-actions";

type CampaignData = {
  id?: string;
  subject: string;
  body: string;
};

type PoemItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
};

type BookItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
};

type AudioItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
};

export default function CampaignEditor({
  initialCampaign,
  poems = [],
  books = [],
  audios = [],
}: {
  initialCampaign?: CampaignData;
  poems?: PoemItem[];
  books?: BookItem[];
  audios?: AudioItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState(initialCampaign?.subject ?? "");
  const [body, setBody] = useState(initialCampaign?.body ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<"poem" | "book" | "audio" | null>(null);

  const isEditMode = Boolean(initialCampaign?.id);

  function insertPlaceholder(placeholder: string) {
    const textarea = document.getElementById("campaign-body-textarea") as HTMLTextAreaElement;
    if (!textarea) {
      setBody(prev => prev + "\n" + placeholder + "\n");
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    setBody(before + placeholder + after);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
    }, 0);
  }

  function parseMarkdownToHtmlClient(markdown: string): string {
    let html = markdown;

    // Escape entities
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt bridge;"); // wait, let's make sure escaping is clean
    
    // Actually, simple escape is fine:
    html = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Italics
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Links
    html = html.replace(
      /\[(.*?)\]\((https?:\/\/.*?)\)/g,
      '<a href="$2" style="color:#9a3412; font-weight:bold; text-decoration:underline;" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Paragraphs
    const paragraphs = html.split(/\r?\n\r?\n/);
    let formatted = paragraphs
      .map((p) => {
        const trimmed = p.trim();
        if (!trimmed) return "";
        const withLineBreaks = trimmed.replace(/\r?\n/g, "<br />");
        return `<p style="margin:0 0 16px; line-height:1.7; color:#374151;">${withLineBreaks}</p>`;
      })
      .filter(Boolean)
      .join("");

    // Replace Poem templates
    formatted = formatted.replace(/\[\[POEM:(.*?)\]\]/g, (match, id) => {
      const poem = poems.find((p) => p.id === id);
      if (!poem) {
        return `<div style="border:1px dashed #f43f5e; padding:12px; border-radius:8px; margin:16px 0; color:#f43f5e; font-size:11px; text-align:center; background-color:#fff1f2;">⚠️ Poem not found (ID: ${id})</div>`;
      }
      return `
        <table style="width:100%; border:1px solid #f3e8df; border-radius:12px; background-color:#fff7ed; padding:16px; margin:20px 0; border-spacing:0; border-collapse:collapse; text-align:left;">
          <tr>
            <td style="padding:4px 0;">
              <span style="display:inline-block; font-size:10px; font-weight:bold; color:#9a3412; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:4px;">Featured Poem</span>
              <h3 style="margin:0 0 8px; color:#431407; font-family:serif; font-size:17px; font-weight:bold; line-height:1.3;">${poem.title}</h3>
              <p style="margin:0 0 12px; font-size:13px; color:#4b5563; line-height:1.6; font-style:italic;">"${poem.excerpt || "Read this moving poem..."}"</p>
              <a href="/poems/${poem.slug}" style="display:inline-block; padding:8px 16px; background-color:#9a3412; color:#ffffff !important; text-decoration:none; border-radius:6px; font-size:11px; font-weight:bold; letter-spacing:0.02em;">Read Poem &rarr;</a>
            </td>
          </tr>
        </table>
      `;
    });

    // Replace Book templates
    formatted = formatted.replace(/\[\[BOOK:(.*?)\]\]/g, (match, id) => {
      const book = books.find((b) => b.id === id);
      if (!book) {
        return `<div style="border:1px dashed #f43f5e; padding:12px; border-radius:8px; margin:16px 0; color:#f43f5e; font-size:11px; text-align:center; background-color:#fff1f2;">⚠️ Book not found (ID: ${id})</div>`;
      }
      const cover = book.coverImage || "/placeholder-book.png";
      return `
        <table style="width:100%; border:1px solid #f3e8df; border-radius:12px; background-color:#fff7ed; padding:16px; margin:20px 0; border-spacing:0; border-collapse:collapse; text-align:left;">
          <tr>
            <td style="width:80px; vertical-align:top; padding-right:16px;">
              <img src="${cover}" style="width:80px; height:auto; border-radius:6px; box-shadow:0 4px 6px rgba(0,0,0,0.05); display:block;" />
            </td>
            <td style="vertical-align:top; padding-top:4px;">
              <span style="display:inline-block; font-size:10px; font-weight:bold; color:#9a3412; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:4px;">Featured Collection</span>
              <h3 style="margin:0 0 8px; color:#431407; font-family:serif; font-size:17px; font-weight:bold; line-height:1.3;">${book.title}</h3>
              <p style="margin:0 0 12px; font-size:13px; color:#4b5563; line-height:1.5;">${book.description || "Explore this newly available collection..."}</p>
              <a href="/books/${book.slug}" style="display:inline-block; padding:8px 16px; background-color:#9a3412; color:#ffffff !important; text-decoration:none; border-radius:6px; font-size:11px; font-weight:bold; letter-spacing:0.02em;">Explore Book &rarr;</a>
            </td>
          </tr>
        </table>
      `;
    });

    // Replace Audio templates
    formatted = formatted.replace(/\[\[AUDIO:(.*?)\]\]/g, (match, id) => {
      const audio = audios.find((a) => a.id === id);
      if (!audio) {
        return `<div style="border:1px dashed #f43f5e; padding:12px; border-radius:8px; margin:16px 0; color:#f43f5e; font-size:11px; text-align:center; background-color:#fff1f2;">⚠️ Audio not found (ID: ${id})</div>`;
      }
      return `
        <table style="width:100%; border:1px solid #f3e8df; border-radius:12px; background-color:#fff7ed; padding:16px; margin:20px 0; border-spacing:0; border-collapse:collapse; text-align:left;">
          <tr>
            <td style="padding:4px 0;">
              <span style="display:inline-block; font-size:10px; font-weight:bold; color:#9a3412; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:4px;">Audio Recitation</span>
              <h3 style="margin:0 0 8px; color:#431407; font-family:serif; font-size:17px; font-weight:bold; line-height:1.3;">🔊 ${audio.title}</h3>
              <p style="margin:0 0 12px; font-size:13px; color:#4b5563; line-height:1.5;">${audio.description || "Listen to this beautiful recitation voiced by Renu..."}</p>
              <a href="/audio" style="display:inline-block; padding:8px 16px; background-color:#9a3412; color:#ffffff !important; text-decoration:none; border-radius:6px; font-size:11px; font-weight:bold; letter-spacing:0.02em;">Listen Now &rarr;</a>
            </td>
          </tr>
        </table>
      `;
    });

    return formatted;
  }

  const renderedPreview = parseMarkdownToHtmlClient(body || "*Draft content preview will appear here...*");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      setError("Subject and content body are required.");
      return;
    }

    setError("");
    setSuccess(false);

    startTransition(async () => {
      try {
        if (isEditMode && initialCampaign?.id) {
          await updateCampaign(initialCampaign.id, { subject, body });
        } else {
          await createCampaign({ subject, body });
        }
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/campaigns");
          router.refresh();
        }, 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save campaign.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto font-[family-name:var(--font-inter)] text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-semibold">{isEditMode ? "Edit Campaign" : "Compose Campaign"}</h2>
          <p className="text-xs text-white/40 mt-1">
            Compose your campaign with markdown text formatting and check live previews instantly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/campaigns")}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || success}
            className="rounded-lg border border-amber-300/20 bg-amber-200 px-4 py-2.5 text-xs font-semibold text-stone-950 hover:bg-amber-100 disabled:opacity-40 flex items-center gap-1.5 transition-colors"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving...
              </>
            ) : success ? (
              "Saved ✓"
            ) : (
              "Save Draft"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300 animate-fadeIn">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 animate-fadeIn">
          ✓ Campaign successfully saved! Redirecting to dashboard...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Form Fields */}
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.01] p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">
                Email Subject Line
              </label>
              <input
                type="text"
                required
                value={subject}
                placeholder="E.g., Whispers of the Wind — A New Poetry release"
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-black/25 px-3.5 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-amber-300/40 focus:ring-1 focus:ring-amber-300/40 transition-all"
              />
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              {/* Header block with buttons for template inserting */}
              <div className="flex items-center justify-between">
                <label htmlFor="campaign-body-textarea" className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">
                  Content Body (Markdown)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40 font-medium">Feature Collection:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedGroup(selectedGroup === "poem" ? null : "poem")}
                    className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      selectedGroup === "poem" ? "bg-amber-300 text-stone-950" : "bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    📄 Poem
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGroup(selectedGroup === "book" ? null : "book")}
                    className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      selectedGroup === "book" ? "bg-amber-300 text-stone-950" : "bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    📚 Book
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGroup(selectedGroup === "audio" ? null : "audio")}
                    className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      selectedGroup === "audio" ? "bg-amber-300 text-stone-950" : "bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    🔊 Audio
                  </button>
                </div>
              </div>

              {/* Toggleable dropdown selectors inside the editor context */}
              {selectedGroup && (
                <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-2 text-xs animate-fadeIn">
                  <span className="text-white/60 font-semibold uppercase text-[9px] tracking-wide">
                    Choose {selectedGroup}:
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        insertPlaceholder(`[[${selectedGroup.toUpperCase()}:${e.target.value}]]`);
                        setSelectedGroup(null);
                      }
                    }}
                    className="bg-black/40 text-white border border-white/20 rounded-md px-2.5 py-1 text-xs outline-none focus:border-amber-300/40 w-56 truncate"
                    defaultValue=""
                  >
                    <option value="">-- Select {selectedGroup} --</option>
                    {selectedGroup === "poem" &&
                      poems.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    {selectedGroup === "book" &&
                      books.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))}
                    {selectedGroup === "audio" &&
                      audios.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setSelectedGroup(null)}
                    className="text-stone-400 hover:text-white text-xs font-semibold ml-auto px-2"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <textarea
                id="campaign-body-textarea"
                required
                value={body}
                rows={14}
                placeholder="Use **bold** for emphasis, *italics* for styling, or [Link Label](https://...) for links. Click the collection buttons above to insert beautiful content cards."
                onChange={(e) => setBody(e.target.value)}
                className="w-full flex-1 min-h-[300px] rounded-lg border border-white/15 bg-black/25 px-3.5 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-amber-300/40 focus:ring-1 focus:ring-amber-300/40 transition-all font-mono resize-y leading-relaxed"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 text-[11px] leading-relaxed text-white/45">
            <p className="font-semibold text-white/60 mb-1">Markdown formatting cheatsheet:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Bold text: <code className="text-amber-200">**my bold text**</code></li>
              <li>Italics text: <code className="text-amber-200">*my italic text*</code></li>
              <li>Links: <code className="text-amber-200">[Visit Sanctuary](https://...)</code></li>
              <li>Start paragraphs: Leave an empty line between text blocks.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Live Shell Preview */}
        <div className="rounded-xl border border-white/10 bg-white/[0.01] p-5 flex flex-col">
          <label className="text-[10px] font-semibold tracking-wide text-white/40 uppercase mb-3 block">
            Live Email Preview
          </label>
          <div className="flex-1 rounded-lg border border-[#f1d5c6]/40 bg-[#fff7ed] text-stone-900 p-6 overflow-y-auto max-h-[600px] shadow-inner">
            {/* Header section mimicking actual emailShell */}
            <div className="text-center pb-5 mb-5 border-b border-[#f3e8df]">
              <span className="inline-block px-3 py-1 border border-[#f5c2a4] rounded-full text-[10px] text-[#9a3412] font-semibold tracking-wider uppercase mb-3">
                Renu Writes Poem
              </span>
              <p className="text-[10px] uppercase text-[#9a3412] tracking-wider font-bold mb-1">
                Newsletter Update
              </p>
              <h1 className="font-serif text-2xl text-[#431407] leading-tight font-bold">
                {subject || "Your Subject Line Will Appear Here"}
              </h1>
            </div>

            {/* Email Greeting Mock */}
            <p className="text-xs text-stone-500 mb-4 font-semibold italic">
              Hello Reader,
            </p>

            {/* Rendered Live Markdown HTML */}
            <div
              className="text-sm font-sans text-stone-800 space-y-4"
              dangerouslySetInnerHTML={{ __html: renderedPreview }}
            />

            {/* Footer section mimicking emailShell */}
            <div className="mt-8 pt-4 border-t border-[#f3e8df] text-center text-[10px] text-stone-400 leading-normal">
              <p className="mb-1">This email was sent to reader@example.com because you subscribed to updates.</p>
              <div className="space-x-3">
                <span className="text-[#9a3412] font-semibold underline cursor-pointer">Manage Preferences</span>
                <span className="text-stone-400 underline cursor-pointer">Unsubscribe completely</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
