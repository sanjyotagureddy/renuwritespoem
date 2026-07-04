"use client";

import { deleteSong } from "../actions";

export default function DeleteSongForm({ songId }: { songId: string }) {
  return (
    <form
      action={deleteSong}
      onSubmit={(e) => {
        if (!confirm("Delete this song permanently from database and cloud storage?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={songId} />
      <button
        type="submit"
        className="rounded-lg px-3 py-1.5 text-xs text-rose-400/60 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
      >
        Delete
      </button>
    </form>
  );
}
