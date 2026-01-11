import Link from 'next/link';
import Image from 'next/image';

interface AuthorBoxProps {
  className?: string;
}

export default function AuthorBox({ className = '' }: AuthorBoxProps) {
  return (
    <div className={`bg-secondary-50 border border-secondary-100 rounded-2xl p-6 md:p-8 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Author Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-secondary-900">
              MoneyWithSense Editorial Team
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
              Verified
            </span>
          </div>
          
          <p className="text-secondary-600 text-sm leading-relaxed mb-4">
            Our editorial team is dedicated to providing accurate, practical, and unbiased personal finance information. 
            All content is thoroughly researched, fact-checked, and reviewed for clarity. We follow strict 
            editorial guidelines to ensure our readers receive trustworthy financial education.
          </p>

          {/* Trust Links */}
          <div className="flex flex-wrap gap-4 text-sm">
            <Link 
              href="/about" 
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About Us
            </Link>
            <Link 
              href="/editorial-policy" 
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Editorial Policy
            </Link>
            <Link 
              href="/sources" 
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Our Sources
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-6 pt-6 border-t border-secondary-200">
        <div className="flex flex-wrap justify-center gap-6 text-xs text-secondary-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Fact-checked content</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Independent editorial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Regular updates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
