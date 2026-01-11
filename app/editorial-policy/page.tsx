import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Editorial Policy',
  description: 'Learn about MoneyWithSense editorial standards, content creation process, and commitment to accuracy in personal finance education.',
};

export default function EditorialPolicyPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-gradient-to-b from-secondary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
            Editorial Standards
          </span>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Editorial Policy
          </h1>
          <p className="text-xl text-secondary-600">
            Our commitment to accuracy, transparency, and educational value in personal finance content.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-secondary-600">
            
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6 mb-10">
              <p className="text-primary-800 m-0">
                <strong>Our Promise:</strong> Every piece of content on MoneyWithSense is created to educate and empower readers—never to mislead, sell, or promote specific financial products without clear disclosure.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-secondary-900">Content Standards</h2>
            
            <h3 className="text-xl font-semibold text-secondary-900">Accuracy & Fact-Checking</h3>
            <p>
              All content undergoes a rigorous fact-checking process before publication:
            </p>
            <ul>
              <li>Claims are verified against authoritative sources (government agencies, academic research, established financial institutions)</li>
              <li>Statistics and data points include source citations</li>
              <li>Content is reviewed for accuracy by our editorial team</li>
              <li>Articles are updated when information becomes outdated or regulations change</li>
            </ul>

            <h3 className="text-xl font-semibold text-secondary-900">No Financial Advice</h3>
            <p>
              MoneyWithSense provides educational content only. We explicitly do not:
            </p>
            <ul>
              <li>Provide personalized financial, investment, tax, or legal advice</li>
              <li>Recommend specific investment decisions</li>
              <li>Guarantee financial outcomes or returns</li>
              <li>Promise "get rich quick" results</li>
            </ul>
            <p>
              Every article includes appropriate disclaimers. Readers should always consult qualified professionals for decisions affecting their personal finances.
            </p>

            <h3 className="text-xl font-semibold text-secondary-900">Source Quality</h3>
            <p>
              We prioritize high-quality, authoritative sources:
            </p>
            <ul>
              <li><strong>Government sources:</strong> IRS, SEC, Federal Reserve, Consumer Financial Protection Bureau, and equivalent international agencies</li>
              <li><strong>Academic research:</strong> Peer-reviewed studies from reputable institutions</li>
              <li><strong>Established institutions:</strong> Major banks, recognized financial organizations, and industry bodies</li>
              <li><strong>Official data:</strong> Bureau of Labor Statistics, census data, and official economic indicators</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">Content Creation Process</h2>
            
            <div className="bg-secondary-50 rounded-2xl p-6 my-8">
              <ol className="space-y-4 m-0">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                  <div>
                    <strong className="text-secondary-900">Research & Planning</strong>
                    <p className="m-0 text-sm">Topic identified based on reader needs. Primary sources gathered and reviewed.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                  <div>
                    <strong className="text-secondary-900">Drafting</strong>
                    <p className="m-0 text-sm">Content written with focus on clarity, accuracy, and actionable value.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                  <div>
                    <strong className="text-secondary-900">Fact-Checking</strong>
                    <p className="m-0 text-sm">All claims verified against sources. Statistics and data confirmed.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
                  <div>
                    <strong className="text-secondary-900">Editorial Review</strong>
                    <p className="m-0 text-sm">Content reviewed for quality, clarity, compliance, and educational value.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">5</span>
                  <div>
                    <strong className="text-secondary-900">Publication & Updates</strong>
                    <p className="m-0 text-sm">Content published with proper disclosures. Regularly reviewed for accuracy.</p>
                  </div>
                </li>
              </ol>
            </div>

            <h2 className="text-2xl font-bold text-secondary-900">Advertising & Monetization</h2>
            
            <h3 className="text-xl font-semibold text-secondary-900">Advertising Disclosure</h3>
            <p>
              MoneyWithSense may display advertisements. These ads:
            </p>
            <ul>
              <li>Are clearly distinguished from editorial content</li>
              <li>Do not influence our editorial decisions or content recommendations</li>
              <li>Are labeled appropriately when required</li>
            </ul>

            <h3 className="text-xl font-semibold text-secondary-900">Affiliate Relationships</h3>
            <p>
              Some links on our site may be affiliate links. This means:
            </p>
            <ul>
              <li>We may earn a commission if you click and make a purchase</li>
              <li>This does not affect the price you pay</li>
              <li>Affiliate relationships do not influence our recommendations</li>
              <li>We only recommend products/services we believe provide genuine value</li>
              <li>All affiliate relationships are disclosed prominently</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">Corrections Policy</h2>
            <p>
              We take accuracy seriously. If we make an error:
            </p>
            <ul>
              <li>Corrections are made promptly upon discovery</li>
              <li>Significant corrections are noted within the article</li>
              <li>Material errors that affect understanding are addressed transparently</li>
            </ul>
            <p>
              Found an error? <Link href="/contact" className="text-primary-600 hover:text-primary-700">Contact us</Link> and we'll investigate promptly.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Independence</h2>
            <p>
              Our editorial team operates independently:
            </p>
            <ul>
              <li>Advertisers do not have influence over our content</li>
              <li>We do not accept payment for favorable coverage</li>
              <li>Product/service mentions are based on merit and relevance to readers</li>
              <li>Any potential conflicts of interest are disclosed</li>
            </ul>

            <div className="mt-12 pt-8 border-t border-secondary-200">
              <p className="text-sm text-secondary-500">
                Last updated: January 2026. This policy is reviewed and updated periodically to reflect our current practices.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
