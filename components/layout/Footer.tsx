'use client';

import React from 'react';
import Link from 'next/link';

const footerLinks = {
  explore: [
    { href: '/articles', label: 'Articles' },
    { href: '/categories', label: 'Categories' },
    { href: '/guides', label: 'Guides' },
    { href: '/tools', label: 'Tools' },
  ],
  categories: [
    { href: '/categories/personal-finance', label: 'Personal Finance' },
    { href: '/categories/saving-money', label: 'Saving Money' },
    { href: '/categories/budgeting', label: 'Budgeting' },
    { href: '/categories/investing-basics', label: 'Investing Basics' },
    { href: '/categories/side-hustles', label: 'Side Hustles' },
  ],
  resources: [
    { href: '/about', label: 'About Us' },
    { href: '/editorial-policy', label: 'Editorial Policy' },
    { href: '/sources', label: 'Sources & References' },
    { href: '/newsletter', label: 'Newsletter' },
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

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/moneywithsense',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/moneywithsense',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-secondary-900 text-white">
      {/* Financial Disclaimer Banner */}
      <div className="bg-secondary-800 border-b border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-secondary-300 text-xs leading-relaxed text-center max-w-4xl mx-auto">
            <strong className="text-secondary-200">Important:</strong> The content on MoneyWithSense is for educational and informational purposes only. 
            It does not constitute financial advice, investment advice, or any other type of advice. 
            Always consult with a qualified financial professional before making any financial decisions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="font-semibold text-xl text-white">MoneyWithSense</span>
            </Link>
            <p className="text-secondary-400 text-sm leading-relaxed mb-6 max-w-sm">
              Practical personal finance education for everyday people. 
              Clear, actionable guidance on saving, budgeting, investing, and building income.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary-800 text-secondary-400 hover:bg-primary-600 hover:text-white transition-all"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-secondary-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-secondary-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-secondary-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-secondary-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-secondary-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-secondary-500">
              © {new Date().getFullYear()} MoneyWithSense. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link 
                href="/site-map"
                className="text-sm text-secondary-500 hover:text-secondary-300 transition-colors"
              >
                Sitemap
              </Link>
              <span className="text-secondary-700">|</span>
              <span className="text-sm text-secondary-500">
                Made with clarity for your financial journey
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
