"use client";

import { deletePoem } from "../actions";

export default function DeletePoemForm({ poemId }: { poemId: string }) {
  return (
    <form
      action={deletePoem}
      onSubmit={(e) => {
        if (!confirm("Delete this poem permanently?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={poemId} />
      <button
        type="submit"
        className="rounded-lg px-3 py-1.5 text-xs text-rose-400/60 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
      >
        Delete
      </button>
    </form>
  );
}
