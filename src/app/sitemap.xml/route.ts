import { NextResponse } from 'next/server';
import { getAllDrugs, getAllQuizzes, getCategoriesWithCounts } from '@/lib/queries';
import { getSiteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = getSiteUrl();
  const drugs = await getAllDrugs();
  const quizzes = (await getAllQuizzes()) as any[];
  const categories = await getCategoriesWithCounts();

  const now = new Date().toISOString();

  interface SitemapUrl {
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
    imageTitle?: string;
  }

  const urls: SitemapUrl[] = [
    { loc: `${baseUrl}/`, lastmod: now, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/drugs`, lastmod: now, priority: '0.95', changefreq: 'daily' },
    { loc: `${baseUrl}/quiz`, lastmod: now, priority: '0.90', changefreq: 'weekly' },
  ];

  for (const cat of categories) {
    urls.push({
      loc: `${baseUrl}/drugs?cat=${encodeURIComponent(cat.category)}`,
      lastmod: now,
      priority: '0.85',
      changefreq: 'weekly'
    });
  }

  for (const d of drugs) {
    urls.push({
      loc: `${baseUrl}/drugs/${d.slug}`,
      lastmod: d.created_at ? new Date(d.created_at).toISOString() : now,
      priority: d.is_trending ? '0.90' : '0.85',
      changefreq: 'weekly',
      imageTitle: `${d.name} (${d.generic_name}) Prescription Coupon Card`
    });
  }

  for (const q of quizzes) {
    urls.push({
      loc: `${baseUrl}/quiz/${q.id}`,
      lastmod: now,
      priority: '0.80',
      changefreq: 'monthly'
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map((u) => {
    let entry = `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>`;

    if (u.imageTitle) {
      entry += `
    <image:image>
      <image:loc>${baseUrl}/icon.png</image:loc>
      <image:title>${u.imageTitle}</image:title>
    </image:image>`;
    }

    entry += `\n  </url>`;
    return entry;
  })
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
