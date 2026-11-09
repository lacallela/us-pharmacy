const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

const localDbPath = path.join(__dirname, '..', 'data', 'us_rx.db').replace(/\\/g, '/');
const db = createClient({ url: `file:${localDbPath}` });
const siteUrl = 'https://us-pharmacy.vercel.app';
const accessToken = 'a74a3a738c695087e69d866ed0a7536f69e6a301dcdd25911117f81131a4';

function postToTelegraph(payload) {
  const payloadPath = path.join(__dirname, 'temp_telegraph_payload.json');
  fs.writeFileSync(payloadPath, JSON.stringify(payload), 'utf8');

  try {
    const cmd = `curl.exe -s -x http://127.0.0.1:10809 -H "Content-Type: application/json" -d @"${payloadPath}" https://api.telegra.ph/createPage`;
    const output = execSync(cmd).toString();
    const parsed = JSON.parse(output);
    return parsed;
  } finally {
    if (fs.existsSync(payloadPath)) fs.unlinkSync(payloadPath);
  }
}

async function run() {
  console.log('🚀 Publishing high-impact articles to Telegra.ph (DA 91)...\n');

  const drugsRes = await db.execute('SELECT * FROM drugs ORDER BY is_trending DESC, clicks_count DESC');
  const drugs = drugsRes.rows;

  const published = [];

  // ==========================================
  // ARTICLE 1: Complete 2026 Healthcare Savings Guide
  // ==========================================
  console.log('1. Publishing Article 1: National Healthcare Savings Guide...');
  const article1Payload = {
    access_token: accessToken,
    title: 'How to Save Up to 90% on US Prescription Drugs (2026 Cash Guide)',
    author_name: 'RxMatch Clinical & Price Research',
    author_url: siteUrl,
    content: [
      {
        tag: 'p',
        children: [
          'High deductibles and rising pharmacy copays leave millions of Americans searching for affordable prescription alternatives. The ',
          { tag: 'a', attrs: { href: `${siteUrl}` }, children: ['RxMatch US Prescription Savings Portal'] },
          ' provides verified cash prices and free digital discount coupons across 65,000+ US retail pharmacies.'
        ]
      },
      {
        tag: 'h3',
        children: ['Universal Digital Discount Voucher Credentials']
      },
      {
        tag: 'p',
        children: [
          'Present these digital credentials at any CVS, Walgreens, Walmart, Kroger, or Rite Aid pharmacy to receive direct discount rates without insurance: ',
          { tag: 'b', children: ['BIN: 015995 • PCN: GDC • Group: RXMATCH'] }
        ]
      },
      {
        tag: 'h3',
        children: ['Interactive Tools & Knowledge Base']
      },
      {
        tag: 'ul',
        children: [
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/drugs` }, children: ['FDA Prescription Medication Directory (101 Positions)'] },
              ' — Comprehensive cash prices and savings rates.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/quiz` }, children: ['Interactive Rx Savings Screener Quiz'] },
              ' — Match your condition to the cheapest pharmacy in 60 seconds.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/compare/viagra-vs-sildenafil` }, children: ['Viagra vs Generic Sildenafil Price Analysis'] }
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/compare/lipitor-vs-atorvastatin` }, children: ['Lipitor vs Atorvastatin Statin Savings'] }
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/sitemap.xml` }, children: ['Live XML Sitemap for Search Crawlers'] }
            ]
          }
        ]
      },
      {
        tag: 'h3',
        children: ['Top Prescribed Brand vs Generic Price Comparisons']
      },
      {
        tag: 'ul',
        children: drugs.slice(0, 20).map(d => ({
          tag: 'li',
          children: [
            { tag: 'a', attrs: { href: `${siteUrl}/drugs/${d.slug}` }, children: [d.name] },
            ` (${d.generic_name}) — ${d.category}. Brand: $${d.brand_price.toFixed(2)} vs Generic Cash: $${d.generic_cash_price.toFixed(2)}`
          ]
        }))
      }
    ]
  };

  const res1 = postToTelegraph(article1Payload);
  if (res1.ok && res1.result && res1.result.url) {
    console.log('   ✅ Published:', res1.result.url);
    published.push(res1.result.url);
  } else {
    console.log('   ❌ Error 1:', res1);
  }

  // ==========================================
  // ARTICLE 2: Men's Health & Lifestyle Guide
  // ==========================================
  console.log('\n2. Publishing Article 2: Men\'s Health & Affordable Generics...');
  const article2Payload = {
    access_token: accessToken,
    title: 'Affordable Generic Sildenafil & Tadalafil: US 2026 Price Index',
    author_name: 'RxMatch Men\'s Health Desk',
    author_url: `${siteUrl}/drugs`,
    content: [
      {
        tag: 'p',
        children: [
          'Erectile dysfunction (ED) therapies are rarely covered by employer-sponsored insurance plans in the United States. While brand-name Viagra® and Cialis® can retail for upwards of $75 per single tablet, FDA-approved generic equivalents cost a fraction of that amount when using direct cash coupons from ',
          { tag: 'a', attrs: { href: `${siteUrl}/drugs` }, children: ['RxMatch US'] },
          '.'
        ]
      },
      {
        tag: 'h3',
        children: ['Verified Mail-Order Promo Code (5% Extra Discount)']
      },
      {
        tag: 'p',
        children: [
          'Through our partner referral network at PharmStore, patients can use promo code ',
          { tag: 'b', children: ['pu-8992'] },
          ' to receive an additional 5% off across all therapies with worldwide discreet delivery.'
        ]
      },
      {
        tag: 'h3',
        children: ['Featured Men\'s Health Therapies & Direct Price Match']
      },
      {
        tag: 'ul',
        children: [
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/drugs/viagra` }, children: ['Viagra (Sildenafil) Cash Prices & Coupons'] },
              ' — Bioequivalent dosing from $1.80 per pill.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/drugs/cialis` }, children: ['Cialis (Tadalafil) 5mg, 10mg, 20mg'] },
              ' — 36-hour weekend pill and daily therapy.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/drugs/levitra` }, children: ['Levitra (Vardenafil)'] },
              ' — Fast onset alternative for diabetic patients.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/drugs/kamagra` }, children: ['Kamagra Tablets & Oral Jelly'] },
              ' — Rapid absorption format.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/drugs/propecia` }, children: ['Propecia (Finasteride 1mg)'] },
              ' — Hair restoration and DHT inhibition.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/drugs/priligy` }, children: ['Priligy (Dapoxetine)'] },
              ' — Clinical PE control.'
            ]
          }
        ]
      },
      {
        tag: 'p',
        children: [
          'Compare local retail pharmacy rates at CVS, Walgreens, Walmart, and Amazon Pharmacy on ',
          { tag: 'a', attrs: { href: `${siteUrl}/drugs` }, children: ['RxMatch US Catalog'] },
          '.'
        ]
      }
    ]
  };

  const res2 = postToTelegraph(article2Payload);
  if (res2.ok && res2.result && res2.result.url) {
    console.log('   ✅ Published:', res2.result.url);
    published.push(res2.result.url);
  } else {
    console.log('   ❌ Error 2:', res2);
  }

  // ==========================================
  // ARTICLE 3: PharmStore Online Pharmacy Review & pu-8992
  // ==========================================
  console.log('\n3. Publishing Article 3: PharmStore Online Pharmacy Review...');
  const article3Payload = {
    access_token: accessToken,
    title: 'PharmStore Online Pharmacy 2026 Review & 5% Promo Code pu-8992',
    author_name: 'RxMatch Pharmacy Research',
    author_url: siteUrl,
    content: [
      {
        tag: 'p',
        children: [
          'PharmStore is a trusted international mail-order pharmacy referral network providing access to 500+ medications at wholesale rates. The ',
          { tag: 'a', attrs: { href: `${siteUrl}` }, children: ['RxMatch US Portal'] },
          ' has integrated PharmStore into its real-time comparison engine.'
        ]
      },
      {
        tag: 'h3',
        children: ['Discount Details']
      },
      {
        tag: 'ul',
        children: [
          { tag: 'li', children: ['Promo Code: pu-8992 (5% discount on all orders)'] },
          { tag: 'li', children: ['Affiliate Referral: Partner ID 924 applied automatically'] },
          { tag: 'li', children: ['Direct Portal: http://pharm-store.com/?id=924'] }
        ]
      },
      {
        tag: 'h3',
        children: ['Recently Added High-Demand Generic Categories']
      },
      {
        tag: 'ul',
        children: [
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/drugs/celexa` }, children: ['Celexa (Citalopram)'] },
              ' — Depression & anxiety maintenance.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/drugs/paxil` }, children: ['Paxil (Paroxetine)'] },
              ' — Panic and social phobia therapy.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/drugs/effexor-xr` }, children: ['Effexor XR (Venlafaxine)'] },
              ' — Dual reuptake inhibitor.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/drugs/cozaar` }, children: ['Cozaar (Losartan)'] },
              ' — Blood pressure and kidney protection.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/drugs/topamax` }, children: ['Topamax (Topiramate)'] },
              ' — Migraine prophylaxis.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${siteUrl}/drugs/synthroid` }, children: ['Synthroid (Levothyroxine)'] },
              ' — Hypothyroidism hormone replacement.'
            ]
          }
        ]
      },
      {
        tag: 'p',
        children: [
          'Verify prices, view local retail pharmacy coupons, and access printable savings vouchers on ',
          { tag: 'a', attrs: { href: `${siteUrl}` }, children: ['RxMatch US (https://us-pharmacy.vercel.app)'] },
          '.'
        ]
      }
    ]
  };

  const res3 = postToTelegraph(article3Payload);
  if (res3.ok && res3.result && res3.result.url) {
    console.log('   ✅ Published:', res3.result.url);
    published.push(res3.result.url);
  } else {
    console.log('   ❌ Error 3:', res3);
  }

  console.log('\n=============================================');
  console.log('🎉 Telegra.ph (DA 91) Live Articles:');
  published.forEach(u => console.log('👉', u));
  console.log('=============================================\n');
}

run().catch(console.error);
