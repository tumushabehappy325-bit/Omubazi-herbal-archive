import ArchiveExplorer from "@/components/ArchiveExplorer";
import entries from "@/data/entries.json";
import type { HerbalEntry } from "@/lib/types";

const herbalEntries = entries as HerbalEntry[];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
      <section className="relative max-w-2xl animate-soft-in">
        <svg
          className="absolute -right-4 -top-6 hidden h-28 w-20 text-forest/15 sm:block"
          viewBox="0 0 80 110"
          aria-hidden
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            className="animate-ink-draw"
            strokeDasharray="120"
            d="M40 8c-12 18-22 34-22 52 0 18 10 32 22 36 12-4 22-18 22-36 0-18-10-34-22-52Z"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            d="M40 20v60M40 40c-6 6-10 12-10 18M40 48c6 5 10 11 10 17"
          />
        </svg>

        <p className="font-body text-xs uppercase tracking-[0.22em] text-clay">
          Southwestern Uganda
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-forest-deep sm:text-5xl md:text-6xl">
          Omubazi
        </h1>
        <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-parchment-ink/80 sm:text-lg">
          A field archive of traditional herbal knowledge — preserved with
          attribution, opened with care, and paired with an AI safety layer that
          retrieves and cautions without inventing remedies.
        </p>
      </section>

      <section className="mt-12 sm:mt-16" aria-labelledby="catalog-heading">
        <div className="mb-6 flex items-end justify-between gap-4 field-rule pb-3">
          <h2
            id="catalog-heading"
            className="font-display text-2xl text-forest-deep sm:text-3xl"
          >
            Specimen catalog
          </h2>
          <span className="hidden font-body text-xs text-moss sm:inline">
            Pressed-plant style entries
          </span>
        </div>
        <ArchiveExplorer entries={herbalEntries} />
      </section>
    </div>
  );
}
