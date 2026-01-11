interface AffiliateCTAProps {
  title: string;
  description: string;
  ctaLabel?: string;
  href?: string;
  badge?: string;
}

/**
 * Simple affiliate CTA block. Pass tracking URL externally; no IDs hardcoded.
 */
export default function AffiliateCTA({
  title,
  description,
  ctaLabel = 'Learn more',
  href = '#',
  badge,
}: AffiliateCTAProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3">
      {badge ? (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          {badge}
        </span>
      ) : null}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <a
        href={href}
        className="inline-flex w-fit items-center px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
      >
        {ctaLabel}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
      <p className="text-xs text-gray-500">
        Disclosure: We may earn a commission if you buy through this link. We only recommend products we believe add value.
      </p>
    </div>
  );
}
