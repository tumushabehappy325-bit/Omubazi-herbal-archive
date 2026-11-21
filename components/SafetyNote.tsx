interface SafetyNoteProps {
  note: string;
  source?: "llm" | "mock";
  loading?: boolean;
}

export default function SafetyNote({
  note,
  source = "mock",
  loading = false,
}: SafetyNoteProps) {
  return (
    <section
      className="relative overflow-hidden rounded-sm border border-moss/40 bg-moss-pale/60 px-5 py-5 sm:px-6"
      aria-labelledby="safety-note-heading"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-moss"
        aria-hidden
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          id="safety-note-heading"
          className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-forest-deep"
        >
          AI Safety Note
        </p>
        <span className="rounded-sm border border-moss/50 bg-parchment/70 px-2 py-0.5 font-body text-[10px] uppercase tracking-wider text-moss">
          {source === "llm" ? "Live model" : "Demo mock — no API key"}
        </span>
      </div>
      {loading ? (
        <p className="mt-3 animate-pulse font-body text-sm leading-relaxed text-forest/70">
          Cross-referencing safety context…
        </p>
      ) : (
        <p className="mt-3 font-body text-sm leading-relaxed text-forest-deep/90">
          {note}
        </p>
      )}
      <p className="mt-4 font-body text-xs leading-snug text-moss">
        Separate from traditional knowledge above. Not a diagnosis or dosage
        guide.
      </p>
    </section>
  );
}
