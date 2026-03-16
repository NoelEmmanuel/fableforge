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
        <h1 className="text-2xl font-semibold tracking-tight">Your books</h1>
        <p className="text-sm text-zinc-600">
          Create a book to start building a story bible and chapters.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-2 rounded-lg bg-white p-4 shadow-sm sm:flex-row"
      >
        <input
          type="text"
          placeholder="Book title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
        />
        <button
          type="submit"
          disabled={creating || !title.trim()}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {creating ? "Creating..." : "New book"}
        </button>
      </form>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-2 rounded-lg border border-zinc-200 bg-white">
        {loading ? (
          <div className="p-4 text-sm text-zinc-600">Loading books…</div>
        ) : books.length === 0 ? (
          <div className="p-4 text-sm text-zinc-600">
            No books yet. Create your first book above.
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {books.map((book) => (
              <li key={book.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-medium text-zinc-900">
                    {book.title}
                  </div>
                  <div className="text-xs text-zinc-500">{book.slug}</div>
                </div>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
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

