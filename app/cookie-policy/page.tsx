import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'MoneyWithSense cookie policy - how we use cookies and similar technologies.',
};

export default function CookiePolicyPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-gradient-to-b from-secondary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
            Legal
          </span>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Cookie Policy
          </h1>
          <p className="text-xl text-secondary-600">
            How MoneyWithSense uses cookies and similar technologies.
          </p>
          <p className="text-sm text-secondary-500 mt-4">
            Last Updated: January 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-secondary-600">
            
            <h2 className="text-2xl font-bold text-secondary-900">What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">How We Use Cookies</h2>
            <p>
              MoneyWithSense uses cookies for the following purposes:
            </p>

            <h3 className="text-xl font-semibold text-secondary-900">Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies.
            </p>
            <ul>
              <li>Session management</li>
              <li>Security features</li>
              <li>Cookie consent preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-secondary-900">Analytics Cookies</h3>
            <p>
              We use analytics cookies to understand how visitors interact with our website. This helps us improve the site experience.
            </p>
            <ul>
              <li><strong>Google Analytics:</strong> Collects anonymous usage data including pages visited, time on site, and traffic sources.</li>
            </ul>

            <h3 className="text-xl font-semibold text-secondary-900">Advertising Cookies</h3>
            <p>
              These cookies are used to deliver advertisements relevant to you and your interests. They also help limit the number of times you see an ad and measure the effectiveness of advertising campaigns.
            </p>
            <ul>
              <li>Third-party advertising networks</li>
              <li>Retargeting cookies</li>
            </ul>

            <h3 className="text-xl font-semibold text-secondary-900">Functionality Cookies</h3>
            <p>
              These cookies enable enhanced functionality and personalization:
            </p>
            <ul>
              <li>Remembering your preferences</li>
              <li>Newsletter subscription status</li>
              <li>Display settings</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">Third-Party Cookies</h2>
            <p>
              Some cookies on our site are set by third-party services that appear on our pages. We do not control these cookies and recommend reviewing the privacy policies of these third parties:
            </p>
            <ul>
              <li>Google Analytics</li>
              <li>Advertising partners</li>
              <li>Social media platforms (if sharing features are used)</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">Managing Cookies</h2>
            <p>
              You can control and manage cookies in several ways:
            </p>

            <h3 className="text-xl font-semibold text-secondary-900">Browser Settings</h3>
            <p>
              Most browsers allow you to:
            </p>
            <ul>
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies</li>
              <li>Clear all cookies when you close the browser</li>
            </ul>

            <p>
              Note: Blocking or deleting cookies may impact your experience on our site and other websites.
            </p>

            <h3 className="text-xl font-semibold text-secondary-900">Our Cookie Banner</h3>
            <p>
              When you first visit our site, you can accept or decline non-essential cookies through our cookie banner. You can change your preferences at any time by clearing your browser cookies and revisiting the site.
            </p>

            <h3 className="text-xl font-semibold text-secondary-900">Opt-Out Links</h3>
            <ul>
              <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Google Analytics Opt-out</a></li>
              <li><a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Network Advertising Initiative Opt-out</a></li>
              <li><a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Digital Advertising Alliance Opt-out</a></li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated date.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please <Link href="/contact" className="text-primary-600 hover:text-primary-700">contact us</Link>.
            </p>

            <div className="mt-12 pt-8 border-t border-secondary-200">
              <p className="text-sm text-secondary-500">
                Related policies: <Link href="/privacy" className="text-primary-600 hover:text-primary-700">Privacy Policy</Link> | <Link href="/terms" className="text-primary-600 hover:text-primary-700">Terms of Service</Link>
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
