# Omubazi

**Omubazi** (Runyankole: *medicine / remedy*) is a digital herbal knowledge archive for Southwestern Uganda. It preserves traditionally documented plant remedies with clear community attribution, then adds a separate AI safety-reasoning layer that surfaces widely known cautions and “who should ask a clinician” guidance — without diagnosing, inventing uses, or recommending dosages.

## Why this is not a health chatbot

Generic health chatbots generate answers from model priors and often blur advice, culture, and clinical authority. Omubazi does the opposite:

1. **Preservation first** — the archive is curated seed entries (plant, local name, traditional use, general preparation, region).
2. **Attribution always visible** — every specimen credits its source line; demo data is labeled as traditional regional knowledge, not fabricated healer interviews.
3. **Two-tier disclosure** — `general` entries share household-level preparation; `gated` entries explicitly say detailed practice requires a healer or health worker.
4. **AI as a safety layer only** — the model retrieves matched entries and writes a short caution note, visually labeled **AI Safety Note**, never mixed into the traditional-knowledge block.

## Demo data & ethics

The entries in `/data/entries.json` are **demo seed data** drawn from commonly documented East African medicinal plants and traditional use patterns. They are **not** transcripts of consented healer interviews.

A real deployment would require community consultation, informed consent, benefit-sharing agreements, and local stewardship of what may be published, gated, or kept offline. This prototype shows the product shape and judgment; it does not claim ethnographic authority.

**Not medical advice.** Always consult qualified health workers for diagnosis and treatment.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (custom herbarium palette & typography)
- Static JSON seed data (no database)
- One API route: `POST /api/ask` → match entries + LLM (or mock) safety note

## Setup

```bash
npm install
cp .env.example .env.local   # optional LLM keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional LLM keys

If none are set, the UI still works: safety notes are **clearly labeled demo mocks**.

| Variable | Provider |
|----------|----------|
| `OPENAI_API_KEY` | OpenAI (or any OpenAI-compatible base via `OPENAI_BASE_URL`) |
| `XAI_API_KEY` | xAI Grok |
| `ANTHROPIC_API_KEY` | Anthropic Claude |

## Demo flow

1. Land on the specimen catalog — browse or search by plant / ailment.
2. Open an entry — read **Traditional knowledge** (attribution + preparation).
3. Scroll to **AI Safety Note** — retrieval + cautions, visually distinct from the archive text.

## Project layout

```
/app
  /page.tsx              Landing / archive catalog
  /entry/[slug]/page.tsx Entry detail
  /api/ask/route.ts      Search + safety-reasoning endpoint
/components              PascalCase React components
/data/entries.json       Demo seed archive
/lib
  types.ts               Shared interfaces
  match-entries.ts       Query matching
  reasoning.ts           LLM prompt + provider calls / mock
```

## License

Prototype for hackathon demonstration. Seed content is illustrative; respect community intellectual property before any production use.
