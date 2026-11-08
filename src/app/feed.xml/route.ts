import { NextResponse } from 'next/server';
import { getAllDrugs, getSiteSettings } from '@/lib/queries';
import { getSiteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = getSiteUrl();
  const drugs = await getAllDrugs();
  const settings = await getSiteSettings();

  const siteName = settings['site_name'] || 'RxMatch US';
  const siteTagline = settings['site_tagline'] || 'Prescription Savings & Telehealth Price Comparison';

  const itemsXml = drugs.map((drug) => {
    const pubDate = drug.created_at ? new Date(drug.created_at).toUTCString() : new Date().toUTCString();
    const url = `${baseUrl}/drugs/${drug.slug}`;
    const savings = Math.round(((drug.brand_price - drug.generic_cash_price) / drug.brand_price) * 100);

    return `    <item>
      <title><![CDATA[${drug.name} (${drug.generic_name}) Coupon — Cash Price $${drug.generic_cash_price.toFixed(2)} (Save ${savings}%)]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${drug.description}. Save up to ${savings}% at CVS, Walgreens, Walmart, and Amazon Pharmacy with free printable discount coupon. Dosage: ${drug.dosage}, Form: ${drug.form}.]]></description>
      <category><![CDATA[${drug.category}]]></category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteName} — ${siteTagline}]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[Real-time prescription drug prices, coupon discounts, and brand vs generic savings across 65,000+ US pharmacies.]]></description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
