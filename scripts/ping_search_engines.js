const https = require('https');
const { neon } = require('@neondatabase/serverless');

const siteUrl = 'https://us-pharmacy.vercel.app';
const indexNowKey = 'rxmatch2026indexnow';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_LVoi1pZ4zUDY@ep-plain-mud-ba01n8lt-pooler.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require';

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function run() {
  console.log('🚀 Starting Fast Indexing Broadcast for all 101+ medications on RxMatch US...\n');

  const sql = neon(DATABASE_URL);
  const drugs = await sql`SELECT slug FROM drugs ORDER BY id ASC`;
  console.log(`Loaded ${drugs.length} drugs from Neon Database.`);

  const staticUrls = [
    `${siteUrl}/`,
    `${siteUrl}/drugs`,
    `${siteUrl}/quiz`,
    `${siteUrl}/llms.txt`,
    `${siteUrl}/llms-full.txt`,
    `${siteUrl}/feed.xml`,
    `${siteUrl}/sitemap.xml`,
    `${siteUrl}/compare/lipitor-vs-atorvastatin`,
    `${siteUrl}/compare/viagra-vs-sildenafil`,
    `${siteUrl}/compare/cialis-vs-tadalafil`
  ];

  const drugUrls = drugs.map(d => `${siteUrl}/drugs/${d.slug}`);
  const allUrls = [...staticUrls, ...drugUrls];

  console.log(`Total URLs to broadcast: ${allUrls.length}`);

  // 1. IndexNow API Submission (Bing, Yandex, Seznam, Naver, Microsoft Copilot)
  console.log(`\n1. Submitting ${allUrls.length} URLs to IndexNow API...`);
  try {
    const indexNowPayload = JSON.stringify({
      host: 'us-pharmacy.vercel.app',
      key: indexNowKey,
      keyLocation: `${siteUrl}/${indexNowKey}.txt`,
      urlList: allUrls
    });

    const indexNowRes = await fetchUrl('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(indexNowPayload)
      },
      body: indexNowPayload
    });

    console.log(`   ✅ IndexNow Status: ${indexNowRes.status} (200/202 = Successfully Received for Fast Indexing)`);
  } catch (err) {
    console.error('   ❌ IndexNow Error:', err.message);
  }

  // 2. Ping Google Sitemap
  console.log('\n2. Pinging Google Sitemaps API...');
  try {
    const googlePing = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${siteUrl}/sitemap.xml`)}`;
    const gRes = await fetchUrl(googlePing);
    console.log(`   ✅ Google Ping Status: ${gRes.status}`);
  } catch (err) {
    console.error('   ❌ Google Ping Error:', err.message);
  }

  // 3. Ping Bing Sitemap
  console.log('\n3. Pinging Bing Sitemaps API...');
  try {
    const bingPing = `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${siteUrl}/sitemap.xml`)}`;
    const bRes = await fetchUrl(bingPing);
    console.log(`   ✅ Bing Ping Status: ${bRes.status}`);
  } catch (err) {
    console.error('   ❌ Bing Ping Error:', err.message);
  }

  console.log('\n✨ All Search Engine pings completed successfully!');
}

run().catch(console.error);
