"use client";

import { useEffect, useMemo, useState } from "react";
import type { HerbalEntry } from "@/lib/types";
import { matchEntries } from "@/lib/match-entries";
import ArchiveCard from "./ArchiveCard";
import SearchBar from "./SearchBar";

interface ArchiveExplorerProps {
  entries: HerbalEntry[];
}

type SemanticState = {
  query: string;
  slugs: string[];
  source: "llm" | "mock";
};

export default function ArchiveExplorer({ entries }: ArchiveExplorerProps) {
  const [query, setQuery] = useState("");
  const [semantic, setSemantic] = useState<SemanticState | null>(null);
  const [semanticLoading, setSemanticLoading] = useState(false);

  const localMatches = useMemo(
    () => matchEntries(entries, query),
    [entries, query]
  );

  const needsSemantic = Boolean(query) && localMatches.length === 0;

  useEffect(() => {
    if (!needsSemantic) {
      setSemantic(null);
      setSemanticLoading(false);
      return;
    }

    const activeQuery = query;
    let cancelled = false;
    setSemanticLoading(true);

    (async () => {
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: activeQuery }),
        });
        if (!res.ok) throw new Error(`search ${res.status}`);
        const data = (await res.json()) as {
          matches?: { slug: string }[];
          layer?: string;
          source?: "llm" | "mock" | null;
        };

        if (cancelled) return;

        // Local layer already covered client-side; keep semantic slugs only.
        if (data.layer === "local") {
          setSemantic(null);
          return;
        }

        setSemantic({
          query: activeQuery,
          slugs: (data.matches ?? []).map((m) => m.slug),
          source: data.source === "llm" ? "llm" : "mock",
        });
      } catch {
        if (!cancelled) {
          setSemantic({ query: activeQuery, slugs: [], source: "mock" });
        }
      } finally {
        if (!cancelled) setSemanticLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, needsSemantic]);

  const semanticMatches = useMemo(() => {
    if (!semantic || semantic.query !== query) return [];
    const bySlug = new Map(entries.map((e) => [e.slug, e]));
    return semantic.slugs
      .map((slug) => bySlug.get(slug))
      .filter((e): e is HerbalEntry => Boolean(e));
  }, [semantic, query, entries]);

  const filtered =
    localMatches.length > 0 ? localMatches : semanticMatches;

  const showEmpty =
    Boolean(query) &&
    !semanticLoading &&
    localMatches.length === 0 &&
    semanticMatches.length === 0;

  const showSemanticLabel =
    Boolean(query) &&
    localMatches.length === 0 &&
    semanticMatches.length > 0 &&
    semantic?.query === query;

  return (
    <div>
      <SearchBar initialQuery={query} onSearch={setQuery} />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-body text-xs uppercase tracking-[0.14em] text-moss">
          {!query
            ? `${entries.length} specimens in the demo archive`
            : semanticLoading
              ? `Reading the archive for “${query}”…`
              : filtered.length > 0
                ? `${filtered.length} match${filtered.length === 1 ? "" : "es"} for “${query}”`
                : `No close match for “${query}”`}
        </p>
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="font-body text-xs text-clay underline underline-offset-2 hover:text-forest"
          >
            Clear search
          </button>
        ) : null}
      </div>

      {showSemanticLabel ? (
        <p className="mt-3 font-body text-[11px] leading-relaxed text-moss/90">
          {semantic?.source === "llm"
            ? "Matched by meaning — live model read the query against the compact specimen index."
            : "Matched by meaning — demo stub (no API key). Same path as live semantic search when a key is set."}
        </p>
      ) : null}

      {semanticLoading ? (
        <p className="mt-10 border border-dashed border-forest/25 bg-parchment-dark/30 px-6 py-8 text-center font-body text-sm leading-relaxed text-moss">
          Holding the pressed-plant trays a moment — checking whether any
          specimen speaks to what you described…
        </p>
      ) : showEmpty ? (
        <div className="mt-10">
          <p className="border border-dashed border-forest/25 bg-parchment-dark/30 px-6 py-8 text-center font-body text-sm leading-relaxed text-moss">
            Nothing in this archive sits close enough to “{query}”. Browse the
            specimen catalog below, or try describing the ailment — fever,
            burns, worms — rather than a plant name.
          </p>
          <ul className="mt-8 grid list-none gap-6 sm:grid-cols-2">
            {entries.map((entry, index) => (
              <li
                key={entry.slug}
                className="animate-fade-up opacity-0"
                style={{
                  animationDelay: `${Math.min(index, 6) * 70}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <ArchiveCard entry={entry} index={index} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="mt-8 grid list-none gap-6 sm:grid-cols-2">
          {(query ? filtered : entries).map((entry, index) => (
            <li
              key={entry.slug}
              className="animate-fade-up opacity-0"
              style={{
                animationDelay: `${Math.min(index, 6) * 70}ms`,
                animationFillMode: "forwards",
              }}
            >
              <ArchiveCard entry={entry} index={index} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
