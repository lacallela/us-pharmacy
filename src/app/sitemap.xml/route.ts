import { NextResponse } from 'next/server';
import { getAllDrugs, getAllQuizzes } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = 'https://rxmatch-us.example.com';
  const drugs = await getAllDrugs();
  const quizzes = (await getAllQuizzes()) as any[];

  let urls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/drugs`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/quiz`, priority: '0.9', changefreq: 'weekly' },
  ];

  for (const d of drugs) {
    urls.push({
      loc: `${baseUrl}/drugs/${d.slug}`,
      priority: '0.8',
      changefreq: 'weekly'
    });
  }

  for (const q of quizzes) {
    urls.push({
      loc: `${baseUrl}/quiz/${q.id}`,
      priority: '0.8',
      changefreq: 'weekly'
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
