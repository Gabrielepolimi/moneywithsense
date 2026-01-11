import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'Affiliate disclosure for MoneyWithSense. Transparency about how we may earn commissions from product recommendations.',
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-gradient-to-b from-secondary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
            Transparency
          </span>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Affiliate Disclosure
          </h1>
          <p className="text-xl text-secondary-600">
            How we maintain editorial independence while earning revenue through affiliate partnerships.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-secondary-600">
            
            {/* Main Disclosure Box */}
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6 mb-10">
              <p className="text-primary-800 m-0">
                <strong>In Short:</strong> Some links on MoneyWithSense are affiliate links. If you click on them and make a purchase, we may earn a commission at no extra cost to you. This helps us keep our content free and independent.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-secondary-900">What Are Affiliate Links?</h2>
            <p>
              Affiliate links are special URLs that track when someone makes a purchase after clicking a link from our site. When you use these links and complete a purchase, the company pays us a small commission—typically 1-10% of the sale price.
            </p>
            <p>
              This is a common way for educational websites to generate revenue while keeping content free for readers.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">How We Use Affiliate Links</h2>
            <p>You may find affiliate links in:</p>
            <ul>
              <li>Product recommendations and reviews</li>
              <li>Resource lists and tool comparisons</li>
              <li>Service provider mentions</li>
              <li>Partner promotions</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">What This Means for You</h2>
            
            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No Extra Cost
                </h3>
                <p className="text-green-800 text-sm m-0">
                  Using our affiliate links doesn't cost you anything extra. The price you pay is the same whether you use our link or go directly to the site.
                </p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Supports Our Work
                </h3>
                <p className="text-green-800 text-sm m-0">
                  Affiliate commissions help us maintain the site, research content, and keep our educational resources free for everyone.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-secondary-900">Our Commitment to Independence</h2>
            <p>
              We take our editorial integrity seriously. Here's how we maintain independence:
            </p>
            <ul>
              <li>
                <strong>Honest recommendations only:</strong> We only recommend products or services we genuinely believe provide value, regardless of commission rates.
              </li>
              <li>
                <strong>No pay-for-placement:</strong> Companies cannot pay to be featured or receive favorable coverage.
              </li>
              <li>
                <strong>Transparent disclosure:</strong> We clearly disclose affiliate relationships where they exist.
              </li>
              <li>
                <strong>Editorial independence:</strong> Our writers and editors are not influenced by affiliate partnerships.
              </li>
              <li>
                <strong>Reader-first approach:</strong> Our primary goal is to help readers make informed decisions, not to maximize affiliate revenue.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">Current Affiliate Relationships</h2>
            <p>
              We may have affiliate relationships with companies in categories including:
            </p>
            <ul>
              <li>Banking and financial services</li>
              <li>Investment platforms and brokerages</li>
              <li>Personal finance software and apps</li>
              <li>Credit cards (we comply with all disclosure requirements)</li>
              <li>Insurance providers</li>
              <li>Educational courses and books</li>
              <li>Productivity and business tools</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">FTC Compliance</h2>
            <p>
              We comply with the Federal Trade Commission (FTC) guidelines on affiliate disclosures. Material connections with advertisers are disclosed as required by law.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">How to Identify Affiliate Links</h2>
            <p>
              We aim to be transparent about affiliate relationships. You may notice:
            </p>
            <ul>
              <li>Disclosure statements at the top of relevant articles</li>
              <li>Notes within product recommendation sections</li>
              <li>This comprehensive disclosure page</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">Not Financial Advice</h2>
            <p>
              Remember: Our content, including product mentions, is for educational purposes only. We are not financial advisors, and our mentions of products or services should not be considered endorsements or recommendations for your specific situation.
            </p>
            <p>
              Always do your own research and consult with qualified professionals before making financial decisions.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Questions?</h2>
            <p>
              If you have questions about our affiliate relationships or this disclosure, please <Link href="/contact" className="text-primary-600 hover:text-primary-700">contact us</Link>.
            </p>

            <div className="mt-12 pt-8 border-t border-secondary-200">
              <p className="text-sm text-secondary-500">
                This Affiliate Disclosure was last updated in January 2026.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
