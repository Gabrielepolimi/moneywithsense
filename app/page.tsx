import HeroSection from '../components/home/HeroSection';
import FeaturedArticles from '../components/home/FeaturedArticles';
import NewsletterSection from '../components/home/NewsletterSection';
import CategoryArticles from '../components/home/CategoryArticles';
import { getPosts } from '../lib/getPosts';

// Finance categories with proper colors
const categories = [
  { name: 'Personal Finance', slug: 'personal-finance', color: 'green' },
  { name: 'Saving Money', slug: 'saving-money', color: 'emerald' },
  { name: 'Budgeting', slug: 'budgeting', color: 'blue' },
  { name: 'Investing Basics', slug: 'investing-basics', color: 'purple' },
  { name: 'Side Hustles', slug: 'side-hustles', color: 'teal' },
  { name: 'Credit & Debt', slug: 'credit-debt', color: 'orange' },
];

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <FeaturedArticles articles={posts} />

      {/* Category sections - only show if articles exist */}
      {categories.map((category) => (
        <CategoryArticles
          key={category.slug}
          category={category}
          articles={posts}
        />
      ))}

      {/* Value Proposition Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Why MoneyWithSense?
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              We believe everyone deserves access to clear, practical financial education—without the jargon or sales pitches.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                Clear & Practical
              </h3>
              <p className="text-secondary-600">
                Every article focuses on actionable steps you can implement today. No theory overload.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-accent-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                Research-Backed
              </h3>
              <p className="text-secondary-600">
                Our content references authoritative sources: government data, academic research, and established institutions.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-finance-investment/10 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-finance-investment" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                Global Perspective
              </h3>
              <p className="text-secondary-600">
                Written for a worldwide English-speaking audience with principles that apply across borders.
              </p>
            </div>
          </div>
        </div>
      </section>

      <NewsletterSection />

      {/* Disclaimer Section */}
      <section className="py-8 bg-secondary-100 border-t border-secondary-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-secondary-500">
            <strong className="text-secondary-600">Disclaimer:</strong> The information on MoneyWithSense is for educational purposes only and should not be considered financial advice. 
            Always consult with a qualified financial professional before making financial decisions.
          </p>
        </div>
      </section>
    </div>
  );
}
