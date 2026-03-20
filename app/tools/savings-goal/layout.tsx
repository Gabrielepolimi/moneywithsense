import type { Metadata } from 'next';
import { ogDefaultImage, siteUrl } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'Savings Goal Calculator',
  description: 'Calculate how long it will take to reach your savings goal based on monthly contributions.',
  alternates: { canonical: `${siteUrl}/tools/savings-goal`, languages: { en: `${siteUrl}/tools/savings-goal` } },
  openGraph: {
    title: 'Savings Goal Calculator | MoneyWithSense',
    description: 'Calculate how long it will take to reach your savings goal based on monthly contributions.',
    url: `${siteUrl}/tools/savings-goal`,
    images: [ogDefaultImage],
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogDefaultImage.url],
  },
};

export default function SavingsGoalToolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
