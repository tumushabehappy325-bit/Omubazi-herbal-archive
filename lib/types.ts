export interface HerbalEntry {
  slug: string;
  plantName: string;
  localName: string;
  ailment: string;
  preparation: string;
  region: string;
  sourceAttribution: string;
  disclosureTier: "general" | "gated";
}

export interface SafetyNoteResult {
  note: string;
  source: "llm" | "mock";
  matchedSlugs: string[];
}

export interface AskRequest {
  query: string;
  slug?: string;
}
