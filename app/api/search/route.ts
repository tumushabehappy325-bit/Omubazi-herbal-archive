import { NextResponse } from "next/server";
import entries from "@/data/entries.json";
import { getEntryBySlug, matchEntries } from "@/lib/match-entries";
import { matchEntriesSemantically } from "@/lib/semantic-match";
import type { HerbalEntry } from "@/lib/types";

const herbalEntries = entries as HerbalEntry[];

/**
 * Search with three layers: keyword → fuzzy → semantic (LLM or labeled mock).
 * Keyword/fuzzy run first so the LLM is only called when needed.
 */
export async function POST(request: Request) {
  let body: { query?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) {
    return NextResponse.json(
      { error: "Provide a search query." },
      { status: 400 }
    );
  }

  const local = matchEntries(herbalEntries, query);
  if (local.length > 0) {
    return NextResponse.json({
      matches: local.map(compactMatch),
      layer: "local" as const,
      source: null,
    });
  }

  const semantic = await matchEntriesSemantically(query, herbalEntries);
  const matched = semantic.slugs
    .map((slug) => getEntryBySlug(herbalEntries, slug))
    .filter((entry): entry is HerbalEntry => Boolean(entry));

  return NextResponse.json({
    matches: matched.map(compactMatch),
    layer: "semantic" as const,
    source: semantic.source,
  });
}

function compactMatch(entry: HerbalEntry) {
  return {
    slug: entry.slug,
    plantName: entry.plantName,
    localName: entry.localName,
    ailment: entry.ailment,
  };
}
