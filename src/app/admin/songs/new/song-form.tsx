"use client";

import { useState } from "react";
import Link from "next/link";
import { createSong } from "../../actions";

export default function NewSongForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const audioFile = formData.get("audioFile") as File;
    if (audioFile && audioFile.size > 15 * 1024 * 1024) {
      setError("Audio file size must not exceed 15MB.");
      setLoading(false);
      return;
    }

    try {
      await createSong(formData);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred during upload.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/15 bg-white/[0.03] p-7">
      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-300">
          ⚠️ {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-2 block text-sm text-white/80">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          disabled={loading}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40 disabled:opacity-50"
          placeholder="Song title"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm text-white/80">
          Description / Details
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          disabled={loading}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40 disabled:opacity-50"
          placeholder="Song context, lyrics, or notes..."
        />
      </div>

      <div>
        <label htmlFor="audioFile" className="mb-2 block text-sm text-white/80">
          Audio File (.mp3, .wav)
        </label>
        <input
          id="audioFile"
          name="audioFile"
          type="file"
          accept="audio/mpeg,audio/wav,audio/mp3"
          required
          disabled={loading}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-xs file:text-white file:transition-colors hover:file:bg-white/20 disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="coverFile" className="mb-2 block text-sm text-white/80">
          Cover Image (Optional)
        </label>
        <input
          id="coverFile"
          name="coverFile"
          type="file"
          accept="image/*"
          disabled={loading}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-xs file:text-white file:transition-colors hover:file:bg-white/20 disabled:opacity-50"
        />
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/75">
        <input
          type="checkbox"
          name="publishNow"
          disabled={loading}
          className="accent-white"
        />
        Publish immediately
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload & Create"}
        </button>
        <Link
          href="/admin/songs"
          className="rounded-full border border-white/15 px-6 py-3 text-xs tracking-[0.18em] text-white/60 uppercase transition-colors hover:border-white/30 hover:text-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
