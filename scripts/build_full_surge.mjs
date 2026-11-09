import fs from 'fs';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const OUT_DIR = 'D:/medtest/us-pharmacy/surge-deploy';
const ORIGIN = 'https://us-pharmacy.vercel.app';
const SURGE_DOMAIN = 'https://us-pharmacy.surge.sh';

// Read all URLs from sitemap
const sitemapPath = path.join(OUT_DIR, 'sitemap.xml');
let urls = [];
if (fs.existsSync(sitemapPath)) {
  const xml = fs.readFileSync(sitemapPath, 'utf-8');
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
}

// Extract drug and internal paths
const internalPaths = new Set();
internalPaths.add('/');
internalPaths.add('/drugs');
internalPaths.add('/quiz');

for (const u of urls) {
  try {
    const parsed = new URL(u);
    if (!parsed.search) {
      internalPaths.add(parsed.pathname);
    }
  } catch (e) {}
}

// Add known comparison pages
internalPaths.add('/compare/viagra-vs-cialis');
internalPaths.add('/compare/ozempic-vs-wegovy');
internalPaths.add('/compare/adderall-vs-vyvanse');

console.log(`Found ${internalPaths.size} internal paths to pre-render for Surge.sh`);

// Helper to download with concurrency
async function downloadAll() {
  const paths = Array.from(internalPaths);
  const concurrency = 6;
  let index = 0;
  let successCount = 0;

  async function worker() {
    while (index < paths.length) {
      const p = paths[index++];
      const cleanPath = p.replace(/\/$/, '');
      const remoteUrl = ORIGIN + p;

      // Determine local destination file
      let localFilePath;
      if (cleanPath === '' || cleanPath === '/') {
        localFilePath = path.join(OUT_DIR, 'index.html');
      } else {
        const targetDir = path.join(OUT_DIR, cleanPath.replace(/^\//, ''));
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        localFilePath = path.join(targetDir, 'index.html');
      }

      try {
        const res = await fetch(remoteUrl);
        if (res.ok) {
          let html = await res.text();
          // Rewrite all links and canonical tags
          html = html.replaceAll('https://us-pharmacy.vercel.app', SURGE_DOMAIN);
          html = html.replaceAll('us-pharmacy.vercel.app', 'us-pharmacy.surge.sh');

          // Ensure inline CSS is injected if missing
          const mainCssPath = path.join(OUT_DIR, '_next/static/css/dc359287e0800824.css');
          if (fs.existsSync(mainCssPath) && !html.includes('rxmatch-inline-css')) {
            const mainCss = fs.readFileSync(mainCssPath, 'utf-8');
            html = html.replace('</head>', `<style id="rxmatch-inline-css">${mainCss}</style></head>`);
          }

          fs.writeFileSync(localFilePath, html, 'utf-8');
          successCount++;
          console.log(`[${successCount}/${paths.length}] Saved ${p} -> ${localFilePath}`);
        } else {
          console.error(`[FAIL ${res.status}] ${remoteUrl}`);
        }
      } catch (err) {
        console.error(`[ERR] ${remoteUrl}:`, err.message);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  console.log(`Finished! Successfully pre-rendered ${successCount} pages.`);

  // Also setup affiliate redirect pages for /go/*
  const affiliatePartners = [
    { slug: 'pharmstore', url: 'http://pharm-store.com/?id=924' },
    { slug: 'walmart', url: 'http://pharm-store.com/?id=924' },
    { slug: 'cvs', url: 'http://pharm-store.com/?id=924' },
    { slug: 'walgreens', url: 'http://pharm-store.com/?id=924' },
    { slug: 'amazon', url: 'http://pharm-store.com/?id=924' },
    { slug: 'default', url: 'http://pharm-store.com/?id=924' }
  ];

  for (const part of affiliatePartners) {
    const dir = path.join(OUT_DIR, 'go', part.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const redirectHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting to Pharmacy Discount...</title>
  <meta http-equiv="refresh" content="0; url=${part.url}">
  <script>window.location.replace("${part.url}");</script>
</head>
<body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
  <p>Transferring to verified pharmacy coupon...</p>
  <p><a href="${part.url}">Click here if you are not redirected automatically.</a></p>
</body>
</html>`;
    fs.writeFileSync(path.join(dir, 'index.html'), redirectHtml, 'utf-8');
  }
  console.log('Affiliate redirect stubs generated for /go/*');
}

downloadAll();
