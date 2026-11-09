import fs from 'fs';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const OUT_DIR = 'D:/medtest/us-pharmacy/surge-deploy';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function prepareSurge() {
  console.log('Preparing Surge.sh static mirror...');

  // 1. Fetch homepage
  console.log('Fetching homepage from Vercel origin...');
  const res = await fetch('https://us-pharmacy.vercel.app/');
  let html = await res.text();
  html = html.replaceAll('https://us-pharmacy.vercel.app', 'https://us-pharmacy.surge.sh');
  html = html.replaceAll('us-pharmacy.vercel.app', 'us-pharmacy.surge.sh');

  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html, 'utf-8');
  fs.writeFileSync(path.join(OUT_DIR, '200.html'), html, 'utf-8');
  console.log('Saved index.html and 200.html (SPA Fallback)');

  // 2. Fetch /drugs directory page
  const drugsDir = path.join(OUT_DIR, 'drugs');
  if (!fs.existsSync(drugsDir)) fs.mkdirSync(drugsDir, { recursive: true });
  const drugsRes = await fetch('https://us-pharmacy.vercel.app/drugs');
  let drugsHtml = await drugsRes.text();
  drugsHtml = drugsHtml.replaceAll('https://us-pharmacy.vercel.app', 'https://us-pharmacy.surge.sh');
  drugsHtml = drugsHtml.replaceAll('us-pharmacy.vercel.app', 'us-pharmacy.surge.sh');
  fs.writeFileSync(path.join(drugsDir, 'index.html'), drugsHtml, 'utf-8');
  console.log('Saved drugs/index.html');

  // 3. Copy public assets
  const publicDir = 'D:/medtest/us-pharmacy/public';
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    for (const f of files) {
      fs.copyFileSync(path.join(publicDir, f), path.join(OUT_DIR, f));
    }
    console.log('Copied public assets');
  }

  // 4. Fetch sitemap and rewrite URLs
  const sitemapRes = await fetch('https://us-pharmacy.vercel.app/sitemap.xml');
  let sitemapXml = await sitemapRes.text();
  sitemapXml = sitemapXml.replaceAll('https://us-pharmacy.vercel.app', 'https://us-pharmacy.surge.sh');
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log('Saved sitemap.xml');

  // 4b. Fetch robots.txt and rewrite URLs
  const robotsRes = await fetch('https://us-pharmacy.vercel.app/robots.txt');
  let robotsTxt = await robotsRes.text();
  robotsTxt = robotsTxt.replaceAll('https://us-pharmacy.vercel.app', 'https://us-pharmacy.surge.sh');
  fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), robotsTxt, 'utf-8');
  console.log('Saved robots.txt');

  // 5. CNAME
  fs.writeFileSync(path.join(OUT_DIR, 'CNAME'), 'us-pharmacy.surge.sh', 'utf-8');
  console.log('Saved CNAME: us-pharmacy.surge.sh');

  console.log('Surge build folder ready at:', OUT_DIR);
}

prepareSurge();
