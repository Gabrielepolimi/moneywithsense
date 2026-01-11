import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sources & References',
  description: 'Authoritative sources and references used by MoneyWithSense for personal finance content.',
};

const sources = {
  government: [
    {
      name: 'U.S. Securities and Exchange Commission (SEC)',
      url: 'https://www.sec.gov',
      description: 'Official regulatory information on investing and securities.',
    },
    {
      name: 'Consumer Financial Protection Bureau (CFPB)',
      url: 'https://www.consumerfinance.gov',
      description: 'Consumer protection resources and financial education.',
    },
    {
      name: 'Internal Revenue Service (IRS)',
      url: 'https://www.irs.gov',
      description: 'Tax information, forms, and guidance.',
    },
    {
      name: 'Federal Reserve',
      url: 'https://www.federalreserve.gov',
      description: 'Monetary policy and economic data.',
    },
    {
      name: 'Bureau of Labor Statistics',
      url: 'https://www.bls.gov',
      description: 'Employment, inflation, and economic statistics.',
    },
    {
      name: 'Social Security Administration',
      url: 'https://www.ssa.gov',
      description: 'Retirement and Social Security information.',
    },
  ],
  financial: [
    {
      name: 'FINRA (Financial Industry Regulatory Authority)',
      url: 'https://www.finra.org',
      description: 'Investor education and broker/advisor information.',
    },
    {
      name: 'Investor.gov',
      url: 'https://www.investor.gov',
      description: 'SEC's investor education resources.',
    },
    {
      name: 'MyMoney.gov',
      url: 'https://www.mymoney.gov',
      description: 'U.S. government's financial literacy resource.',
    },
    {
      name: 'Federal Deposit Insurance Corporation (FDIC)',
      url: 'https://www.fdic.gov',
      description: 'Banking information and deposit insurance.',
    },
  ],
  research: [
    {
      name: 'National Bureau of Economic Research (NBER)',
      url: 'https://www.nber.org',
      description: 'Economic research and working papers.',
    },
    {
      name: 'Federal Reserve Economic Data (FRED)',
      url: 'https://fred.stlouisfed.org',
      description: 'Comprehensive economic data and charts.',
    },
    {
      name: 'Pew Research Center',
      url: 'https://www.pewresearch.org',
      description: 'Social and economic trend research.',
    },
  ],
  international: [
    {
      name: 'Bank of England',
      url: 'https://www.bankofengland.co.uk',
      description: 'UK monetary policy and financial stability.',
    },
    {
      name: 'European Central Bank',
      url: 'https://www.ecb.europa.eu',
      description: 'Eurozone monetary policy and economic data.',
    },
    {
      name: 'OECD (Organisation for Economic Co-operation and Development)',
      url: 'https://www.oecd.org',
      description: 'International economic policy and statistics.',
    },
    {
      name: 'World Bank',
      url: 'https://www.worldbank.org',
      description: 'Global development and economic data.',
    },
  ],
};

export default function SourcesPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-secondary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
            Transparency
          </span>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Sources & References
          </h1>
          <p className="text-xl text-secondary-600">
            We reference authoritative, credible sources for our personal finance content. Here are the primary sources we consult.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Our Approach */}
          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6 mb-12">
            <h2 className="text-lg font-semibold text-primary-900 mb-3">Our Sourcing Approach</h2>
            <p className="text-primary-800 mb-0">
              We prioritize primary sources: government agencies, regulatory bodies, academic research, and established financial institutions. 
              When citing data or making claims, we link to the original source whenever possible. 
              We regularly review and update content to ensure accuracy.
            </p>
          </div>

          {/* Government Sources */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl">🏛️</span>
              Government Sources
            </h2>
            <div className="grid gap-4">
              {sources.government.map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-xl border border-secondary-100 p-5 hover:border-primary-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {source.name}
                      </h3>
                      <p className="text-sm text-secondary-600 mt-1">
                        {source.description}
                      </p>
                      <p className="text-xs text-secondary-400 mt-2">{source.url}</p>
                    </div>
                    <svg className="w-5 h-5 text-secondary-400 group-hover:text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Financial Regulators */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-xl">💼</span>
              Financial Education Resources
            </h2>
            <div className="grid gap-4">
              {sources.financial.map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-xl border border-secondary-100 p-5 hover:border-primary-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {source.name}
                      </h3>
                      <p className="text-sm text-secondary-600 mt-1">
                        {source.description}
                      </p>
                      <p className="text-xs text-secondary-400 mt-2">{source.url}</p>
                    </div>
                    <svg className="w-5 h-5 text-secondary-400 group-hover:text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Research */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-xl">📊</span>
              Research & Data
            </h2>
            <div className="grid gap-4">
              {sources.research.map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-xl border border-secondary-100 p-5 hover:border-primary-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {source.name}
                      </h3>
                      <p className="text-sm text-secondary-600 mt-1">
                        {source.description}
                      </p>
                      <p className="text-xs text-secondary-400 mt-2">{source.url}</p>
                    </div>
                    <svg className="w-5 h-5 text-secondary-400 group-hover:text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* International */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-xl">🌍</span>
              International Sources
            </h2>
            <div className="grid gap-4">
              {sources.international.map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-xl border border-secondary-100 p-5 hover:border-primary-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {source.name}
                      </h3>
                      <p className="text-sm text-secondary-600 mt-1">
                        {source.description}
                      </p>
                      <p className="text-xs text-secondary-400 mt-2">{source.url}</p>
                    </div>
                    <svg className="w-5 h-5 text-secondary-400 group-hover:text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Report an Issue */}
          <div className="bg-secondary-50 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">
              Found an inaccuracy?
            </h2>
            <p className="text-secondary-600 mb-6">
              We take accuracy seriously. If you notice any errors or outdated information, please let us know.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-all"
            >
              Report an Issue
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
