import { ProxyAgent, setGlobalDispatcher } from 'undici';
import fs from 'fs';
import path from 'path';

const proxyUrl = 'http://127.0.0.1:10809';
const dispatcher = new ProxyAgent({
  uri: proxyUrl,
  requestTls: { rejectUnauthorized: false }
});
setGlobalDispatcher(dispatcher);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const LINKS_FILE = 'D:/medtest/us-pharmacy/links.txt';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let existingLinks = new Set();
if (fs.existsSync(LINKS_FILE)) {
  const content = fs.readFileSync(LINKS_FILE, 'utf-8');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && trimmed.startsWith('http')) {
      existingLinks.add(trimmed);
    }
  });
}

// STRICT ACTIVE LINK CHECKER: Fetches the HTML and verifies <a ... href="...us-pharmacy.vercel.app...">
async function verifyActiveHyperlink(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (res.status >= 400) return false;
    const html = await res.text();
    // Look for active <a ... href="...us-pharmacy.vercel.app..."> tag
    return /<a\s+[^>]*href=["'][^"']*us-pharmacy\.vercel\.app[^"']*["'][^>]*>/i.test(html);
  } catch (err) {
    return false;
  }
}

async function recordVerifiedLink(url) {
  if (!url || !url.startsWith('http')) return;
  url = url.trim();
  if (existingLinks.has(url)) return;

  // STRICT VERIFICATION: MUST HAVE ACTIVE <a> TAG
  const isVerifiedActive = await verifyActiveHyperlink(url);
  if (!isVerifiedActive) {
    console.log(`[REJECTED - NOT ACTIVE <a>] ${url}`);
    return;
  }

  existingLinks.add(url);
  fs.appendFileSync(LINKS_FILE, `${url}\n`, 'utf-8');
  const now = new Date().toISOString();
  console.log(`[${now}] [RECORDED ACTIVE ✅] ${url} (Total Verified Active: ${existingLinks.size})`);
}

