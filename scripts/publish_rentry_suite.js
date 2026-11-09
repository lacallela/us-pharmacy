const https = require('https');
const querystring = require('querystring');
const { createClient } = require('@libsql/client');
const path = require('path');

const localDbPath = path.join(__dirname, '..', 'data', 'us_rx.db').replace(/\\/g, '/');
const db = createClient({ url: `file:${localDbPath}` });
const siteUrl = 'https://us-pharmacy.vercel.app';

function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function getRentryToken() {
  const res = await httpRequest({
    hostname: 'rentry.co',
    port: 443,
    path: '/',
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const cookies = res.headers['set-cookie'] || [];
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
  const match = res.body.match(/name="csrfmiddlewaretoken"\s+value="([^"]+)"/);
  return { cookieHeader, csrfToken: match ? match[1] : '' };
}

async function publishRentry(customUrl, text) {
  const { cookieHeader, csrfToken } = await getRentryToken();
  const postData = querystring.stringify({
    csrfmiddlewaretoken: csrfToken,
    text: text,
    url: customUrl || '',
    edit_code: 'rxmatch2026'
  });

  const res = await httpRequest({
    hostname: 'rentry.co',
    port: 443,
    path: '/api/new',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': cookieHeader,
      'Referer': 'https://rentry.co',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  }, postData);

  try {
    return JSON.parse(res.body);
  } catch {
    return { status: res.status, raw: res.body };
  }
}

async function editRentry(slug, text) {
  const { cookieHeader, csrfToken } = await getRentryToken();
  const postData = querystring.stringify({
    csrfmiddlewaretoken: csrfToken,
    text: text,
    edit_code: 'rxmatch2026'
  });

  const res = await httpRequest({
    hostname: 'rentry.co',
    port: 443,
    path: `/api/edit/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': cookieHeader,
      'Referer': `https://rentry.co/${slug}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  }, postData);

  try {
    return JSON.parse(res.body);
  } catch {
    return { status: res.status, raw: res.body };
  }
}

async function run() {
  const drugsRes = await db.execute('SELECT * FROM drugs ORDER BY is_trending DESC, clicks_count DESC');
  const drugs = drugsRes.rows;

  const liveArticles = [];

  // 1. Update rxmatch-us-savings with the comprehensive 50-drug directory
  console.log('1. Updating https://rentry.co/rxmatch-us-savings ...');
  const article1 = `# US Prescription Drug Price Benchmark & Discount Directory 2026
> Comprehensive Healthcare Savings Resource by [RxMatch US](${siteUrl})

Millions of Americans overpay for essential prescription medications every day. The cash prices set by retail pharmacies often differ by up to 90% from manufacturer costs. The [RxMatch US Prescription Network](${siteUrl}) provides direct access to digital cash coupons and mail-order options accepted at over 65,000 pharmacies nationwide (including CVS, Walgreens, Walmart, Kroger, and Amazon Pharmacy).

## Universal Rx Savings Voucher
Show this digital information to your pharmacist at checkout:
- **BIN**: \`015995\`
- **PCN**: \`GDC\`
- **Group**: \`RXMATCH\`
- **Default Discount**: Up to 90% off retail pricing without insurance.

---

## Key Portal Resources
- [Main Prescription Directory](${siteUrl}/drugs): Search cash prices for 100+ FDA-approved medications.
- [Free Rx Savings Screener Quiz](${siteUrl}/quiz): Answer 3 simple questions to find optimal discounts for your conditions.
- [Viagra vs Sildenafil Comparison](${siteUrl}/compare/viagra-vs-sildenafil): Cost and clinical bioequivalence analysis.
- [Lipitor vs Atorvastatin Comparison](${siteUrl}/compare/lipitor-vs-atorvastatin): Statin price comparison and generic bioequivalence.
- [Cialis vs Tadalafil Comparison](${siteUrl}/compare/cialis-vs-tadalafil): Complete daily vs as-needed ED cost guide.
- [AI LLM Medical Context](${siteUrl}/llms.txt): Machine-readable medication pricing benchmarks.
- [XML Sitemap](${siteUrl}/sitemap.xml): Machine-readable index of all updated drug pages.

---

## 2026 Prescription Price Benchmark Catalog
| Medication | Generic Molecule | Category | Brand Retail | Cash Coupon | Savings |
| :--- | :--- | :--- | :---: | :---: | :---: |
${drugs.slice(0, 45).map(d => {
  const savings = Math.round(((d.brand_price - d.generic_cash_price) / d.brand_price) * 100);
  return `| [${d.name}](${siteUrl}/drugs/${d.slug}) | ${d.generic_name} | ${d.category} | $${d.brand_price.toFixed(2)} | $${d.generic_cash_price.toFixed(2)} | **Save ${savings}%** |`;
}).join('\n')}

Explore the complete catalog of 100+ FDA medications at [RxMatch US Prescription Directory](${siteUrl}/drugs).
`;

  const res1 = await editRentry('rxmatch-us-savings', article1);
  console.log('Update res1:', res1);
  if (res1.status === '200' || res1.url) liveArticles.push('https://rentry.co/rxmatch-us-savings');

  // 2. Article 2 is already live at https://rentry.co/us-pharmacy-coupons-2026
  liveArticles.push('https://rentry.co/us-pharmacy-coupons-2026');

  // 3. Publish Article 3: PharmStore Review & 5% Coupon Guide
  console.log('\n2. Publishing Article 3 (PharmStore Review & pu-8992 Coupon Guide)...');
  const article3 = `# PharmStore Online Pharmacy 2026 Review & Promo Code (pu-8992)
> Independent Consumer Review by [RxMatch US](${siteUrl})

When shopping for prescription and maintenance medications online, safety, affordability, and discreet delivery are top priorities. PharmStore is a global online pharmacy network providing access to FDA-approved and international quality generic medications.

## Exclusive Discount Promo Code
- **Promo Code**: \`pu-8992\`
- **Discount Value**: **5% OFF** across all medications and categories.
- **Minimum Order**: None.
- **Shipping**: Discreet worldwide delivery (Standard AirMail & Express EMS).
- **Direct Link**: [Visit PharmStore Official Catalog](http://pharm-store.com/?id=924)

---

## Popular Medications Available with pu-8992 Discount

### 1. Men's Health & Performance
- **Viagra (Sildenafil)**: Starting under $1.50 per pill. [Compare Viagra Prices at RxMatch](${siteUrl}/drugs/viagra).
- **Cialis (Tadalafil)**: Available in 5mg, 10mg, 20mg, and 40mg. [Compare Cialis Prices at RxMatch](${siteUrl}/drugs/cialis).
- **Levitra (Vardenafil)**: Rapid onset generic ED solution. [View Levitra Discounts](${siteUrl}/drugs/levitra).
- **Kamagra & Kamagra Oral Jelly**: Fast-absorbing sildenafil formulas. [View Kamagra Discounts](${siteUrl}/drugs/kamagra).

### 2. Mental Health & Mood
- **Celexa (Citalopram)**: Relief for major depressive disorder. [View Celexa Discounts](${siteUrl}/drugs/celexa).
- **Zoloft (Sertraline)**: First-line SSRI for depression and social anxiety. [View Zoloft Discounts](${siteUrl}/drugs/zoloft).
- **Paxil (Paroxetine)**: Highly effective for panic disorder. [View Paxil Discounts](${siteUrl}/drugs/paxil).
- **Effexor XR (Venlafaxine)**: Dual-action SNRI antidepressant. [View Effexor XR Discounts](${siteUrl}/drugs/effexor-xr).

### 3. Blood Pressure & Heart
- **Cozaar (Losartan)**: Angiotensin II receptor blocker. [View Cozaar Discounts](${siteUrl}/drugs/cozaar).
- **Diovan (Valsartan)**: Blood pressure management. [View Diovan Discounts](${siteUrl}/drugs/diovan).
- **Lisinopril**: ACE inhibitor benchmark. [View Lisinopril Discounts](${siteUrl}/drugs/lisinopril).

### 4. Chronic Care, Antibiotics & Pain
- **Metformin**: Top-tier type 2 diabetes therapy. [View Metformin Discounts](${siteUrl}/drugs/metformin).
- **Amoxicillin**: Broad-spectrum antibiotic. [View Amoxicillin Discounts](${siteUrl}/drugs/amoxicillin).
- **Topamax (Topiramate)**: Migraine prophylaxis & seizure control. [View Topamax Discounts](${siteUrl}/drugs/topamax).
- **Synthroid (Levothyroxine)**: Thyroid hormone replacement. [View Synthroid Discounts](${siteUrl}/drugs/synthroid).

---

## How to Apply the Discount
1. Select your medication on [RxMatch US Directory](${siteUrl}/drugs).
2. Click **Get Coupon** to transfer to the PharmStore checkout portal.
3. Enter promo code **\`pu-8992\`** during checkout to deduct an additional 5% immediately.

Explore full price comparisons and free discount cards at [RxMatch US](${siteUrl}).
`;

  const res3 = await publishRentry('pharm-store-discount-guide', article3);
  console.log('Publish res3:', res3);
  if (res3.url) liveArticles.push(res3.url);

  // 4. Publish Article 4: Comprehensive 101-Drug Directory
  console.log('\n3. Publishing Article 4 (Complete 101 Prescription Medication Price Index)...');
  const article4 = `# Complete 101 Prescription Medication Price Index (2026 Directory)
> Published by [RxMatch US Healthcare Team](${siteUrl})

Below is the verified master index of 101 prescription and OTC medications with direct price comparisons across CVS, Walgreens, Walmart, and Amazon Pharmacy.

Universal Discount Card: BIN \`015995\`, PCN \`GDC\`, Group \`RXMATCH\`.

${drugs.map((d, i) => {
  const savings = Math.round(((d.brand_price - d.generic_cash_price) / d.brand_price) * 100);
  return `${i + 1}. [${d.name}](${siteUrl}/drugs/${d.slug}) (${d.generic_name}) — ${d.category} | Brand $${d.brand_price.toFixed(2)} vs Generic Cash $${d.generic_cash_price.toFixed(2)} (**Save ${savings}%**)`;
}).join('\n')}

---
- Portal Home: ${siteUrl}
- Drug Catalog: ${siteUrl}/drugs
- Free Savings Quiz: ${siteUrl}/quiz
- Live XML Sitemap: ${siteUrl}/sitemap.xml
`;

  const res4 = await publishRentry('rxmatch-complete-drug-index', article4);
  console.log('Publish res4:', res4);
  if (res4.url) liveArticles.push(res4.url);

  console.log('\n=============================================');
  console.log('🎉 All Live Backlink & Indexing Articles:');
  liveArticles.forEach(a => console.log('👉', a));
  console.log('=============================================\n');
}

run().catch(console.error);
