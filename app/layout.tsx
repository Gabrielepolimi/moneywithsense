import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import CookieBanner from '../components/layout/CookieBanner'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const siteUrl = 'https://moneywithsense.com'
const siteName = 'MoneyWithSense'
const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Practical Money Education for Everyday People`,
    template: `%s | ${siteName}`,
  },
  description: 'Clear, actionable personal finance education: saving money, budgeting, investing basics, side hustles, and credit management. Practical guidance for a global audience.',
  authors: [{ name: `${siteName} Editorial Team` }],
  manifest: '/manifest.webmanifest',
  keywords: 'personal finance, saving money, budgeting tips, investing basics, passive income, side hustles, credit score, debt payoff, financial literacy, money management',
  creator: siteName,
  publisher: siteName,
  robots: 'index, follow',
  category: 'Finance',
  classification: 'Personal Finance Education',
  alternates: { canonical: siteUrl },
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
    images: [
      {
        url: `${siteUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${siteName} - Personal finance education`,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@moneywithsense',
    title: `${siteName} - Practical Money Education`,
    description: 'Actionable tips to save, budget, invest, and build income.',
    images: [`${siteUrl}/images/og-image.jpg`],
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
        
        {/* Favicon - SVG with fallback */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/apple-icon.svg" />
        
        {/* Google Search Console Verification */}
        {gscVerification ? (
          <meta name="google-site-verification" content={gscVerification} />
        ) : null}
        
        {/* Google Analytics (GA4) */}
        {gaMeasurementId ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
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
        
        {/* JSON-LD Schema - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": siteName,
              "url": siteUrl,
              "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/images/logo.svg`
              },
              "description": "Practical personal finance education for everyday people. Clear, actionable guidance on saving, budgeting, investing, and building income.",
              "sameAs": [
                "https://twitter.com/moneywithsense",
                "https://linkedin.com/company/moneywithsense"
              ]
            })
          }}
        />
        
        {/* JSON-LD Schema - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": siteName,
              "url": siteUrl,
              "description": "Practical personal finance education for a global audience.",
              "publisher": {
                "@type": "Organization",
                "name": siteName,
                "logo": {
                  "@type": "ImageObject",
                  "url": `${siteUrl}/images/logo.svg`
                }
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${siteUrl}/articles?search={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className="font-sans bg-white text-secondary-900 antialiased">
        <CookieBanner />
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
