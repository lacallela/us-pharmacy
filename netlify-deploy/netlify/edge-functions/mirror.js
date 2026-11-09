export default async function handler(request, context) {
  const url = new URL(request.url);

  // Allow static assets (images, css, js, robots, sitemap, llms) to be served directly from Netlify CDN
  const pathname = url.pathname;
  if (
    pathname.startsWith('/_next/static') ||
    pathname.endsWith('.txt') ||
    pathname.endsWith('.xml') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg')
  ) {
    const staticRes = await context.next();
    if (staticRes.status === 200) {
      return staticRes;
    }
  }

  // Fetch from primary deployment (Vercel)
  const originUrl = new URL(request.url);
  originUrl.hostname = 'us-pharmacy.vercel.app';
  originUrl.protocol = 'https:';
  originUrl.port = '';

  const newHeaders = new Headers(request.headers);
  newHeaders.set('host', 'us-pharmacy.vercel.app');
  newHeaders.set('x-forwarded-host', url.hostname);
  newHeaders.set('x-forwarded-proto', 'https');

  try {
    const originRes = await fetch(originUrl.toString(), {
      method: request.method,
      headers: newHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'manual'
    });

    const resHeaders = new Headers(originRes.headers);

    // If redirect, keep visitor on Netlify mirror
    const location = resHeaders.get('location');
    if (location && location.includes('us-pharmacy.vercel.app')) {
      resHeaders.set('location', location.replaceAll('us-pharmacy.vercel.app', url.hostname));
    }

    resHeaders.set('x-powered-by-mirror', 'Netlify Edge');

    // If HTML or XML or text, rewrite internal links to the Netlify mirror domain
    const contentType = resHeaders.get('content-type') || '';
    if (contentType.includes('text/html') || contentType.includes('application/xml') || contentType.includes('text/plain')) {
      let text = await originRes.text();
      text = text.replaceAll('https://us-pharmacy.vercel.app', `https://${url.hostname}`);
      text = text.replaceAll('us-pharmacy.vercel.app', url.hostname);
      return new Response(text, {
        status: originRes.status,
        headers: resHeaders
      });
    }

    return new Response(originRes.body, {
      status: originRes.status,
      headers: resHeaders
    });
  } catch (err) {
    return new Response('Error connecting to origin: ' + err.message, { status: 502 });
  }
}
