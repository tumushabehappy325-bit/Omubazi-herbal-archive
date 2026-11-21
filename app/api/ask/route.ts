import { NextResponse } from "next/server";
import entries from "@/data/entries.json";
import { getEntryBySlug, matchEntries } from "@/lib/match-entries";
import { generateSafetyNote } from "@/lib/reasoning";
import type { HerbalEntry } from "@/lib/types";

const herbalEntries = entries as HerbalEntry[];

export async function POST(request: Request) {
  let body: { query?: string; slug?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";

  if (!query && !slug) {
    return NextResponse.json(
      { error: "Provide a query (ailment or plant) or an entry slug." },
      { status: 400 }
    );
  }

  let matched: HerbalEntry[] = [];

  if (slug) {
    const entry = getEntryBySlug(herbalEntries, slug);
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    matched = [entry];
  } else {
    matched = matchEntries(herbalEntries, query);
  }

  if (matched.length === 0) {
    return NextResponse.json({
      matches: [],
      safetyNote: null,
      message:
        "No archive entries matched that search. Try a plant name (e.g. moringa) or an ailment (e.g. fever).",
    });
  }

  const primary = matched[0];
  const safety = await generateSafetyNote(primary);

  return NextResponse.json({
    matches: matched.map((e) => ({
      slug: e.slug,
      plantName: e.plantName,
      localName: e.localName,
      ailment: e.ailment,
      disclosureTier: e.disclosureTier,
    })),
    primarySlug: primary.slug,
    safetyNote: safety.note,
    safetySource: safety.source,
  });
}
