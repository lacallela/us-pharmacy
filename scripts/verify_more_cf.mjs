import { ProxyAgent, setGlobalDispatcher, fetch } from 'undici';

const proxyUrl = 'http://127.0.0.1:10809';
setGlobalDispatcher(new ProxyAgent({
  uri: proxyUrl,
  requestTls: { rejectUnauthorized: false }
}));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function verifyMore() {
  const slugs = [
    '/drugs/compounded-semaglutide',
    '/drugs/ozempic',
    '/drugs/sildenafil',
    '/drugs/atorvastatin',
    '/drugs/viagra',
    '/quiz',
    '/compare/viagra-vs-cialis'
  ];

  console.log('Verifying key drug pages on Cloudflare Pages:');
  for (const s of slugs) {
    const url = `https://us-pharmacy.pages.dev${s}`;
    try {
      const res = await fetch(url);
      const text = await res.text();
      console.log(`[${res.status}] ${url} (length: ${text.length}b, hasRxMatch: ${text.includes('RxMatch')})`);
    } catch (e) {
      console.log(`[ERR] ${url}:`, e.message);
    }
  }
}

verifyMore();
