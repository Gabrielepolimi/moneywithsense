import type { Metadata } from 'next';
import { utilityPageRobots } from '../../lib/seo';

export const metadata: Metadata = {
  robots: utilityPageRobots,
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
