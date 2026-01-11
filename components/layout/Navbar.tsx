'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/articles', label: 'Articles' },
  { href: '/categories', label: 'Categories' },
  { href: '/guides', label: 'Guides' },
  { href: '/tools', label: 'Tools' },
  { href: '/about', label: 'About' },
];

const categoryDropdown = [
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
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-secondary-100 shadow-sm' 
        : 'bg-white border-b border-secondary-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-semibold text-lg text-secondary-900 hidden sm:block group-hover:text-primary-600 transition-colors">
              MoneyWithSense
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              link.label === 'Categories' ? (
                <div key={link.href} className="relative">
                  <button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    onBlur={() => setTimeout(() => setIsCategoryOpen(false), 150)}
                    className="px-4 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-full transition-colors flex items-center gap-1"
                  >
                    {link.label}
                    <svg className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isCategoryOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-secondary-100 py-2 animate-fade-in">
                      {categoryDropdown.map((cat) => (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          className="block px-4 py-2.5 text-sm text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 transition-colors"
                        >
                          {cat.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-full transition-colors"
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Newsletter Button */}
            <Link 
              href="/newsletter"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-full hover:bg-primary-700 transition-all shadow-sm hover:shadow-finance"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Subscribe
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-full text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-secondary-100 bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Categories */}
            <div className="pt-4 border-t border-secondary-100">
              <p className="px-4 text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-2">Categories</p>
              <div className="grid grid-cols-2 gap-1">
                {categoryDropdown.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-sm text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 rounded-lg transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Mobile CTA */}
            <div className="pt-4 border-t border-secondary-100 mt-4">
              <Link
                href="/newsletter"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full text-center px-4 py-3.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Subscribe to Newsletter
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
