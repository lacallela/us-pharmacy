export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Try static assets first if available
    if (env.ASSETS) {
      try {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes.status < 400 && assetRes.headers.get('content-type') && !assetRes.headers.get('content-type').includes('text/html')) {
          return assetRes;
        }
      } catch (e) {
        // Fallback to origin
      }
    }

    // 2. Fetch from primary deployment (Vercel)
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

      // 3. If redirect, rewrite location header to keep visitor on Cloudflare mirror
      const resHeaders = new Headers(originRes.headers);
      const location = resHeaders.get('location');
      if (location && location.includes('us-pharmacy.vercel.app')) {
        resHeaders.set('location', location.replaceAll('us-pharmacy.vercel.app', url.hostname));
      }

      // Add Cloudflare mirror indicator header
      resHeaders.set('x-powered-by-mirror', 'Cloudflare Pages Edge');

      // 4. If HTML, rewrite internal domain links so everything resolves on pages.dev
      const contentType = resHeaders.get('content-type') || '';
      if (contentType.includes('text/html') || contentType.includes('application/xml') || contentType.includes('text/plain')) {
        let text = await originRes.text();
        text = text.replaceAll('https://us-pharmacy.vercel.app', `https://${url.hostname}`);
        text = text.replaceAll('us-pharmacy.vercel.app', url.hostname);
        text = text.replaceAll('https://us-pharmacy.surge.sh', `https://${url.hostname}`);
        text = text.replaceAll('us-pharmacy.surge.sh', url.hostname);
        // Force canonical self-referencing on this exact mirror
        text = text.replace(/<link[^>]*rel=["']canonical["'][^>]*>/gi, `<link rel="canonical" href="https://${url.hostname}${url.pathname}"/>`);
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
};
