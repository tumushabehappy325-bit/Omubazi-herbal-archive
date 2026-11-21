import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-forest/15 bg-parchment/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-xl tracking-tight text-forest-deep transition group-hover:text-forest sm:text-2xl">
            Omubazi
          </span>
          <span className="hidden font-body text-[10px] uppercase tracking-[0.18em] text-moss sm:inline">
            Herbal archive
          </span>
        </Link>
        <p className="max-w-[14rem] text-right font-body text-[10px] leading-snug text-moss sm:max-w-xs sm:text-xs">
          Southwestern Uganda · demo seed data
        </p>
      </div>
    </header>
  );
}
