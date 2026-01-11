'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/articoli', label: 'Articles' },
  { href: '/categoria', label: 'Categories' },
  { href: '/pillars', label: 'Pillars' },
  { href: '/tools', label: 'Tools' },
  { href: '/about', label: 'About' },
  { href: '/editorial-policy', label: 'Editorial Policy' },
  { href: '/sources', label: 'Sources' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/icononly.png"
              alt="Money With Sense"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
            <span className="font-bold text-xl text-gray-900 hidden sm:block">
              Money With Sense
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  'featured' in link && link.featured
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Newsletter Button */}
            <Link 
              href="/newsletter"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Subscribe
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                  'featured' in link && link.featured
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile CTA */}
            <div className="pt-4 border-t border-gray-100 mt-4">
              <Link
                href="/newsletter"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-4 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Subscribe to the Newsletter
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
