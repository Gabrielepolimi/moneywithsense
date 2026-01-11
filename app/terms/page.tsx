import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for MoneyWithSense. Please read these terms carefully before using our website.',
};

export default function TermsPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-gradient-to-b from-secondary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
            Legal
          </span>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-secondary-600">
            Please read these terms carefully before using MoneyWithSense.
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
            
            <h2 className="text-2xl font-bold text-secondary-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and using MoneyWithSense.com (the "Site"), you accept and agree to be bound by these Terms of Service and our <Link href="/privacy" className="text-primary-600 hover:text-primary-700">Privacy Policy</Link>. If you do not agree to these terms, please do not use our Site.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">2. Educational Content Only</h2>
            <p>
              All content on this Site is provided for educational and informational purposes only. As stated in our <Link href="/disclaimer" className="text-primary-600 hover:text-primary-700">Financial Disclaimer</Link>:
            </p>
            <ul>
              <li>Content does not constitute financial, investment, tax, or legal advice</li>
              <li>We are not licensed financial advisors</li>
              <li>You should consult qualified professionals before making financial decisions</li>
              <li>We make no guarantees about outcomes or results</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">3. Use of the Site</h2>
            <p>You agree to use the Site only for lawful purposes. You may not:</p>
            <ul>
              <li>Use the Site in any way that violates applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to any part of the Site</li>
              <li>Interfere with or disrupt the Site's operation</li>
              <li>Transmit malware, viruses, or harmful code</li>
              <li>Scrape, copy, or redistribute content without permission</li>
              <li>Use automated systems to access the Site without authorization</li>
              <li>Impersonate others or misrepresent your affiliation</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">4. Intellectual Property</h2>
            <p>
              All content on this Site—including text, graphics, logos, images, and software—is the property of MoneyWithSense or its content suppliers and is protected by intellectual property laws.
            </p>
            <p>You may:</p>
            <ul>
              <li>View and read content for personal, non-commercial use</li>
              <li>Share links to our content</li>
              <li>Quote brief excerpts with proper attribution and a link to the original</li>
            </ul>
            <p>You may not:</p>
            <ul>
              <li>Copy, reproduce, or redistribute content without permission</li>
              <li>Modify or create derivative works</li>
              <li>Use content for commercial purposes without authorization</li>
              <li>Remove copyright or proprietary notices</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">5. User Submissions</h2>
            <p>
              If you submit content to us (comments, feedback, suggestions), you grant us a non-exclusive, royalty-free, perpetual license to use, modify, and distribute that content. You represent that you own or have rights to any content you submit.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">6. Third-Party Links</h2>
            <p>
              Our Site may contain links to third-party websites. We do not control these sites and are not responsible for their content or practices. Visiting third-party sites is at your own risk.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">7. Affiliate Links and Advertising</h2>
            <p>
              Our Site may contain affiliate links and advertisements. We may receive compensation for clicks or purchases made through these links. See our <Link href="/affiliate-disclosure" className="text-primary-600 hover:text-primary-700">Affiliate Disclosure</Link> for more information.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">8. Disclaimer of Warranties</h2>
            <p>
              THE SITE AND ITS CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              We do not warrant that:
            </p>
            <ul>
              <li>The Site will be uninterrupted or error-free</li>
              <li>Defects will be corrected</li>
              <li>The Site is free of viruses or harmful components</li>
              <li>Content is accurate, complete, or current</li>
            </ul>

            <h2 className="text-2xl font-bold text-secondary-900">9. Limitation of Liability</h2>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, MONEYWITHSENSE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SITE OR RELIANCE ON ITS CONTENT.
            </p>
            <p>
              This includes, but is not limited to, damages for loss of profits, data, or other intangible losses, even if we have been advised of the possibility of such damages.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless MoneyWithSense and its owners, operators, and affiliates from any claims, damages, losses, or expenses arising from your use of the Site or violation of these Terms.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Site. Your continued use of the Site after changes constitutes acceptance of the new Terms.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">12. Termination</h2>
            <p>
              We may terminate or suspend access to the Site immediately, without prior notice, for any reason, including breach of these Terms.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">14. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in effect.
            </p>

            <h2 className="text-2xl font-bold text-secondary-900">15. Contact</h2>
            <p>
              For questions about these Terms, please <Link href="/contact" className="text-primary-600 hover:text-primary-700">contact us</Link>.
            </p>

            <div className="mt-12 pt-8 border-t border-secondary-200">
              <p className="text-sm text-secondary-500">
                These Terms of Service were last updated in January 2026.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
