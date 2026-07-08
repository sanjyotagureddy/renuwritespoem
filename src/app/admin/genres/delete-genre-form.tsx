"use client";

import { deleteGenre } from "../genre-actions";

export default function DeleteGenreForm({
  genreId,
  poemCount,
}: {
  genreId: string;
  poemCount: number;
}) {
  return (
    <form
      action={deleteGenre}
      onSubmit={(event) => {
        const message =
          poemCount > 0
            ? `Delete this genre? ${poemCount} poem${poemCount !== 1 ? "s" : ""} will lose this genre label.`
            : "Delete this genre?";
        if (!confirm(message)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={genreId} />
      <button
        type="submit"
        className="rounded-lg px-3 py-1.5 text-xs text-rose-300/70 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
      >
        Delete
      </button>
    </form>
  );
}
