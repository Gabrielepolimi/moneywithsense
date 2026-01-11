import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'MoneyWithSense privacy policy - how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-gradient-to-b from-secondary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
            Legal
          </span>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-secondary-600">
            How we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-secondary-500 mt-4">
            Effective Date: January 1, 2026 | Last Updated: January 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-secondary-600">
            
            <p>
              MoneyWithSense ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website MoneyWithSense.com (the "Site").
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-secondary-900">Information You Provide</h3>
            <p>We may collect information you voluntarily provide, including:</p>
            <ul>
              <li><strong>Newsletter subscriptions:</strong> Email address, name, and content preferences</li>
              <li><strong>Contact forms:</strong> Name, email, and message content</li>
              <li><strong>Comments:</strong> Name, email, and comment content (if enabled)</li>
            </ul>

            <h3 className="text-xl font-semibold text-secondary-900">Information Collected Automatically</h3>
            <p>When you visit our Site, we may automatically collect:</p>
            <ul>
              <li><strong>Device information:</strong> Browser type, operating system, device type</li>
              <li><strong>Usage data:</strong> Pages visited, time spent, referral source</li>
              <li><strong>IP address:</strong> General location information</li>
              <li><strong>Cookies:</strong> See our Cookie Policy section below</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Deliver and improve our content and services</li>
              <li>Send newsletters and updates (with your consent)</li>
              <li>Respond to inquiries and provide support</li>
              <li>Analyze site usage and optimize user experience</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and ensure security</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Remember your preferences</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Serve relevant advertisements</li>
              <li>Improve site functionality</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Note that disabling cookies may affect site functionality.
            </p>
            <p>
              <Link href="/cookie-policy" className="text-primary-600 hover:text-primary-700">
                View our full Cookie Policy →
              </Link>
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Third-Party Services</h2>
            <p>We may use third-party services that collect information:</p>
            <ul>
              <li><strong>Analytics:</strong> Google Analytics to understand site usage</li>
              <li><strong>Advertising:</strong> Display advertising networks</li>
              <li><strong>Email:</strong> Newsletter delivery services</li>
              <li><strong>Hosting:</strong> Web hosting and CDN providers</li>
            </ul>
            <p>
              These services have their own privacy policies governing their use of your data.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Data Sharing</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul>
              <li>Service providers who assist our operations</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners with your consent</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">Your Rights</h2>
            <p>Depending on your location, you may have rights to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Opt out of marketing communications</li>
              <li>Object to data processing</li>
              <li>Data portability</li>
            </ul>
            <p>
              To exercise these rights, please <Link href="/contact" className="text-primary-600 hover:text-primary-700">contact us</Link>.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Data Retention</h2>
            <p>
              We retain personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Children's Privacy</h2>
            <p>
              Our Site is not intended for children under 16. We do not knowingly collect personal information from children. If you believe we have collected such information, please contact us immediately.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">International Users</h2>
            <p>
              If you access our Site from outside the United States, your information may be transferred to and processed in the United States or other countries with different data protection laws.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Changes will be posted on this page with an updated effective date. We encourage you to review this policy regularly.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul>
              <li>Email: privacy@moneywithsense.com</li>
              <li>Contact form: <Link href="/contact" className="text-primary-600 hover:text-primary-700">Contact Page</Link></li>
            </ul>

            <div className="mt-12 pt-8 border-t border-secondary-200">
              <p className="text-sm text-secondary-500">
                This Privacy Policy was last updated in January 2026.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
