import { sanityClient } from '../../sanityClient';
import { NextResponse } from 'next/server';

const siteUrl = 'https://moneywithsense.com';

export async function GET() {
  try {
    const posts = await sanityClient.fetch(`
      *[_type == "post" && status == "published" && publishedAt <= $now] | order(publishedAt desc)[0...20] {
        title,
        "slug": slug.current,
        excerpt,
        publishedAt,
        "author": author->name,
        "mainImage": mainImage.asset->url
      }
    `, { now: new Date().toISOString() });

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MoneyWithSense - Personal Finance Education</title>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <link>${siteUrl}</link>
    <description>Practical personal finance education for everyday people. Clear, actionable guidance on saving, budgeting, investing, and building income.</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>en-US</language>
    <category>Finance</category>
    <category>Education</category>
    <image>
      <url>${siteUrl}/images/og-image.jpg</url>
      <title>MoneyWithSense</title>
      <link>${siteUrl}</link>
    </image>
    ${posts.map((post: { title: string; slug: string; excerpt: string; publishedAt: string; author: string; mainImage?: string }) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/articles/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/articles/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <dc:creator><![CDATA[MoneyWithSense Team]]></dc:creator>
      ${post.mainImage ? `<enclosure url="${post.mainImage}" type="image/jpeg" />` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
