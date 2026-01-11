'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  explore: [
    { href: '/articoli', label: 'Articles' },
    { href: '/categoria', label: 'Categories' },
    { href: '/pillars', label: 'Pillars' },
    { href: '/tools', label: 'Tools' },
  ],
  resources: [
    { href: '/about', label: 'About' },
    { href: '/editorial-policy', label: 'Editorial Policy' },
    { href: '/sources', label: 'Sources' },
    { href: '/newsletter', label: 'Newsletter' },
  ],
  support: [
    { href: '/contatti', label: 'Contact' },
    { href: '/supporto', label: 'Support' },
    { href: '/mappa-del-sito', label: 'Sitemap' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/termini', label: 'Terms of Service' },
    { href: '/cookie-policy', label: 'Cookie Policy' },
    { href: '/disclaimer', label: 'Disclaimer' },
  ],
};

const socialLinks = [
  {
    name: 'LinkedIn',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.2 23.5h4.6V7.9H.2v15.6zM8.66 7.9h4.4v2.1h.06c.61-1.15 2.1-2.36 4.33-2.36 4.63 0 5.48 3.04 5.48 7v8.86h-4.6v-7.86c0-1.88-.04-4.3-2.62-4.3-2.62 0-3.02 2.05-3.02 4.16v7.99H8.66V7.9z"/>
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
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/images/icononly.png"
                alt="Money With Sense"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="font-bold text-xl text-gray-900">Money With Sense</span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-sm">
              Practical personal finance for a global audience: save, budget, invest, and grow income with clear, actionable guidance.
            </p>
            <p className="text-gray-500 text-xs leading-relaxed mb-4">
              This content is for informational purposes only. It is not financial advice and does not constitute a recommendation to buy or sell any product or service.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Explore</h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} MoneyWithSense.com — All rights reserved
            </p>
            <div className="flex items-center gap-6">
              <Link 
                href="/mappa-del-sito"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sitemap
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">
                Built for clear, practical personal finance.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
