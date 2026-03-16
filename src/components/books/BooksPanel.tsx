"use client";

import { FormEvent, useEffect, useState } from "react";

type Book = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

export function BooksPanel() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadBooks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/books");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load books");
      }
      const data = await res.json();
      setBooks(data.books ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load books");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBooks();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create book");
      }
      setTitle("");
      setBooks((prev) => [data.book, ...prev]);
    } catch (err: any) {
      setError(err.message ?? "Failed to create book");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Your books
        </h1>
        <p className="text-sm text-slate-400">
          Create a book to start building a story bible and chapters.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-2 rounded-lg bg-slate-900/80 p-4 shadow-sm ring-1 ring-slate-800 sm:flex-row"
      >
        <input
          type="text"
          placeholder="Book title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={creating || !title.trim()}
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-slate-50 transition hover:bg-indigo-400 disabled:opacity-60"
        >
          {creating ? "Creating..." : "New book"}
        </button>
      </form>

      {error && (
        <div className="rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-2 rounded-lg border border-slate-800 bg-slate-900/70">
        {loading ? (
          <div className="p-4 text-sm text-slate-400">Loading books…</div>
        ) : books.length === 0 ? (
          <div className="p-4 text-sm text-slate-400">
            No books yet. Create your first book above.
          </div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {books.map((book) => (
              <li key={book.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-medium text-slate-50">
                    {book.title}
                  </div>
                  <div className="text-xs text-slate-400">{book.slug}</div>
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200">
                  {book.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

