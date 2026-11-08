import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/seo';

export async function GET() {
  const baseUrl = getSiteUrl();

  const robots = `# ========================================================
# Robots.txt for RxMatch US (https://us-pharmacy.vercel.app)
# Optimized for Googlebot & Next-Gen AI LLM Search Engines
# ========================================================

# General Web Crawlers
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /go/

# Google Search & Google Images
User-agent: Googlebot
User-agent: Googlebot-Image
User-agent: Googlebot-News
User-agent: Mediapartners-Google
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /go/

# Microsoft Bing & Copilot
User-agent: Bingbot
User-agent: msnbot
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /go/

# OpenAI / ChatGPT
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: OAI-SearchBot
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /go/

# Perplexity AI Search
User-agent: PerplexityBot
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /go/

# Anthropic / Claude
User-agent: ClaudeBot
User-agent: anthropic-ai
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /go/

# Google Gemini / Extended
User-agent: Google-Extended
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /go/

# Apple Intelligence / Safari Search
User-agent: Applebot
User-agent: Applebot-Extended
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /go/

# Common AI Training Crawlers
User-agent: CCBot
User-agent: cohere-ai
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /go/

# Sitemaps & Feeds
Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
}
