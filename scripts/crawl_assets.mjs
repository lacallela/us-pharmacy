import fs from 'fs';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const OUT_DIR = 'D:/medtest/us-pharmacy/surge-deploy';

async function crawlAndDownloadAssets() {
  console.log('--- Crawling assets from Vercel ---');

  const pages = [
    'https://us-pharmacy.vercel.app/',
    'https://us-pharmacy.vercel.app/drugs',
    'https://us-pharmacy.vercel.app/drugs/ozempic',
    'https://us-pharmacy.vercel.app/drugs/compounded-semaglutide',
    'https://us-pharmacy.vercel.app/compare/viagra-vs-cialis',
    'https://us-pharmacy.vercel.app/quiz'
  ];

  const assetUrls = new Set();

  for (const pageUrl of pages) {
    try {
      console.log('Scanning page:', pageUrl);
      const res = await fetch(pageUrl);
      const html = await res.text();

      // Find all stylesheet hrefs and script srcs
      const hrefMatches = html.matchAll(/href="(\/_next\/static\/[^"]+)"/g);
      for (const m of hrefMatches) assetUrls.add(m[1]);

      const srcMatches = html.matchAll(/src="(\/_next\/static\/[^"]+)"/g);
      for (const m of srcMatches) assetUrls.add(m[1]);

      // Also check any preload links
      const preloadMatches = html.matchAll(/href="(\/_next\/static\/[^"]+)"/g);
      for (const m of preloadMatches) assetUrls.add(m[1]);
    } catch (e) {
      console.error('Error fetching page', pageUrl, e.message);
    }
  }

  console.log('Total unique static assets to download:', assetUrls.size);
  for (const assetPath of assetUrls) {
    console.log('Asset:', assetPath);
  }

  // Also read css content to inline into index.html and 200.html as bulletproof fallback
  let mainCss = '';

  for (const assetPath of assetUrls) {
    const fullRemoteUrl = 'https://us-pharmacy.vercel.app' + assetPath;
    const localPath = path.join(OUT_DIR, assetPath.replace(/^\//, ''));
    const localDir = path.dirname(localPath);

    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    try {
      const res = await fetch(fullRemoteUrl);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(localPath, buffer);
        console.log(`[OK] Saved ${assetPath} (${buffer.length} bytes)`);

        if (assetPath.endsWith('.css')) {
          mainCss += buffer.toString('utf-8') + '\n';
        }
      } else {
        console.error(`[FAIL] ${assetPath} HTTP ${res.status}`);
      }
    } catch (e) {
      console.error(`[ERROR] ${assetPath}:`, e.message);
    }
  }

  // Inline CSS into index.html and 200.html so styling NEVER breaks even if static link is blocked
  if (mainCss.length > 0) {
    console.log(`Inlining ${mainCss.length} bytes of CSS into HTML files...`);
    const styleTag = `<style id="rxmatch-inline-css">${mainCss}</style></head>`;

    const indexHtmlPath = path.join(OUT_DIR, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      let content = fs.readFileSync(indexHtmlPath, 'utf-8');
      if (!content.includes('rxmatch-inline-css')) {
        content = content.replace('</head>', styleTag);
        fs.writeFileSync(indexHtmlPath, content, 'utf-8');
        console.log('Inlined CSS into index.html');
      }
    }

    const fallbackHtmlPath = path.join(OUT_DIR, '200.html');
    if (fs.existsSync(fallbackHtmlPath)) {
      let content = fs.readFileSync(fallbackHtmlPath, 'utf-8');
      if (!content.includes('rxmatch-inline-css')) {
        content = content.replace('</head>', styleTag);
        fs.writeFileSync(fallbackHtmlPath, content, 'utf-8');
        console.log('Inlined CSS into 200.html');
      }
    }

    const drugsHtmlPath = path.join(OUT_DIR, 'drugs', 'index.html');
    if (fs.existsSync(drugsHtmlPath)) {
      let content = fs.readFileSync(drugsHtmlPath, 'utf-8');
      if (!content.includes('rxmatch-inline-css')) {
        content = content.replace('</head>', styleTag);
        fs.writeFileSync(drugsHtmlPath, content, 'utf-8');
        console.log('Inlined CSS into drugs/index.html');
      }
    }
  }

  // Copy local .next/static as additional backup for all chunks
  const localStaticDir = 'D:/medtest/us-pharmacy/.next/static';
  const outStaticDir = path.join(OUT_DIR, '_next', 'static');
  if (fs.existsSync(localStaticDir)) {
    fs.cpSync(localStaticDir, outStaticDir, { recursive: true, force: false });
    console.log('Copied local .next/static chunks as fallback');
  }

  console.log('Done preparing assets!');
}

crawlAndDownloadAssets();
