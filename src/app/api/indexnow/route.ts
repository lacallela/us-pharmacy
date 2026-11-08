import { NextResponse } from 'next/server';
import { getSiteUrl, INDEXNOW_KEY } from '@/lib/seo';
import { getAllDrugs } from '@/lib/queries';

export async function POST(request: Request) {
  try {
    const siteUrl = getSiteUrl();
    const host = new URL(siteUrl).hostname;

    let urlList: string[] = [];

    try {
      const body = await request.json();
      if (Array.isArray(body?.urls) && body.urls.length > 0) {
        urlList = body.urls;
      }
    } catch {
      // no body, submit all catalog URLs
    }

    if (urlList.length === 0) {
      const drugs = await getAllDrugs();
      urlList = [
        `${siteUrl}/`,
        `${siteUrl}/drugs`,
        `${siteUrl}/quiz`,
        ...drugs.map(d => `${siteUrl}/drugs/${d.slug}`)
      ];
    }

    const payload = {
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`,
      urlList
    };

    // Broadcast to IndexNow API (Bing, Yandex, Seznam, etc.)
    const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const indexNowStatus = indexNowRes.status;

    // Ping Google Sitemaps
    let googlePingStatus = 0;
    try {
      const gRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${siteUrl}/sitemap.xml`)}`);
      googlePingStatus = gRes.status;
    } catch {}

    // Ping Bing Sitemaps
    let bingPingStatus = 0;
    try {
      const bRes = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(`${siteUrl}/sitemap.xml`)}`);
      bingPingStatus = bRes.status;
    } catch {}

    return NextResponse.json({
      success: true,
      submittedUrlsCount: urlList.length,
      indexNowStatus,
      googlePingStatus,
      bingPingStatus,
      message: 'Fast indexing request successfully broadcast to search engines'
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to submit IndexNow request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'IndexNow API Ready',
    key: INDEXNOW_KEY,
    instructions: 'Send POST with optional { urls: [...] } to broadcast instant indexing'
  });
}
