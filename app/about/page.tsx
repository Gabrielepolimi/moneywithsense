import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about MoneyWithSense — our mission, editorial approach, and commitment to providing clear, practical personal finance education for everyday people.',
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-secondary-50 to-white py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
            About MoneyWithSense
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
            Practical money education for everyday people
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            We believe everyone deserves access to clear, actionable financial knowledge—without the jargon, complexity, or sales pitches.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Mission */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-secondary-900 m-0">Our Mission</h2>
              </div>
              <p className="text-secondary-600 leading-relaxed">
                MoneyWithSense exists to democratize financial literacy. We create content that helps people understand personal finance fundamentals—saving, budgeting, investing basics, credit management, and income building—in plain English.
              </p>
              <p className="text-secondary-600 leading-relaxed">
                We serve a global, English-speaking audience: from young professionals starting their financial journey to families looking to optimize their money habits. Our goal is to empower readers with knowledge they can act on today.
              </p>
            </div>

            {/* What We Cover */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-secondary-900 m-0">What We Cover</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Personal Finance', desc: 'Core concepts and money management fundamentals' },
                  { title: 'Saving Money', desc: 'Strategies to reduce expenses and build savings' },
                  { title: 'Budgeting', desc: 'Practical budgeting methods that actually work' },
                  { title: 'Investing Basics', desc: 'Introduction to stocks, ETFs, and retirement accounts' },
                  { title: 'Credit & Debt', desc: 'Managing credit scores and paying off debt' },
                  { title: 'Side Hustles', desc: 'Ideas and strategies for earning extra income' },
                  { title: 'Banking & Cards', desc: 'Choosing the right accounts and maximizing benefits' },
                  { title: 'Money Psychology', desc: 'Understanding your relationship with money' },
                ].map((item) => (
                  <div key={item.title} className="bg-secondary-50 rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-secondary-600 m-0">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How We Work */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-finance-investment/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-finance-investment" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-secondary-900 m-0">How We Work</h2>
              </div>
              <ul className="space-y-4 list-none p-0">
                {[
                  { title: 'Research-first approach', desc: 'Every article starts with thorough research from authoritative sources—government agencies, academic studies, and established financial institutions.' },
                  { title: 'Plain English writing', desc: 'We avoid jargon and complex terminology. If we must use technical terms, we explain them clearly.' },
                  { title: 'Actionable focus', desc: 'Each piece includes practical steps readers can implement. Theory is useful only when it leads to action.' },
                  { title: 'Regular updates', desc: 'Financial rules change. We review and update content to ensure accuracy and relevance.' },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <strong className="text-secondary-900">{item.title}:</strong>
                      <span className="text-secondary-600"> {item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Editorial Team */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-secondary-900 m-0">The MoneyWithSense Team</h2>
              </div>
              <p className="text-secondary-600 leading-relaxed">
                Our content is created by the MoneyWithSense Editorial Team—writers and editors with backgrounds in finance, economics, and consumer education. We combine expertise with accessibility to make complex topics understandable.
              </p>
              <p className="text-secondary-600 leading-relaxed">
                Every article goes through a multi-step review process: research, drafting, fact-checking, and editorial review. We're committed to accuracy and clarity.
              </p>
            </div>

            {/* Important Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-16">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Important Disclaimer</h3>
                  <p className="text-amber-800 text-sm m-0">
                    MoneyWithSense provides educational content only. We are not financial advisors, and our content should not be considered financial, investment, tax, or legal advice. Always consult qualified professionals for decisions affecting your personal finances. Your financial situation is unique—what works for others may not be right for you.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center bg-secondary-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                Ready to take control of your finances?
              </h3>
              <p className="text-secondary-600 mb-6">
                Explore our guides or subscribe to get weekly insights delivered to your inbox.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/articles"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-all"
                >
                  Browse articles
                </Link>
                <Link 
                  href="/newsletter"
                  className="inline-flex items-center px-6 py-3 bg-white text-secondary-900 font-medium rounded-full border-2 border-secondary-200 hover:border-primary-300 transition-all"
                >
                  Subscribe free
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
