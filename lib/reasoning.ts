import type { HerbalEntry, SafetyNoteResult } from "./types";

const SYSTEM_PROMPT = `You are a safety-reasoning assistant for a traditional herbal knowledge archive. You are NOT diagnosing anything and NOT recommending dosages. Given this traditional remedy, provide: (1) any widely-documented interactions or cautions associated with this plant (general knowledge only, cite nothing you aren't confident about), (2) a clear statement on who should consult a health worker before using it (e.g. pregnant women, children, people on specific medications), (3) if you have no reliable caution to add, say so plainly rather than inventing one. Keep this to 3-4 sentences. Never contradict or undermine the traditional knowledge — frame this as an additional safety layer, not a replacement or override.`;

function buildUserPrompt(entry: HerbalEntry): string {
  return `Traditional remedy entry:
- Scientific name: ${entry.plantName}
- Local name: ${entry.localName}
- Traditional use: ${entry.ailment}
- General preparation (not dosing): ${entry.preparation}
- Region: ${entry.region}
- Attribution: ${entry.sourceAttribution}

Write the AI safety note now.`;
}

const MOCK_NOTES: Record<string, string> = {
  "mululuza-bitter-leaf":
    "Bitter leaf is widely discussed in ethnobotanical literature; concentrated preparations may irritate the stomach and are generally avoided in pregnancy without clinical advice. People with known gallbladder disease or who take antimalarial or diabetes medicines should speak with a health worker before combining remedies. This note does not replace the traditional knowledge above — it only flags commonly cited cautions. If no clinician is available, ask the attributed community practitioner about suitability for your situation.",
  "ekigaji-aloe":
    "Aloe gel is commonly used on intact skin; the yellow latex near the leaf skin is a strong laxative and is not for casual internal use. Do not apply to deep wounds without clinical guidance, and people with aloe allergies should avoid it. Pregnant people and young children should check with a health worker before any internal preparation. This is an added safety layer beside the traditional external-use knowledge above.",
  "moringa-oleifera":
    "Moringa leaf as food is broadly considered a nutritious green; concentrated leaf or root extracts are a different matter and may affect blood pressure or blood sugar. People on antihypertensive or diabetes medication, and those who are pregnant, should consult a health worker before using concentrated forms. No widely agreed dangerous interaction is claimed here beyond that general caution. Treat this as context alongside the traditional culinary use described above.",
  "mukuzanyana-warburgia":
    "Warburgia bark preparations are potent and traditionally used with care; overharvesting also threatens wild stands, so community guidance matters. Pregnant people, children, and anyone on prescription medicines for fever or stomach illness should consult a health worker before use. Reliable published interaction lists are limited — absence of a listed warning is not proof of safety. This note sits beside, not above, the traditional knowledge of the healers who steward this plant.",
  "prunus-africana":
    "Prunus africana bark is associated in clinical literature with prostate and urinary complaints; self-dosing bark extracts can interact with hormone-related or urinary medicines. Anyone with diagnosed prostate disease, kidney issues, or who is pregnant should see a health worker rather than self-treating. Detailed preparation remains gated to practitioners for good reason. This safety framing does not override traditional practice — it marks when clinical consultation is prudent.",
  "artemisia-afra":
    "African wormwood teas are traditional for fever and cough; essential-oil-rich plants can be harsh in high amounts and are generally avoided in pregnancy without advice. People already taking antimalarial drugs should ask a clinician before combining herbal and pharmaceutical regimens. Evidence on precise drug interactions is incomplete, so uncertainty is stated plainly here. Use this only as a caution layer next to the traditional entry above.",
  "mukenenene-zanthoxylum":
    "Zanthoxylum root and bark decoctions are strongly bitter and traditionally reserved for short courses; they may unsettle the stomach. Pregnant people, children, and those on antimalarials or anticoagulants should consult a health worker first. High-confidence interaction data is sparse for this species specifically — inventing warnings would be dishonest, so only general potency cautions are given. The traditional knowledge remains the primary cultural record; this is supplemental safety context.",
  "papaya-seeds-carica":
    "Papaya seeds have a long household tradition against intestinal worms; large amounts may irritate the gut and are not a substitute for diagnosed antiparasitic care. Pregnant people and young children should get clinical advice before intentional seed dosing. People with latex-fruit allergies may also react to papaya. This note does not challenge the traditional use — it clarifies who should check with a health worker first.",
};

function mockSafetyNote(entry: HerbalEntry): SafetyNoteResult {
  const note =
    MOCK_NOTES[entry.slug] ??
    `No high-confidence, plant-specific interaction list is asserted here for ${entry.plantName}. As with any herbal preparation, pregnant people, children, and anyone on prescription medication should consult a health worker before use. This mock note appears because no LLM API key is configured — replace it with a live model in deployment. It is an additional safety layer, not a replacement for the traditional knowledge above.`;

  return { note, source: "mock", matchedSlugs: [entry.slug] };
}

async function callOpenAICompatible(
  entry: HerbalEntry,
  apiKey: string,
  baseUrl: string,
  model: string
): Promise<string> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 280,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(entry) },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty LLM response");
  return content;
}

async function callAnthropic(
  entry: HerbalEntry,
  apiKey: string
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
      max_tokens: 280,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(entry) }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content?.find((b) => b.type === "text")?.text?.trim();
  if (!text) throw new Error("Empty Anthropic response");
  return text;
}

/**
 * Generates a short safety-reasoning note for one archive entry.
 * Uses the first available provider key; otherwise returns a labeled mock.
 */
export async function generateSafetyNote(
  entry: HerbalEntry
): Promise<SafetyNoteResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const xaiKey = process.env.XAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  try {
    if (openaiKey) {
      const note = await callOpenAICompatible(
        entry,
        openaiKey,
        process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
        process.env.OPENAI_MODEL || "gpt-4o-mini"
      );
      return { note, source: "llm", matchedSlugs: [entry.slug] };
    }

    if (xaiKey) {
      const note = await callOpenAICompatible(
        entry,
        xaiKey,
        process.env.XAI_BASE_URL || "https://api.x.ai/v1",
        process.env.XAI_MODEL || "grok-2-latest"
      );
      return { note, source: "llm", matchedSlugs: [entry.slug] };
    }

    if (anthropicKey) {
      const note = await callAnthropic(entry, anthropicKey);
      return { note, source: "llm", matchedSlugs: [entry.slug] };
    }
  } catch (error) {
    console.error("LLM safety note failed, falling back to mock:", error);
    const fallback = mockSafetyNote(entry);
    fallback.note = `[Fallback mock — live model unavailable] ${fallback.note}`;
    return fallback;
  }

  return mockSafetyNote(entry);
}

export { SYSTEM_PROMPT };
