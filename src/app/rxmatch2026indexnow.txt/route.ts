import { NextResponse } from 'next/server';
import { INDEXNOW_KEY } from '@/lib/seo';

export async function GET() {
  return new NextResponse(INDEXNOW_KEY, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
}
