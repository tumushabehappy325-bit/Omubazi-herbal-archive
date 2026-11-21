import type { HerbalEntry } from "./types";

export type CompactEntry = Pick<
  HerbalEntry,
  "slug" | "plantName" | "localName" | "ailment"
>;

export interface SemanticMatchResult {
  slugs: string[];
  source: "llm" | "mock";
}

const MATCH_SYSTEM = `You match natural-language queries to a traditional herbal archive.
Return ONLY a JSON array of entry slugs that are a genuine, confident match for the ailment or plant described.
If none are a confident match, return [].
Do not guess loosely — only match if the connection is clear.
No markdown, no commentary — JSON array of strings only.`;

function buildMatchPrompt(query: string, catalog: CompactEntry[]): string {
  return `Given this user query: '${query}', and this list of archive entries: ${JSON.stringify(catalog)}, return the slugs of any entries that are a genuine, confident match for the ailment or plant being described. If none are a confident match, return an empty list. Do not guess loosely — only match if the connection is clear.`;
}

export function toCompactCatalog(entries: HerbalEntry[]): CompactEntry[] {
  return entries.map(({ slug, plantName, localName, ailment }) => ({
    slug,
    plantName,
    localName,
    ailment,
  }));
}

/** Parse a model reply into known archive slugs only. */
export function parseSlugResponse(
  raw: string,
  allowed: Set<string>
): string[] {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return [];

  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as unknown;
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const slugs: string[] = [];
    for (const item of parsed) {
      if (typeof item !== "string") continue;
      const slug = item.trim();
      if (!allowed.has(slug) || seen.has(slug)) continue;
      seen.add(slug);
      slugs.push(slug);
    }
    return slugs;
  } catch {
    return [];
  }
}

/**
 * Demo stub when no LLM key is set — content-word overlap against compact
 * fields only. Labeled as mock so the UI stays honest.
 */
function mockSemanticMatch(
  query: string,
  catalog: CompactEntry[]
): SemanticMatchResult {
  const stop = new Set([
    "a",
    "an",
    "the",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "of",
    "to",
    "in",
    "on",
    "at",
    "by",
    "from",
    "as",
    "or",
    "and",
    "do",
    "does",
    "did",
    "can",
    "could",
    "would",
    "should",
    "will",
    "i",
    "me",
    "my",
    "you",
    "your",
    "it",
    "its",
    "this",
    "that",
    "these",
    "those",
    "what",
    "which",
    "who",
    "whom",
    "how",
    "when",
    "where",
    "why",
    "cure",
    "cures",
    "cured",
    "curing",
    "treat",
    "treats",
    "treated",
    "treating",
    "treatment",
    "remedy",
    "remedies",
    "help",
    "helps",
    "helping",
    "with",
    "for",
    "against",
    "use",
    "used",
    "using",
    "plant",
    "plants",
    "herb",
    "herbs",
    "herbal",
    "medicine",
    "medicinal",
    "please",
    "tell",
    "give",
    "find",
    "show",
    "about",
    "some",
    "any",
    "good",
  ]);

  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !stop.has(t));

  if (terms.length === 0) {
    return { slugs: [], source: "mock" };
  }

  const slugs = catalog
    .filter((entry) => {
      const hay = `${entry.plantName} ${entry.localName} ${entry.ailment}`.toLowerCase();
      return terms.some((term) => hay.includes(term));
    })
    .map((entry) => entry.slug);

  return { slugs, source: "mock" };
}

async function chatOpenAICompatible(
  apiKey: string,
  baseUrl: string,
  model: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 120,
      messages: [
        { role: "system", content: MATCH_SYSTEM },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM semantic match failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty LLM semantic response");
  return content;
}

async function chatAnthropic(
  apiKey: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
      max_tokens: 120,
      system: MATCH_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic semantic match failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content?.find((b) => b.type === "text")?.text?.trim();
  if (!text) throw new Error("Empty Anthropic semantic response");
  return text;
}

/**
 * Third search fallback: semantic match via LLM (or labeled mock).
 * Expects compact catalog only — never full entry objects.
 */
export async function matchEntriesSemantically(
  query: string,
  entries: HerbalEntry[]
): Promise<SemanticMatchResult> {
  const q = query.trim();
  const catalog = toCompactCatalog(entries);
  const allowed = new Set(catalog.map((e) => e.slug));

  if (!q || catalog.length === 0) {
    return { slugs: [], source: "mock" };
  }

  const userPrompt = buildMatchPrompt(q, catalog);
  const openaiKey = process.env.OPENAI_API_KEY;
  const xaiKey = process.env.XAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  try {
    let raw: string | null = null;

    if (openaiKey) {
      raw = await chatOpenAICompatible(
        openaiKey,
        process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
        process.env.OPENAI_MODEL || "gpt-4o-mini",
        userPrompt
      );
    } else if (xaiKey) {
      raw = await chatOpenAICompatible(
        xaiKey,
        process.env.XAI_BASE_URL || "https://api.x.ai/v1",
        process.env.XAI_MODEL || "grok-2-latest",
        userPrompt
      );
    } else if (anthropicKey) {
      raw = await chatAnthropic(anthropicKey, userPrompt);
    }

    if (raw) {
      return { slugs: parseSlugResponse(raw, allowed), source: "llm" };
    }
  } catch (error) {
    console.error("LLM semantic match failed, falling back to mock:", error);
  }

  return mockSemanticMatch(q, catalog);
}
