"use client";

import { FormEvent, useEffect, useState } from "react";

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  initialQuery = "",
  onSearch,
  placeholder = "Search by ailment or plant name…",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSearch(query.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch"
      role="search"
    >
      <label htmlFor="archive-search" className="sr-only">
        Search the herbal archive
      </label>
      <input
        id="archive-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-forest/25 bg-parchment-dark/40 px-4 py-3 font-body text-sm text-parchment-ink outline-none transition placeholder:text-moss/70 focus:border-forest focus:bg-parchment"
      />
      <button
        type="submit"
        className="shrink-0 bg-forest px-6 py-3 font-body text-sm font-medium tracking-wide text-parchment transition hover:bg-forest-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
      >
        Search archive
      </button>
    </form>
  );
}