// 1. TELEGRAPH (DA 91)
async function publishTelegraph(author, title, bodyParagraphs, targetDrugSlug, targetDrugName) {
  try {
    const accRes = await fetch('https://api.telegra.ph/createAccount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        short_name: 'RxMatch',
        author_name: author,
        author_url: 'https://us-pharmacy.vercel.app'
      })
    });
    const accData = await accRes.json();
    if (!accData.ok) return null;
    const token = accData.result.access_token;

    const nodes = [];
    for (const p of bodyParagraphs) {
      nodes.push({ tag: 'p', children: [p] });
    }

    nodes.push({
      tag: 'p',
      children: [
        'Explore live cash prices and verified prescription discounts: ',
        { tag: 'a', attrs: { href: 'https://us-pharmacy.vercel.app' }, children: ['RxMatch US Healthcare Network'] },
        ' | Browse directory: ',
        { tag: 'a', attrs: { href: 'https://us-pharmacy.vercel.app/drugs' }, children: ['100+ FDA Approved Medications'] },
        targetDrugSlug ? ' | Dedicated guide: ' : '',
        targetDrugSlug ? { tag: 'a', attrs: { href: `https://us-pharmacy.vercel.app/drugs/${targetDrugSlug}` }, children: [`${targetDrugName} Cash Pricing`] } : '',
        ' | Refill Partner: ',
        { tag: 'a', attrs: { href: 'http://pharm-store.com/?id=924' }, children: ['PharmStore (5% Off Code: pu-8992)'] }
      ]
    });

    const pageRes = await fetch('https://api.telegra.ph/createPage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        title: title,
        author_name: author,
        author_url: 'https://us-pharmacy.vercel.app',
        content: nodes,
        return_content: false
      })
    });
    const pageData = await pageRes.json();
    if (pageData.ok && pageData.result.url) {
      return pageData.result.url;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// 2. GRAPH.ORG (DA 85+)
async function publishGraphOrg(author, title, bodyParagraphs, targetDrugSlug, targetDrugName) {
  try {
    const accRes = await fetch('https://api.graph.org/createAccount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        short_name: 'RxMatch',
        author_name: author,
        author_url: 'https://us-pharmacy.vercel.app'
      })
    });
    const accData = await accRes.json();
    if (!accData.ok) return null;
    const token = accData.result.access_token;

    const nodes = [];
    for (const p of bodyParagraphs) {
      nodes.push({ tag: 'p', children: [p] });
    }

    nodes.push({
      tag: 'p',
      children: [
        'Real-time pharmacy price index: ',
        { tag: 'a', attrs: { href: 'https://us-pharmacy.vercel.app' }, children: ['RxMatch US Prescription Discounts'] },
        ' | Full catalog: ',
        { tag: 'a', attrs: { href: 'https://us-pharmacy.vercel.app/drugs' }, children: ['100+ FDA Drug Directory'] },
        targetDrugSlug ? ' | Monograph: ' : '',
        targetDrugSlug ? { tag: 'a', attrs: { href: `https://us-pharmacy.vercel.app/drugs/${targetDrugSlug}` }, children: [`${targetDrugName} Discount Index`] } : '',
        ' | Mail Order Refills: ',
        { tag: 'a', attrs: { href: 'http://pharm-store.com/?id=924' }, children: ['PharmStore (Code: pu-8992)'] }
      ]
    });

    const pageRes = await fetch('https://api.graph.org/createPage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        title: title,
        author_name: author,
        author_url: 'https://us-pharmacy.vercel.app',
        content: nodes,
        return_content: false
      })
    });
    const pageData = await pageRes.json();
    if (pageData.ok && pageData.result.url) {
      return pageData.result.url;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// 3. RENTRY.CO (DA 78)
async function publishRentryCo(customSlug, markdownContent) {
  try {
    const getRes = await fetch('https://rentry.co', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const setCookie = getRes.headers.get('set-cookie') || '';
    const csrfMatch = setCookie.match(/csrftoken=([a-zA-Z0-9]+)/);
    const csrf = csrfMatch ? csrfMatch[1] : '';

    const body = new URLSearchParams();
    body.append('csrfmiddlewaretoken', csrf);
    body.append('url', customSlug || '');
    body.append('edit_code', 'rxmatch2026pass');
    body.append('text', markdownContent);

    const postRes = await fetch('https://rentry.co/api/new', {
      method: 'POST',
      headers: {
        'Referer': 'https://rentry.co',
        'Cookie': `csrftoken=${csrf}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: body
    });

    const resJson = await postRes.json();
    if (resJson.url) return resJson.url;
    if (customSlug) {
      return await publishRentryCo('', markdownContent);
    }
    return null;
  } catch (e) {
    return null;
  }
}

// 4. RENTRY.ORG (DA 78)
async function publishRentryOrg(customSlug, markdownContent) {
  try {
    const getRes = await fetch('https://rentry.org', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const setCookie = getRes.headers.get('set-cookie') || '';
    const csrfMatch = setCookie.match(/csrftoken=([a-zA-Z0-9]+)/);
    const csrf = csrfMatch ? csrfMatch[1] : '';

    const body = new URLSearchParams();
    body.append('csrfmiddlewaretoken', csrf);
    body.append('url', customSlug || '');
    body.append('edit_code', 'rxmatch2026pass');
    body.append('text', markdownContent);

    const postRes = await fetch('https://rentry.org/api/new', {
      method: 'POST',
      headers: {
        'Referer': 'https://rentry.org',
        'Cookie': `csrftoken=${csrf}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: body
    });

    const resJson = await postRes.json();
    if (resJson.url) return resJson.url;
    if (customSlug) {
      return await publishRentryOrg('', markdownContent);
    }
    return null;
  } catch (e) {
    return null;
  }
}

// 5. TEXT.IS (DA 50+)
async function publishTextIs(customSlug, markdownContent) {
  try {
    const getRes = await fetch('https://text.is', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const cookies = getRes.headers.get('set-cookie') || '';
    const html = await getRes.text();
    const tokenMatch = html.match(/name="csrfmiddlewaretoken" value="([^"]+)"/);
    if (!tokenMatch) return null;
    const csrfToken = tokenMatch[1];
    const csrftokenCookie = cookies.match(/csrftoken=([^;]+)/)?.[1] || '';

    const bodyParams = new URLSearchParams();
    bodyParams.append('csrfmiddlewaretoken', csrfToken);
    bodyParams.append('text', markdownContent);
    bodyParams.append('url', customSlug || `rxmatch-${Math.random().toString(36).substring(2, 8)}`);
    bodyParams.append('edit_code', '');

    const postRes = await fetch('https://text.is/', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://text.is/',
        'Cookie': `csrftoken=${csrftokenCookie}`
      },
      body: bodyParams.toString(),
      redirect: 'manual'
    });

    const finalUrl = postRes.headers.get('location');
    if (finalUrl) {
      return finalUrl.startsWith('http') ? finalUrl : `https://text.is${finalUrl}`;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// 25 CLINICAL TOPICS MATRIX
const TOPICS = [
  {
    title: 'GLP-1 Weight Loss & Metabolic Therapy: 2026 US Cash Benchmark',
    author: 'Metabolic Care Economics Coalition',
    slug: 'rxmatch-glp1-cash-prices',
    drugName: 'Semaglutide',
    drugSlug: 'semaglutide',
    summary: 'Navigating out-of-pocket expenses for Ozempic, Wegovy, and Mounjaro. Comparing retail pharmacy cash costs against accredited telehealth and discount dispensing networks.'
  },
  {
    title: 'Cardiovascular Health: Comparing Atorvastatin & Lisinopril Cash Rates',
    author: 'American Heart Health Pricing Council',
    slug: 'rxmatch-heart-blood-pressure',
    drugName: 'Atorvastatin',
    drugSlug: 'atorvastatin',
    summary: 'Evaluating statin and antihypertensive price disparities across national pharmacy chains. How retail markups affect uninsured and underinsured heart patients.'
  },
  {
    title: 'Affordable Antidepressants & SSRI Medications Guide 2026',
    author: 'Mental Health Pricing Initiative',
    slug: 'rxmatch-ssri-antidepressants',
    drugName: 'Sertraline',
    drugSlug: 'sertraline',
    summary: 'Analysis of generic SSRIs and SNRIs across US retail dispensaries. Why paying cash with discount coupons beats typical insurance copay tiers.'
  },
  {
    title: 'Men\'s Health Therapies: Generic Sildenafil & Tadalafil Price Index 2026',
    author: 'Urological Clinical Review',
    slug: 'rxmatch-ed-meds-index',
    drugName: 'Sildenafil',
    drugSlug: 'sildenafil',
    summary: 'Detailed pricing survey for generic Viagra and Cialis. Discovering 90% savings off standard pharmacy cash counters through verified direct-mail partners.'
  },
  {
    title: 'Gastrointestinal & Acid Relief: Omeprazole vs Pantoprazole Cash Comparison',
    author: 'Digestive Health Economics Forum',
    slug: 'rxmatch-gerd-omeprazole-guide',
    drugName: 'Omeprazole',
    drugSlug: 'omeprazole',
    summary: 'Long-term maintenance costs of proton-pump inhibitors (PPIs). How cash discounts reduce monthly expenses for chronic acid reflux and ulcer therapy.'
  },
  {
    title: 'Outpatient Antimicrobials & Antibiotics: Fair Cash Pricing 2026',
    author: 'Infectious Disease Access Group',
    slug: 'rxmatch-antibiotics-access',
    drugName: 'Amoxicillin',
    drugSlug: 'amoxicillin',
    summary: 'Immediate outpatient pricing benchmarks for first-line anti-infective medications when insurance approval causes dangerous treatment delays.'
  },
  {
    title: 'Chronic Pain & Anti-Inflammatory Therapeutics: US Price Directory',
    author: 'Pain Management Pricing Bureau',
    slug: 'rxmatch-pain-management-index',
    drugName: 'Meloxicam',
    drugSlug: 'meloxicam',
    summary: 'Comprehensive cash rate assessment for arthritis, neuropathic pain, and muscle spasm treatments across commercial pharmacy formularies.'
  },
  {
    title: 'Respiratory & Asthma Management: Inhaler & Allergy Medication Prices',
    author: 'Pulmonary Health Pricing Network',
    slug: 'rxmatch-asthma-inhalers-guide',
    drugName: 'Albuterol',
    drugSlug: 'albuterol',
    summary: 'Monitoring aerosol inhalers and daily maintenance leukotriene receptor antagonists for chronic bronchial asthma and severe seasonal allergies.'
  },
  {
    title: 'Thyroid & Hormone Replacement: Levothyroxine & Estradiol Price Guide',
    author: 'Endocrine Care Pricing Council',
    slug: 'rxmatch-thyroid-hormone-prices',
    drugName: 'Levothyroxine',
    drugSlug: 'levothyroxine',
    summary: 'Price tracking for essential daily thyroid supplementation and bioidentical hormone replacement therapy across leading dispensing pharmacies.'
  },
  {
    title: 'Neurological & Migraine Therapies: Sumatriptan & Topiramate Cash Directory',
    author: 'Neurology Economics Forum',
    slug: 'rxmatch-neurology-migraine-guide',
    drugName: 'Sumatriptan',
    drugSlug: 'sumatriptan',
    summary: 'Overcoming prior authorization delays for acute migraine abortion and seizure prevention through low-cost generic cash comparison.'
  },
  {
    title: 'Type-2 Diabetes Oral Therapeutics: Metformin & Jardiance Pricing Guide',
    author: 'Diabetes Access Alliance',
    slug: 'rxmatch-diabetes-metformin-guide',
    drugName: 'Metformin',
    drugSlug: 'metformin',
    summary: 'Evaluating cash price alternatives for first-line biguanides and modern SGLT2 inhibitors to preserve household savings without insurance hurdles.'
  },
  {
    title: 'Anxiety & Sleep Support: Escitalopram & Buspirone Discount Guide',
    author: 'Behavioral Pharmacology Review',
    slug: 'rxmatch-anxiety-sleep-pricing',
    drugName: 'Escitalopram',
    drugSlug: 'escitalopram',
    summary: 'Reviewing non-habit-forming anxiolytics and sleep aids across retail discount networks for long-term stress and anxiety management.'
  },
  {
    title: 'Hypertension Management: Amlodipine & Losartan Cash Comparison',
    author: 'Arterial Pressure Study Group',
    slug: 'rxmatch-amlodipine-losartan-pricing',
    drugName: 'Amlodipine',
    drugSlug: 'amlodipine',
    summary: 'How calcium channel blockers and angiotensin receptor blockers can be purchased for under $15 for a 90-day supply with discount coupons.'
  },
  {
    title: 'Dermatological Therapeutics: Tretinoin & Doxycycline Cash Directory',
    author: 'Skin Health Pricing Project',
    slug: 'rxmatch-dermatology-prices-2026',
    drugName: 'Doxycycline',
    drugSlug: 'doxycycline',
    summary: 'Comparing cash discounts on topical retinoids and systemic oral antibiotics for severe cystic acne and chronic dermatological inflammation.'
  },
  {
    title: 'Urological Health & BPH Therapies: Tamsulosin & Finasteride Benchmark',
    author: 'Prostate & Urological Care Coalition',
    slug: 'rxmatch-bph-tamsulosin-prices',
    drugName: 'Finasteride',
    drugSlug: 'finasteride',
    summary: 'Comprehensive review of alpha-blockers and 5-alpha reductase inhibitors for benign prostatic hyperplasia and male hair retention.'
  }
];

function generateMarkdown(topic) {
  const timestamp = new Date().toISOString().split('T')[0];
  const uid = Math.random().toString(36).substring(2, 6);

  return `# ${topic.title} (Clinical Update ${timestamp} - Ref: ${uid})

${topic.summary}

## Key Prescriptions Monitored
- **${topic.drugName}**: Evaluated across CVS, Walgreens, Walmart, and certified mail-order dispensaries.
- **Maintenance Refill Economics**: Identifying wholesale price points and manufacturer coupon structures.

## Verified Cash Pricing & Telehealth Directory
Compare real-time discount coupons and pharmacy networks across all 50 US states:
- [RxMatch US Prescription Savings](https://us-pharmacy.vercel.app)
- [Complete 100+ FDA Drug Directory](https://us-pharmacy.vercel.app/drugs)
- [${topic.drugName} Price & Availability](https://us-pharmacy.vercel.app/drugs/${topic.drugSlug})

## Certified Mail-Order Fulfillment
Order prescription refills discreetly to your door via verified partner [PharmStore](http://pharm-store.com/?id=924). Apply coupon code **pu-8992** at checkout for an instant 5% discount across all orders.

---
*Published by ${topic.author} via RxMatch US Clinical Directory.*`;
}

const PLATFORMS = ['telegraph', 'graph_org', 'rentry_co', 'rentry_org', 'text_is'];

async function main() {
  console.log(`=======================================================`);
  console.log(`Starting STRICT ACTIVE HYPERLINK DAEMON...`);
  console.log(`Supported Verified Platforms: ${PLATFORMS.join(', ')}`);
  console.log(`Active <a> Links in links.txt: ${existingLinks.size}`);
  console.log(`All entries MUST contain verified active <a href="..."> tags.`);
  console.log(`=======================================================\n`);

  let iteration = 0;

  while (true) {
    iteration++;
    const topic = TOPICS[(iteration - 1) % TOPICS.length];
    const platform = PLATFORMS[(iteration - 1) % PLATFORMS.length];
    const uniqueSlug = `${topic.slug}-${Math.random().toString(36).substring(2, 6)}`;
    const markdown = generateMarkdown(topic);
    const bodyParagraphs = [
      topic.summary,
      `Key therapy evaluated: ${topic.drugName}. Maintenance refill benchmarks across retail and mail-order networks.`
    ];

    console.log(`\n[Iteration #${iteration}] Target: ${platform.toUpperCase()} | Topic: "${topic.title}"`);

    let candidateUrl = null;
    try {
      if (platform === 'telegraph') {
        candidateUrl = await publishTelegraph(topic.author, topic.title, bodyParagraphs, topic.drugSlug, topic.drugName);
      } else if (platform === 'graph_org') {
        candidateUrl = await publishGraphOrg(topic.author, topic.title, bodyParagraphs, topic.drugSlug, topic.drugName);
      } else if (platform === 'rentry_co') {
        candidateUrl = await publishRentryCo(uniqueSlug, markdown);
      } else if (platform === 'rentry_org') {
        candidateUrl = await publishRentryOrg(uniqueSlug, markdown);
      } else if (platform === 'text_is') {
        candidateUrl = await publishTextIs(uniqueSlug, markdown);
      }

      if (candidateUrl) {
        console.log(`Generated: ${candidateUrl} -> Verifying active <a> tag...`);
        await recordVerifiedLink(candidateUrl);
      } else {
        console.log(`Platform ${platform} failed to return a URL. Retrying next...`);
      }
    } catch (err) {
      console.error(`Error on ${platform}:`, err.message);
    }

    console.log(`Sleeping 15s before next active post...`);
    await sleep(15000);
  }
}

main();
