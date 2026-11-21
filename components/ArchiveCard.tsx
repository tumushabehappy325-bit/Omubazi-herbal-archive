import Link from "next/link";
import type { HerbalEntry } from "@/lib/types";
import AttributionBadge from "./AttributionBadge";

interface ArchiveCardProps {
  entry: HerbalEntry;
  index?: number;
}

function LeafMark({ index = 0 }: { index?: number }) {
  const rotate = (index % 3) * 8 - 8;
  return (
    <svg
      viewBox="0 0 40 56"
      className="h-12 w-8 text-forest/35"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M20 2C12 14 6 24 6 34c0 10 6 18 14 20 8-2 14-10 14-20C34 24 28 14 20 2Z"
      />
      <path
        fill="none"
        stroke="#f4efe4"
        strokeWidth="1.2"
        d="M20 10v36M20 22c-4 4-6 8-6 12M20 28c4 3 6 7 6 11"
      />
    </svg>
  );
}

export default function ArchiveCard({ entry, index = 0 }: ArchiveCardProps) {
  return (
    <article
      className="specimen-border group relative bg-parchment/80 p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-parchment sm:p-6"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-body text-[10px] uppercase tracking-[0.2em] text-clay">
            Specimen · {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-2 font-display text-xl text-forest-deep sm:text-2xl">
            <Link
              href={`/entry/${entry.slug}`}
              className="outline-none transition-colors hover:text-forest-mist focus-visible:text-clay"
            >
              <em className="not-italic sm:italic">{entry.plantName}</em>
            </Link>
          </h2>
          <p className="mt-1 font-body text-sm text-forest-mist">
            {entry.localName}
          </p>
        </div>
        <LeafMark index={index} />
      </div>

      <p className="mt-4 field-rule pb-4 font-body text-sm leading-relaxed text-parchment-ink/80">
        <span className="font-medium text-forest">Traditionally for: </span>
        {entry.ailment}
      </p>

      <div className="mt-4">
        <AttributionBadge
          sourceAttribution={entry.sourceAttribution}
          region={entry.region}
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span
          className={`font-body text-[10px] uppercase tracking-[0.14em] ${
            entry.disclosureTier === "gated"
              ? "text-clay"
              : "text-forest-mist"
          }`}
        >
          {entry.disclosureTier === "gated"
            ? "Gated detail"
            : "General knowledge"}
        </span>
        <Link
          href={`/entry/${entry.slug}`}
          className="font-body text-sm text-forest underline decoration-forest/30 underline-offset-4 transition hover:decoration-clay hover:text-clay"
        >
          Open entry
        </Link>
      </div>
    </article>
  );
}
