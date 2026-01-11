import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'Complete sitemap for MoneyWithSense - find all our pages, categories, and resources.',
};

const siteLinks = {
  main: [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'All Articles' },
    { href: '/categories', label: 'Categories' },
    { href: '/guides', label: 'Pillar Guides' },
    { href: '/tools', label: 'Financial Tools' },
    { href: '/newsletter', label: 'Newsletter' },
  ],
  categories: [
    { href: '/categories/personal-finance', label: 'Personal Finance' },
    { href: '/categories/saving-money', label: 'Saving Money' },
    { href: '/categories/budgeting', label: 'Budgeting' },
    { href: '/categories/investing-basics', label: 'Investing Basics' },
    { href: '/categories/passive-income', label: 'Passive Income' },
    { href: '/categories/credit-debt', label: 'Credit & Debt' },
    { href: '/categories/banking-cards', label: 'Banking & Cards' },
    { href: '/categories/taxes-tips', label: 'Taxes & Tips' },
    { href: '/categories/side-hustles', label: 'Side Hustles' },
    { href: '/categories/money-psychology', label: 'Money Psychology' },
  ],
  guides: [
    { href: '/guides/personal-finance-guide', label: 'Complete Guide to Personal Finance' },
    { href: '/guides/saving-money-guide', label: 'Saving Money Guide' },
    { href: '/guides/budgeting-guide', label: 'Budgeting That Works' },
    { href: '/guides/investing-basics-guide', label: 'Investing Basics' },
    { href: '/guides/passive-income-guide', label: 'Passive Income Streams' },
    { href: '/guides/credit-debt-guide', label: 'Credit & Debt Management' },
    { href: '/guides/side-hustles-guide', label: 'Side Hustles Guide' },
  ],
  about: [
    { href: '/about', label: 'About Us' },
    { href: '/editorial-policy', label: 'Editorial Policy' },
    { href: '/sources', label: 'Sources & References' },
    { href: '/contact', label: 'Contact' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookie-policy', label: 'Cookie Policy' },
    { href: '/disclaimer', label: 'Financial Disclaimer' },
    { href: '/affiliate-disclosure', label: 'Affiliate Disclosure' },
  ],
};

export default function SitemapPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-secondary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Sitemap
          </h1>
          <p className="text-xl text-secondary-600">
            Find your way around MoneyWithSense
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Main Pages */}
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4 pb-2 border-b border-secondary-200">
                Main Pages
              </h2>
              <ul className="space-y-3">
                {siteLinks.main.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-secondary-600 hover:text-primary-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4 pb-2 border-b border-secondary-200">
                Categories
              </h2>
              <ul className="space-y-3">
                {siteLinks.categories.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-secondary-600 hover:text-primary-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pillar Guides */}
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4 pb-2 border-b border-secondary-200">
                Pillar Guides
              </h2>
              <ul className="space-y-3">
                {siteLinks.guides.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-secondary-600 hover:text-primary-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About & Resources */}
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4 pb-2 border-b border-secondary-200">
                About & Resources
              </h2>
              <ul className="space-y-3">
                {siteLinks.about.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-secondary-600 hover:text-primary-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4 pb-2 border-b border-secondary-200">
                Legal & Policies
              </h2>
              <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {siteLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-secondary-600 hover:text-primary-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* XML Sitemap Link */}
          <div className="mt-12 pt-8 border-t border-secondary-200 text-center">
            <p className="text-sm text-secondary-500">
              Looking for the XML sitemap? 
              <a 
                href="/sitemap.xml" 
                className="text-primary-600 hover:text-primary-700 ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                View sitemap.xml →
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
