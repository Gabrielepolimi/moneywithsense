import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Financial Disclaimer',
  description: 'Important disclaimer regarding the educational nature of MoneyWithSense content. Not financial advice.',
};

export default function DisclaimerPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-amber-700 text-sm font-semibold uppercase tracking-wider">
              Important Notice
            </span>
          </div>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Financial Disclaimer
          </h1>
          <p className="text-xl text-secondary-600">
            Please read this disclaimer carefully before using our website.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-secondary-600">
            
            {/* Main Disclaimer Box */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 mb-10">
              <h2 className="text-xl font-bold text-amber-900 mt-0 mb-4">Not Financial Advice</h2>
              <p className="text-amber-800 mb-4">
                The content on MoneyWithSense.com is provided for <strong>educational and informational purposes only</strong>. It does not constitute, and should not be construed as:
              </p>
              <ul className="text-amber-800 mb-0">
                <li>Financial advice</li>
                <li>Investment advice</li>
                <li>Tax advice</li>
                <li>Legal advice</li>
                <li>Accounting advice</li>
                <li>A recommendation to buy, sell, or hold any security or financial product</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-secondary-900">General Information Only</h2>
            <p>
              All information on this website is general in nature and does not take into account your personal financial situation, objectives, or needs. The information may not be appropriate for your circumstances.
            </p>
            <p>
              Before making any financial decisions, you should:
            </p>
            <ul>
              <li>Carefully consider your own financial situation and goals</li>
              <li>Consult with a qualified financial advisor, accountant, or other professional</li>
              <li>Conduct your own research and due diligence</li>
              <li>Read all relevant product disclosure statements and terms</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">No Guarantees</h2>
            <p>
              While we strive for accuracy, we make no guarantees regarding:
            </p>
            <ul>
              <li>The completeness, accuracy, reliability, or suitability of any information</li>
              <li>The results or outcomes of any strategies or approaches discussed</li>
              <li>The performance of any investments or financial products mentioned</li>
              <li>Future market conditions or economic outcomes</li>
            </ul>
            <p>
              Past performance is not indicative of future results. All investments carry risk, including the potential loss of principal.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">No Professional Relationship</h2>
            <p>
              Using this website does not create a client, advisory, or professional relationship between you and MoneyWithSense or any of its contributors. We are not licensed financial advisors, investment advisors, tax professionals, or attorneys.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Third-Party Content</h2>
            <p>
              This website may contain:
            </p>
            <ul>
              <li>Links to third-party websites</li>
              <li>References to third-party products or services</li>
              <li>Information from external sources</li>
            </ul>
            <p>
              We do not control, endorse, or guarantee the accuracy of third-party content. You access third-party resources at your own risk.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Affiliate Disclosure</h2>
            <p>
              Some links on this website may be affiliate links. This means we may receive compensation if you click on a link and make a purchase. This compensation may influence which products we write about and where they appear on the site.
            </p>
            <p>
              However, affiliate relationships do not influence our editorial opinions. We only recommend products and services we believe provide value to our readers.
            </p>
            <p>
              <Link href="/affiliate-disclosure" className="text-primary-600 hover:text-primary-700">
                Read our full Affiliate Disclosure →
              </Link>
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Geographic Considerations</h2>
            <p>
              Financial laws, tax regulations, and available products vary by country and jurisdiction. Content on this site may not be applicable to your location. Always verify that information is relevant and legal in your jurisdiction.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Risk Warning</h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 my-6">
              <p className="text-red-800 m-0">
                <strong>⚠️ Risk Warning:</strong> Investing involves risk. The value of investments can go down as well as up, and you may get back less than you invest. Never invest more than you can afford to lose. If you are unsure about any investment decision, seek independent financial advice.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-secondary-900">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, MoneyWithSense and its owners, operators, contributors, and affiliates shall not be liable for any:
            </p>
            <ul>
              <li>Direct, indirect, incidental, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or use</li>
              <li>Any other losses arising from your use of this website or reliance on its content</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">Your Responsibility</h2>
            <p>
              By using this website, you acknowledge that:
            </p>
            <ul>
              <li>You are responsible for your own financial decisions</li>
              <li>You will seek professional advice when appropriate</li>
              <li>You understand and accept the risks involved in financial matters</li>
              <li>You have read and agree to this disclaimer</li>
            </ul>

            <div className="mt-12 pt-8 border-t border-secondary-200">
              <p className="text-sm text-secondary-500">
                Last updated: January 2026. This disclaimer applies to all content on MoneyWithSense.com.
              </p>
              <p className="text-sm text-secondary-500">
                Questions about this disclaimer? <Link href="/contact" className="text-primary-600 hover:text-primary-700">Contact us</Link>.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
