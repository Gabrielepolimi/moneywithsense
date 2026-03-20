export const siteUrl = 'https://moneywithsense.com';

export const ogDefaultImage = {
  url: `${siteUrl}/images/og-default.jpg`,
  width: 1200,
  height: 630,
  alt: 'MoneyWithSense',
} as const;

/** Use default until per-city assets exist in /public/images/cities/ */
export function ogImageForCity(_slug: string) {
  return ogDefaultImage;
}

export const utilityPageRobots = {
  index: false,
  follow: true,
} as const;
