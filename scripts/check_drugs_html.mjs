import { ProxyAgent, setGlobalDispatcher, fetch } from 'undici';

const proxyUrl = 'http://127.0.0.1:10809';
setGlobalDispatcher(new ProxyAgent({
  uri: proxyUrl,
  requestTls: { rejectUnauthorized: false }
}));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function check() {
  const res = await fetch('https://us-pharmacy.vercel.app/drugs');
  const html = await res.text();
  const re = /href=["'](\/drugs\/[^"']+)["']/g;
  const links = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    links.push(m[1]);
  }
  console.log('Total drug links found:', links.length);
  console.log('Sample 10:', links.slice(0, 10));

  if (links.length > 0) {
    const testSlug = links[0];
    console.log(`\nTesting on Cloudflare Pages: https://us-pharmacy.pages.dev${testSlug}`);
    const cfRes = await fetch(`https://us-pharmacy.pages.dev${testSlug}`);
    console.log(`Cloudflare Pages Status: ${cfRes.status}`);
  }
}

check();
