"use client";

import { useState } from "react";
import Image from "next/image";
import { updateAudio } from "../../../audio-actions";

type EditAudioFormProps = {
  track: {
    id: string;
    title: string;
    description: string | null;
    audioUrl: string;
    coverUrl: string | null;
    published: boolean;
  };
};

export default function EditAudioForm({ track }: EditAudioFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const audioFile = formData.get("audioFile") as File | null;
    if (audioFile && audioFile.size > 15 * 1024 * 1024) {
      setError("Audio file size must not exceed 15MB.");
      setLoading(false);
      return;
    }

    try {
      await updateAudio(formData);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred during save.";
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

      <input type="hidden" name="id" value={track.id} />

      <div>
        <label htmlFor="title" className="mb-2 block text-sm text-white/80">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          disabled={loading}
          defaultValue={track.title}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40 disabled:opacity-50"
          placeholder="Audio title"
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
          defaultValue={track.description ?? ""}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40 disabled:opacity-50"
          placeholder="Audio context, lyrics, or notes..."
        />
      </div>

      <div>
        <label htmlFor="audioFile" className="mb-2 block text-sm text-white/80">
          Audio File (.mp3, .wav)
        </label>
        <div className="mb-3 space-y-1.5">
          <audio src={track.audioUrl} controls className="h-8 max-w-full" />
          <p className="text-xs text-white/30">
            Current audio file is active. Upload a new file only if you wish to replace it.
          </p>
        </div>
        <input
          id="audioFile"
          name="audioFile"
          type="file"
          accept="audio/mpeg,audio/wav,audio/mp3"
          disabled={loading}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-xs file:text-white file:transition-colors hover:file:bg-white/20 disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="coverFile" className="mb-2 block text-sm text-white/80">
          Cover Image (Optional)
        </label>
        {track.coverUrl && (
          <div className="mb-3">
            <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-white/10">
              <Image
                src={track.coverUrl}
                alt="Current cover"
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <p className="mt-1 text-xs text-white/30">
              Current cover art. Upload a new file only if you wish to replace it.
            </p>
          </div>
        )}
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
          defaultChecked={track.published}
          className="rounded border-white/20 bg-black/30 text-violet-500 focus:ring-0 focus:ring-offset-0 disabled:opacity-50"
        />
        <span>Publish immediately</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-violet-600 hover:bg-violet-500 active:scale-95 px-6 py-2.5 text-xs font-semibold tracking-wider text-white uppercase transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
