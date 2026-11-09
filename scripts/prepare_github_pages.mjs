import fs from 'fs';
import path from 'path';

const SRC_DIR = 'D:/medtest/us-pharmacy/surge-deploy';
const OUT_DIR = 'D:/medtest/us-pharmacy/github-pages-deploy';
const BASE_PATH = '/us-pharmacy';
const GITHUB_ORIGIN = 'https://lacallela.github.io/us-pharmacy';

if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUT_DIR, { recursive: true });

console.log('--- Preparing GitHub Pages Bundle ---');

// 1. Copy all files recursively from SRC_DIR to OUT_DIR (except CNAME)
function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.name === 'CNAME') continue; // GitHub Pages uses lacallela.github.io by default unless custom domain

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursive(SRC_DIR, OUT_DIR);
console.log('Copied base files.');

// 2. Add .nojekyll (CRITICAL: prevents Jekyll from ignoring _next directory)
fs.writeFileSync(path.join(OUT_DIR, '.nojekyll'), '', 'utf-8');
console.log('Added .nojekyll');

// 3. Process all HTML, XML, TXT files to adapt paths for /us-pharmacy
function processTextFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processTextFiles(fullPath);
    } else if (entry.name.endsWith('.html') || entry.name.endsWith('.xml') || entry.name.endsWith('.txt')) {
      let content = fs.readFileSync(fullPath, 'utf-8');

      // Domain rewrites
      content = content.replaceAll('https://us-pharmacy.surge.sh', GITHUB_ORIGIN);
      content = content.replaceAll('https://us-pharmacy.vercel.app', GITHUB_ORIGIN);
      content = content.replaceAll('https://us-pharmacy.pages.dev', GITHUB_ORIGIN);

      if (entry.name.endsWith('.html')) {
        // Rewrite asset paths to include /us-pharmacy base
        content = content.replaceAll('href="/_next/', `href="${BASE_PATH}/_next/`);
        content = content.replaceAll('src="/_next/', `src="${BASE_PATH}/_next/`);
        content = content.replaceAll('href="/drugs', `href="${BASE_PATH}/drugs`);
        content = content.replaceAll('href="/quiz', `href="${BASE_PATH}/quiz`);
        content = content.replaceAll('href="/compare', `href="${BASE_PATH}/compare`);
        content = content.replaceAll('href="/go/', `href="${BASE_PATH}/go/`);
        content = content.replaceAll('href="/sitemap.xml"', `href="${BASE_PATH}/sitemap.xml"`);
        content = content.replaceAll('href="/robots.txt"', `href="${BASE_PATH}/robots.txt"`);
        content = content.replaceAll('href="/feed.xml"', `href="${BASE_PATH}/feed.xml"`);
        content = content.replaceAll('href="/"', `href="${BASE_PATH}/"`);

        // Search Action
        content = content.replaceAll('urlTemplate":"https://lacallela.github.io/us-pharmacy/drugs?q=', `urlTemplate":"${GITHUB_ORIGIN}/drugs?q=`);
      }

      if (entry.name === 'sitemap.xml') {
        // In sitemap, ensure URLs point to https://lacallela.github.io/us-pharmacy/...
        content = content.replaceAll('<loc>https://lacallela.github.io/us-pharmacy/drugs', `<loc>${GITHUB_ORIGIN}/drugs`);
      }

      if (entry.name === 'robots.txt') {
        content = content.replaceAll('Sitemap: https://lacallela.github.io/us-pharmacy/sitemap.xml', `Sitemap: ${GITHUB_ORIGIN}/sitemap.xml`);
      }

      fs.writeFileSync(fullPath, content, 'utf-8');
    }
  }
}

processTextFiles(OUT_DIR);
console.log('Rewritten all internal links and asset paths to /us-pharmacy.');

// 4. Create 404.html (GitHub Pages convention for SPA / missing routes)
const indexHtml = fs.readFileSync(path.join(OUT_DIR, 'index.html'), 'utf-8');
const fallbackHtml = indexHtml.replace('<head>', `<head><script>
(async function() {
  const p = location.pathname;
  if (p && p !== '/us-pharmacy' && p !== '/us-pharmacy/' && p !== '/us-pharmacy/index.html') {
    // If user visited /us-pharmacy/drugs/something that wasn't pre-rendered
    const subRoute = p.replace(/^\\/us-pharmacy/, '');
    try {
      const res = await fetch('https://us-pharmacy.pages.dev' + subRoute + location.search);
      if (res.ok) {
        const text = await res.text();
        document.open();
        document.write(text);
        document.close();
      }
    } catch(e) {}
  }
})();
</script>`);
fs.writeFileSync(path.join(OUT_DIR, '404.html'), fallbackHtml, 'utf-8');
console.log('Generated 404.html with edge fallback.');

console.log('GitHub Pages bundle ready at:', OUT_DIR);
