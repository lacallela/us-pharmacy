import { ProxyAgent, setGlobalDispatcher, fetch } from 'undici';

const proxyUrl = 'http://127.0.0.1:10809';
setGlobalDispatcher(new ProxyAgent({
  uri: proxyUrl,
  requestTls: { rejectUnauthorized: false }
}));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function verifyCloudflareDeployment() {
  const baseUrl = 'https://us-pharmacy.pages.dev';
  const previewUrl = 'https://8210d902.us-pharmacy.pages.dev';

  const testPaths = [
    '/',
    '/drugs',
    '/drugs/semaglutide',
    '/sitemap.xml',
    '/robots.txt',
    '/llms.txt',
    '/api/drugs'
  ];

  console.log(`\n=======================================================`);
  console.log(`Testing Cloudflare Pages Deployment (${baseUrl})...`);
  console.log(`=======================================================`);

  for (const path of testPaths) {
    try {
      const url = `${baseUrl}${path}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const text = await res.text();
      const mirrorHeader = res.headers.get('x-powered-by-mirror');
      console.log(`[${res.status}] ${path} | Size: ${text.length}b | Mirror: ${mirrorHeader}`);
      if (path === '/') {
        console.log('Homepage contains RxMatch:', text.includes('RxMatch') || text.includes('prescription'));
        console.log('Internal links point to pages.dev:', text.includes('us-pharmacy.pages.dev'));
      }
    } catch (e) {
      console.log(`[FAIL] ${path}:`, e.message);
    }
  }

  // Also check preview URL
  console.log(`\nChecking preview URL: ${previewUrl}`);
  try {
    const res = await fetch(previewUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log(`Preview status: ${res.status}`);
  } catch (e) {
    console.log('Preview fail:', e.message);
  }
}

verifyCloudflareDeployment();
