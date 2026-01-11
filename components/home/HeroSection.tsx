import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative bg-white">
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Practical personal finance
              <br />
              made clear and actionable
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-lg">
              Save smarter, budget better, invest with confidence, and build multiple income streams. Simple, jargon-free guidance for a global audience.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/articles"
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Explore articles
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link 
                href="/pillars"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-medium rounded-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                View pillars
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-gray-100">
              <div>
                <div className="text-2xl font-bold text-gray-900">100+</div>
                <div className="text-sm text-gray-500">Articles & guides</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">40+</div>
                <div className="text-sm text-gray-500">Actionable checklists</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">10</div>
                <div className="text-sm text-gray-500">Pillar hubs</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
              <div className="max-w-md mx-auto text-center p-8">
                <div className="text-5xl mb-4">💡</div>
                <p className="text-xl font-semibold text-gray-900 mb-2">Clear, practical money guidance</p>
                <p className="text-gray-600">
                  Build a steady financial foundation: budgeting that sticks, savings on autopilot, calm investing, and smarter income.
                </p>
              </div>
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Actionable playbooks</div>
                  <div className="text-sm text-gray-500">Short, clear, and tested</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Bar */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: 'Pillars', href: '/pillars', icon: '🏛️' },
              { label: 'Budgeting', href: '/categories/budgeting', icon: '📊' },
              { label: 'Saving Money', href: '/categories/saving-money', icon: '💰' },
              { label: 'Investing Basics', href: '/categories/investing-basics', icon: '📈' },
              { label: 'Side Hustles', href: '/categories/side-hustles', icon: '🚀' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all"
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
