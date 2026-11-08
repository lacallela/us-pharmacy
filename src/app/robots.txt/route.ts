import { NextResponse } from 'next/server';

export async function GET() {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /go/

User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /go/

Sitemap: https://rxmatch-us.example.com/sitemap.xml
`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
