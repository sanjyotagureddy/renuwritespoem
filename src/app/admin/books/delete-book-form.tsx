"use client";

import { deleteBook } from "../actions/book-actions";

export default function DeleteBookForm({ bookId }: { bookId: string }) {
  return (
    <form
      action={deleteBook}
      onSubmit={(e) => {
        if (!confirm("Delete this book permanently?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={bookId} />
      <button
        type="submit"
        className="rounded-lg px-3 py-1.5 text-xs text-rose-400/60 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
      >
        Delete
      </button>
    </form>
  );
}
