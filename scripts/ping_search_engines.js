const https = require('https');

const siteUrl = 'https://us-pharmacy.vercel.app';
const indexNowKey = 'rxmatch2026indexnow';

const urlsToPing = [
  `${siteUrl}/`,
  `${siteUrl}/drugs`,
  `${siteUrl}/quiz`,
  `${siteUrl}/llms.txt`,
  `${siteUrl}/feed.xml`,
  `${siteUrl}/sitemap.xml`,
  `${siteUrl}/drugs/lipitor`,
  `${siteUrl}/drugs/atorvastatin`,
  `${siteUrl}/drugs/zoloft`,
  `${siteUrl}/drugs/sertraline`,
  `${siteUrl}/drugs/viagra`,
  `${siteUrl}/drugs/sildenafil`,
  `${siteUrl}/drugs/ozempic`,
  `${siteUrl}/drugs/amoxicillin`,
  `${siteUrl}/drugs/lisinopril`,
  `${siteUrl}/drugs/metformin`,
  `${siteUrl}/drugs/adderall`,
  `${siteUrl}/drugs/synthroid`,
  `${siteUrl}/drugs/lexapro`,
  `${siteUrl}/drugs/omeprazole`,
  `${siteUrl}/drugs/gabapentin`,
  `${siteUrl}/drugs/wegovy`,
  `${siteUrl}/drugs/mounjaro`,
  `${siteUrl}/drugs/cialis`
];

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
  console.log('🚀 Starting Fast Indexing Broadcast for RxMatch US...\n');

  // 1. IndexNow API Submission (Bing, Yandex, Seznam, Naver)
  console.log(`1. Submitting ${urlsToPing.length} URLs to IndexNow API (Bing, Yandex, Microsoft Copilot)...`);
  try {
    const indexNowPayload = JSON.stringify({
      host: 'us-pharmacy.vercel.app',
      key: indexNowKey,
      keyLocation: `${siteUrl}/${indexNowKey}.txt`,
      urlList: urlsToPing
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
