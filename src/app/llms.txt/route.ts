import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'llms.txt');
    const content = fs.readFileSync(filePath, 'utf8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400'
      }
    });
  } catch (err) {
    return new NextResponse('# RxMatch US\nhttps://us-pharmacy.vercel.app\nPrescription savings catalog.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
