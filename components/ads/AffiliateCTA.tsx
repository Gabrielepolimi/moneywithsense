import Link from 'next/link';

interface AffiliateCTAProps {
  /** Product or service name */
  productName: string;
  /** Brief description of the product */
  description: string;
  /** CTA button text */
  ctaText?: string;
  /** Link URL - currently placeholder */
  href?: string;
  /** Optional highlight/badge text */
  badge?: string;
  /** Visual style variant */
  variant?: 'default' | 'featured' | 'compact';
  /** Additional CSS classes */
  className?: string;
}

/**
 * AffiliateCTA - Placeholder component for future affiliate product recommendations
 * 
 * Usage:
 * <AffiliateCTA 
 *   productName="High-Yield Savings Account"
 *   description="Earn 4.5% APY on your savings with no minimum balance."
 *   badge="Editor's Pick"
 *   ctaText="Learn More"
 * />
 * 
 * Note: Links are currently placeholders. Update `href` when affiliate partnerships are active.
 */
export default function AffiliateCTA({
  productName,
  description,
  ctaText = 'Learn More',
  href = '#',
  badge,
  variant = 'default',
  className = '',
}: AffiliateCTAProps) {
  
  const isPlaceholder = href === '#';

  if (variant === 'compact') {
    return (
      <div className={`bg-secondary-50 border border-secondary-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {badge && (
              <span className="inline-block text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full mb-1">
                {badge}
              </span>
            )}
            <h4 className="font-semibold text-secondary-900 truncate">{productName}</h4>
            <p className="text-sm text-secondary-600 line-clamp-1">{description}</p>
          </div>
          {isPlaceholder ? (
            <span className="flex-shrink-0 px-4 py-2 bg-secondary-200 text-secondary-500 text-sm font-medium rounded-full cursor-not-allowed">
              Coming Soon
            </span>
          ) : (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex-shrink-0 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-full hover:bg-primary-700 transition-colors"
            >
              {ctaText}
            </Link>
          )}
        </div>
        <p className="mt-2 text-xs text-secondary-400">
          Affiliate link – we may earn a commission at no extra cost to you.
        </p>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className={`bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 rounded-2xl p-6 md:p-8 ${className}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Icon/Image placeholder */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {badge && (
              <span className="inline-block text-xs font-semibold text-primary-700 bg-primary-100 px-3 py-1 rounded-full mb-2">
                ⭐ {badge}
              </span>
            )}
            <h3 className="text-xl font-bold text-secondary-900 mb-2">{productName}</h3>
            <p className="text-secondary-600 mb-4">{description}</p>
            
            {isPlaceholder ? (
              <span className="inline-flex items-center px-5 py-2.5 bg-secondary-200 text-secondary-500 font-medium rounded-full cursor-not-allowed">
                Link Coming Soon
              </span>
            ) : (
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-colors"
              >
                {ctaText}
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            )}
          </div>
        </div>
        
        {/* Disclosure */}
        <div className="mt-6 pt-4 border-t border-primary-100">
          <p className="text-xs text-secondary-500">
            <strong>Disclosure:</strong> This is an affiliate link. We may earn a commission if you sign up through this link, at no extra cost to you. 
            We only recommend products we believe provide value. See our{' '}
            <Link href="/affiliate-disclosure" className="text-primary-600 hover:underline">
              affiliate disclosure
            </Link>{' '}
            for details.
          </p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white border border-secondary-200 rounded-xl p-6 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {badge && (
            <span className="inline-block text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full mb-1">
              {badge}
            </span>
          )}
          <h4 className="font-semibold text-secondary-900 mb-1">{productName}</h4>
          <p className="text-sm text-secondary-600 mb-3">{description}</p>
          
          {isPlaceholder ? (
            <span className="inline-flex items-center px-4 py-2 bg-secondary-100 text-secondary-500 text-sm font-medium rounded-full cursor-not-allowed">
              Coming Soon
            </span>
          ) : (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-full hover:bg-primary-700 transition-colors"
            >
              {ctaText}
              <svg className="ml-1.5 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          )}
        </div>
      </div>
      
      {/* Disclosure */}
      <p className="mt-4 pt-3 border-t border-secondary-100 text-xs text-secondary-400">
        Affiliate link – we may earn a commission at no extra cost to you.{' '}
        <Link href="/affiliate-disclosure" className="text-primary-600 hover:underline">
          Learn more
        </Link>
      </p>
    </div>
  );
}
