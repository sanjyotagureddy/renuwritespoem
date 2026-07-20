"use client";

import { deleteAudio } from "../actions/audio-actions";

export default function DeleteAudioForm({ audioId }: { audioId: string }) {
  return (
    <form
      action={deleteAudio}
      onSubmit={(e) => {
        if (!confirm("Delete this audio permanently from database and cloud storage?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={audioId} />
      <button
        type="submit"
        className="rounded-lg px-3 py-1.5 text-xs text-rose-400/60 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
      >
        Delete
      </button>
    </form>
  );
}
