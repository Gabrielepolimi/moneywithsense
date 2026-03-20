import Link from 'next/link';
import Image from 'next/image';
import { getCityBySlug, countryFlagEmoji, type City } from '../../lib/cities';

const FEATURED_CITY_SLUGS = [
  'new-york',
  'london',
  'tokyo',
  'paris',
  'dubai',
  'singapore',
  'berlin',
  'sydney',
  'toronto',
  'madrid',
  'amsterdam',
  'los-angeles',
] as const;

type EditorialPost = {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset?: { url: string } };
  publishedAt?: string;
  excerpt?: string;
};

type Props = {
  editorialPosts: EditorialPost[];
};

export default function CostOfLivingCategoryPage({ editorialPosts }: Props) {
  const featured = FEATURED_CITY_SLUGS.map((s) => getCityBySlug(s)).filter((c): c is City => Boolean(c));

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-b from-primary-50 to-white py-16 border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2 text-secondary-500">
              <li>
                <Link href="/" className="hover:text-primary-600">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/categories" className="hover:text-primary-600">
                  Categories
                </Link>
              </li>
              <li>/</li>
              <li className="text-secondary-900 font-medium">Cost of Living</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <span className="text-5xl mb-4 block">🌍</span>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">Cost of Living Guides 2026</h1>
            <p className="text-xl text-secondary-600 mb-8">
              Explore our database of 100+ cities with detailed cost breakdowns, salary guides, and city comparisons.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/cities"
                className="inline-flex items-center px-6 py-3 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
              >
                Browse all cities
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center px-6 py-3 rounded-full border-2 border-secondary-200 text-secondary-900 font-medium hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                Compare two cities
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-8">Popular cities</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featured.map((city) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-secondary-200 bg-white p-4 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <span className="text-3xl" aria-hidden>
                  {countryFlagEmoji(city.countryCode)}
                </span>
                <div>
                  <p className="font-semibold text-secondary-900">{city.name}</p>
                  <p className="text-sm text-secondary-500">{city.country}</p>
                  <p className="text-sm text-primary-600 mt-1">
                    ${city.monthlyBudget.single.min.toLocaleString('en-US')}–$
                    {city.monthlyBudget.single.max.toLocaleString('en-US')}/mo
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {editorialPosts.length > 0 && (
        <section className="py-14 bg-secondary-50 border-t border-secondary-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Editorial guides</h2>
            <p className="text-secondary-600 mb-8 max-w-2xl">
              Long-form articles and explainers that complement the live city database.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {editorialPosts.map((post) => (
                <article key={post._id} className="group">
                  <Link href={`/articles/${post.slug.current}`}>
                    <div className="bg-white rounded-2xl border border-secondary-100 overflow-hidden hover:border-primary-200 hover:shadow-card-hover transition-all">
                      <div className="relative aspect-[16/10] overflow-hidden bg-secondary-100">
                        {post.mainImage?.asset?.url ? (
                          <Image
                            src={post.mainImage.asset.url}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center">
                            <span className="text-4xl">🌍</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        {post.publishedAt && (
                          <span className="text-xs text-secondary-400 mb-2 block">{formatDate(post.publishedAt)}</span>
                        )}
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-secondary-500 text-sm line-clamp-2">{post.excerpt || ''}</p>
                        <span className="text-sm font-medium text-primary-600 mt-4 inline-block">Read article →</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 border-t border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Link href="/categories" className="text-primary-600 font-medium hover:underline">
            ← All categories
          </Link>
        </div>
      </section>
    </div>
  );
}
