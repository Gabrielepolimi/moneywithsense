import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { buildArticleCostOfLivingRedirects } from './lib/articleRedirects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** 301 inverse slug → canonical (alphabetical) for top comparison pairs */
function buildTopCompareRedirects() {
  try {
    const raw = readFileSync(join(__dirname, 'data/top-comparison-pairs.json'), 'utf8');
    const pairs = JSON.parse(raw);
    const redirects = [];
    for (const [a, b] of pairs) {
      const s1 = a < b ? a : b;
      const s2 = a < b ? b : a;
      const destination = `/compare/${s1}-vs-${s2}`;
      const source = `/compare/${s2}-vs-${s1}`;
      if (source !== destination) {
        redirects.push({ source, destination, permanent: true });
      }
    }
    return redirects;
  } catch {
    return [];
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
  // Ottimizzazioni SEO e Performance
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.moneywithsense.com' }],
        destination: 'https://moneywithsense.com/:path*',
        permanent: true,
      },
      ...buildArticleCostOfLivingRedirects(),
      ...buildTopCompareRedirects(),
    ];
  },

  // Headers per sicurezza e performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/feed.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
    ];
  },


}

export default nextConfig
