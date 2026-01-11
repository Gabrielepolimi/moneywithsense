import React from 'react';
import Link from 'next/link';

const categories = [
  { label: 'Budgeting', href: '/categories/budgeting', icon: '📊' },
  { label: 'Saving Money', href: '/categories/saving-money', icon: '💰' },
  { label: 'Investing', href: '/categories/investing-basics', icon: '📈' },
  { label: 'Side Hustles', href: '/categories/side-hustles', icon: '🚀' },
  { label: 'Credit & Debt', href: '/categories/credit-debt', icon: '💳' },
];

export default function HeroSection() {
  return (
    <section className="relative bg-hero-pattern overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-100/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-100/20 blur-3xl" />
      </div>

      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 lg:py-24">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse-subtle" />
              Practical money education
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 leading-[1.1] mb-6 animate-slide-up">
              Make smarter
              <br />
              <span className="text-primary-600">money decisions</span>
            </h1>
            
            <p className="text-xl text-secondary-600 leading-relaxed mb-8 max-w-lg animate-slide-up animation-delay-100">
              Clear, actionable personal finance guidance. Learn to save more, budget better, invest wisely, and build multiple income streams.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 animate-slide-up animation-delay-200">
              <Link 
                href="/articles"
                className="inline-flex items-center px-6 py-3.5 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-all shadow-finance hover:shadow-lg group"
              >
                Explore articles
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link 
                href="/guides"
                className="inline-flex items-center px-6 py-3.5 bg-white text-secondary-900 font-medium rounded-full border-2 border-secondary-200 hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                View guides
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-secondary-100 animate-slide-up animation-delay-300">
              <div>
                <div className="text-2xl font-bold text-secondary-900">100+</div>
                <div className="text-sm text-secondary-500">In-depth guides</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary-900">10</div>
                <div className="text-sm text-secondary-500">Topic pillars</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary-900">Free</div>
                <div className="text-sm text-secondary-500">Always accessible</div>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="order-1 lg:order-2 relative animate-fade-in">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 border border-secondary-100 shadow-card">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="max-w-md text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-finance">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    Financial literacy made simple
                  </h3>
                  <p className="text-secondary-600">
                    No jargon, no hype. Just practical advice to help you take control of your money.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-card-hover p-4 hidden sm:flex items-center gap-3 animate-slide-up animation-delay-500">
              <div className="w-12 h-12 bg-finance-savings/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-finance-savings" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-secondary-900">Actionable steps</div>
                <div className="text-sm text-secondary-500">Clear checklists</div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-card-hover p-4 hidden sm:flex items-center gap-3 animate-slide-up animation-delay-300">
              <div className="w-12 h-12 bg-finance-info/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-finance-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-secondary-900">Research-backed</div>
                <div className="text-sm text-secondary-500">Verified sources</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Bar */}
      <div className="relative border-t border-secondary-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-secondary-200 text-sm font-medium text-secondary-700 hover:border-primary-300 hover:text-primary-700 hover:shadow-sm transition-all animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
