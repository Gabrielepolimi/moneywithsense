import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import CookieBanner from '../components/layout/CookieBanner'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { ogDefaultImage, siteUrl } from '../lib/seo'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const siteName = 'MoneyWithSense'
const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MoneyWithSense',
  url: siteUrl,
  description:
    'Cost of living data for 100+ cities worldwide. Free budget tools, city comparisons, and personal finance guides.',
  inLanguage: 'en',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/cities?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MoneyWithSense',
  url: siteUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${siteUrl}/images/og-default.jpg`,
    width: 1200,
    height: 630,
  },
  sameAs: [] as string[],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Practical Money Education for Everyday People`,
    template: `%s | ${siteName}`,
  },
  description:
    'Clear, actionable personal finance education: saving money, budgeting, investing basics, side hustles, and credit management. Practical guidance for a global audience.',
  authors: [{ name: `${siteName} Editorial Team` }],
  manifest: '/manifest.webmanifest',
  keywords:
    'personal finance, saving money, budgeting tips, investing basics, passive income, side hustles, credit score, debt payoff, financial literacy, money management',
  creator: siteName,
  publisher: siteName,
  robots: 'index, follow',
  category: 'Finance',
  classification: 'Personal Finance Education',
  alternates: {
    canonical: siteUrl,
    languages: { en: siteUrl },
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  verification: {
    google: gscVerification || undefined,
  },
  openGraph: {
    title: `${siteName} - Practical Money Education for Everyday People`,
    description: 'Clear, actionable personal finance: save smarter, budget better, invest with confidence.',
    url: siteUrl,
    siteName,
    locale: 'en_US',
    images: [ogDefaultImage],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@moneywithsense',
    title: `${siteName} - Practical Money Education`,
    description: 'Actionable tips to save, budget, invest, and build income.',
    images: [ogDefaultImage.url],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="alternate" type="application/rss+xml" title="MoneyWithSense RSS Feed" href="/feed.xml" />

        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/apple-icon.svg" />

        {gscVerification ? <meta name="google-site-verification" content={gscVerification} /> : null}

        {gaMeasurementId ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaMeasurementId}');
                `,
              }}
            />
          </>
        ) : null}
      </head>
      <body className="font-sans bg-white text-secondary-900 antialiased">
        <Script
          id="jsonld-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <Script
          id="jsonld-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <CookieBanner />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
