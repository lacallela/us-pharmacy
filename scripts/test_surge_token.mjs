import { ProxyAgent, setGlobalDispatcher, fetch } from 'undici';

const proxyUrl = 'http://127.0.0.1:10809';
setGlobalDispatcher(new ProxyAgent({
  uri: proxyUrl,
  requestTls: { rejectUnauthorized: false }
}));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testSurgeToken() {
  const email = 'oliverdabr@gmail.com';
  const testPass = 'RxMatch2026!Surge';
  const auth = 'Basic ' + Buffer.from(email + ':' + testPass).toString('base64');

  try {
    const res = await fetch('https://surge.surge.sh/token', {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ msg: 'login from cli' })
    });

    const status = res.status;
    const text = await res.text();
    console.log('Status:', status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

testSurgeToken();
