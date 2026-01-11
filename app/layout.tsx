import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import '../styles/globals.css'
import CookieBanner from '../components/layout/CookieBanner'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const nunito = Nunito({ 
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

const siteUrl = 'https://moneywithsense.com'
const siteName = 'Money With Sense'
const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${siteName} - Smart Personal Finance Made Simple`,
  description: 'Actionable money tips: saving, budgeting, investing basics, side hustles, and debt management. Clear, practical guidance for a global audience.',
  authors: [{ name: `${siteName} Team` }],
  manifest: '/manifest.webmanifest',
  keywords: 'personal finance,saving money,investing basics,passive income,budgeting,credit,debt,banking,cards,taxes,finance tips,side hustles,money psychology',
  creator: siteName,
  publisher: siteName,
  robots: 'index, follow',
  category: 'Finance',
  classification: 'Personal Finance Blog',
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
    title: `${siteName} - Smart Personal Finance Made Simple`,
    description: 'Straightforward money advice: save, budget, invest, earn more.',
    url: siteUrl,
    siteName,
    locale: 'en_US',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${siteName} - Personal finance tips`,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@moneywithsense',
    title: `${siteName} - Smart Personal Finance Made Simple`,
    description: 'Actionable tips to save, budget, invest, and build income.',
    images: [`${siteUrl}/og-image.jpg`],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="en" className={nunito.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="alternate" type="application/rss+xml" title="Money With Sense RSS Feed" href="/feed.xml" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        
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
        
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": siteName,
              "url": siteUrl,
              "description": "Personal finance guidance that is clear, practical, and global.",
              "publisher": {
                "@type": "Organization",
                "name": siteName,
                "logo": {
                  "@type": "ImageObject",
                  "url": `${siteUrl}/images/icononly.png`
                }
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${siteUrl}/articoli?search={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className="font-nunito bg-white text-gray-800">
        <CookieBanner />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
