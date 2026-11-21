import { fieldSimilarity } from "./fuzzy";
import type { HerbalEntry } from "./types";

const FILLER_WORDS = new Set([
  "what",
  "cures",
  "for",
  "treats",
  "helps",
  "with",
]);

/** Minimum similarity (0–1) for a fuzzy hit to count. */
const FUZZY_THRESHOLD = 0.72;

function searchTerms(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0 && !FILLER_WORDS.has(term));
}

function entryFields(entry: HerbalEntry): string[] {
  return [entry.ailment, entry.plantName, entry.localName].map((f) =>
    f.toLowerCase()
  );
}

function substringMatches(
  entries: HerbalEntry[],
  terms: string[]
): HerbalEntry[] {
  return entries.filter((entry) => {
    const fields = entryFields(entry);
    return terms.every((term) =>
      fields.some((field) => field.includes(term))
    );
  });
}

/**
 * Score an entry as the weakest (min) term similarity across its fields —
 * every query term must land close to something on the specimen card.
 */
function fuzzyScore(entry: HerbalEntry, terms: string[]): number {
  const fields = entryFields(entry);
  let weakest = 1;
  for (const term of terms) {
    let bestForTerm = 0;
    for (const field of fields) {
      bestForTerm = Math.max(bestForTerm, fieldSimilarity(term, field));
    }
    weakest = Math.min(weakest, bestForTerm);
  }
  return weakest;
}

function fuzzyMatches(
  entries: HerbalEntry[],
  terms: string[]
): HerbalEntry[] {
  return entries
    .map((entry) => ({ entry, score: fuzzyScore(entry, terms) }))
    .filter(({ score }) => score >= FUZZY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry);
}

export function matchEntries(
  entries: HerbalEntry[],
  query: string
): HerbalEntry[] {
  const terms = searchTerms(query);
  if (terms.length === 0) return entries;

  const exactish = substringMatches(entries, terms);
  if (exactish.length > 0) return exactish;

  return fuzzyMatches(entries, terms);
}

export function getEntryBySlug(
  entries: HerbalEntry[],
  slug: string
): HerbalEntry | undefined {
  return entries.find((entry) => entry.slug === slug);
}
