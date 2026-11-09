import { ProxyAgent, setGlobalDispatcher, fetch } from 'undici';

const proxyUrl = 'http://127.0.0.1:10809';
setGlobalDispatcher(new ProxyAgent({
  uri: proxyUrl,
  requestTls: { rejectUnauthorized: false }
}));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function verifyNetlify() {
  const baseUrl = 'https://us-pharmacy.netlify.app';

  const testPaths = [
    '/',
    '/drugs',
    '/drugs/compounded-semaglutide',
    '/drugs/ozempic',
    '/drugs/sildenafil',
    '/sitemap.xml',
    '/robots.txt',
    '/llms.txt',
    '/quiz',
    '/compare/viagra-vs-cialis'
  ];

  console.log(`\n=======================================================`);
  console.log(`Testing Netlify Deployment (${baseUrl})...`);
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
        console.log('Internal links point to netlify.app:', text.includes('us-pharmacy.netlify.app'));
      }
    } catch (e) {
      console.log(`[FAIL] ${path}:`, e.message);
    }
  }
}

verifyNetlify();
