interface AttributionBadgeProps {
  sourceAttribution: string;
  region?: string;
}

export default function AttributionBadge({
  sourceAttribution,
  region,
}: AttributionBadgeProps) {
  return (
    <aside
      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l-2 border-clay pl-3 text-sm text-forest-deep"
      aria-label="Source attribution"
    >
      <span className="font-medium tracking-wide text-clay">Source</span>
      <span className="font-body text-parchment-ink/85">{sourceAttribution}</span>
      {region ? (
        <span className="w-full text-xs text-moss sm:w-auto sm:before:mr-3 sm:before:content-['·']">
          {region}
        </span>
      ) : null}
    </aside>
  );
}
