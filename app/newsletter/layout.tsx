import type { Metadata } from 'next';
import { utilityPageRobots } from '../../lib/seo';

export const metadata: Metadata = {
  robots: utilityPageRobots,
};

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
