import HeroSection from '../components/home/HeroSection';
import FeaturedArticles from '../components/home/FeaturedArticles';
import NewsletterSection from '../components/home/NewsletterSection';
import CategoryArticles from '../components/home/CategoryArticles';
import { getPosts } from '../lib/getPosts';

export default async function HomePage() {
  const posts = await getPosts();

  const categories = [
    { name: 'Personal Finance', slug: 'personal-finance', color: 'blue' },
    { name: 'Saving Money', slug: 'saving-money', color: 'green' },
    { name: 'Investing Basics', slug: 'investing-basics', color: 'purple' },
    { name: 'Budgeting', slug: 'budgeting', color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <FeaturedArticles articles={posts} />

      {categories.map((category) => (
        <CategoryArticles
          key={category.slug}
          category={category}
          articles={posts}
        />
      ))}

      <NewsletterSection />
    </div>
  );
}
