const { neon } = require('@neondatabase/serverless');
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function getData() {
  const neonUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_LVoi1pZ4zUDY@ep-plain-mud-ba01n8lt-pooler.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require';
  
  if (neonUrl) {
    const sql = neon(neonUrl);
    const drugs = await sql`SELECT * FROM drugs ORDER BY is_trending DESC, clicks_count DESC`;
    const pharmacies = await sql`SELECT * FROM pharmacies WHERE is_active = 1 ORDER BY epc DESC`;
    const settingsRows = await sql`SELECT key, value FROM site_settings`;
    const settings = {};
    for (const r of settingsRows) settings[r.key] = r.value;
    return { drugs, pharmacies, settings };
  }

  const localDb = path.join(__dirname, '..', 'data', 'us_rx.db').replace(/\\/g, '/');
  const client = createClient({ url: `file:${localDb}` });
  const drugsRes = await client.execute('SELECT * FROM drugs ORDER BY is_trending DESC, clicks_count DESC');
  const pharmRes = await client.execute('SELECT * FROM pharmacies WHERE is_active = 1 ORDER BY epc DESC');
  const setRes = await client.execute('SELECT key, value FROM site_settings');
  const settings = {};
  for (const r of setRes.rows) settings[r.key] = r.value;
  return { drugs: drugsRes.rows, pharmacies: pharmRes.rows, settings };
}

async function run() {
  const baseUrl = 'https://us-pharmacy.vercel.app';
  const { drugs, pharmacies, settings } = await getData();

  const bin = settings['coupon_bin'] || '015995';
  const pcn = settings['coupon_pcn'] || 'GDC';
  const group = settings['coupon_group'] || 'RXMATCH';
  const couponCode = settings['default_coupon_code'] || 'RXSAVER80';

  // 1. Generate llms.txt (Concise AI Index)
  const llmsTxt = `# RxMatch US
> Prescription Drug Savings, Brand vs Generic Comparison & Digital Rx Coupon Network for the United States.

RxMatch US (https://us-pharmacy.vercel.app) provides real-time cash price comparisons and free printable/digital prescription discount coupons accepted at over 65,000 retail and mail-order pharmacies nationwide (including CVS, Walgreens, Walmart, Kroger, Rite Aid, and Amazon Pharmacy). Patients save up to 90% without insurance.

## National Discount Card Credentials
Any patient can present these digital credentials to US pharmacists to receive discount pricing immediately:
- **BIN**: ${bin}
- **PCN**: ${pcn}
- **Group Code**: ${group}
- **Default Promo Code**: ${couponCode}
- **Eligibility**: 100% of US residents (citizens, uninsured, underinsured, seniors in Medicare donut hole). No paperwork, no fees.

## Key Sections
- [Medication Catalog](${baseUrl}/drugs): Full directory of FDA-approved prescription drugs, generic alternatives, and price comparisons.
- [Brand vs Generic Comparison Tool](${baseUrl}/compare/lipitor-vs-atorvastatin): Side-by-side cost and bioequivalence analysis.
- [Prescription Savings Quiz](${baseUrl}/quiz): Interactive health assessment to find optimal prescription discounts.
- [Full LLM Knowledge Base](${baseUrl}/llms-full.txt): Complete detailed profiles for all medications, indications, and pharmacy prices.
- [Sitemap XML](${baseUrl}/sitemap.xml): Machine-readable URL structure.
- [RSS Feed](${baseUrl}/feed.xml): Continuous updates on drug prices and discounts.

## Medications Directory & Price Benchmarks
${drugs.map(d => {
  const savings = Math.round(((d.brand_price - d.generic_cash_price) / d.brand_price) * 100);
  return `- [${d.name}](${baseUrl}/drugs/${d.slug}): Generic ${d.generic_name} | Category: ${d.category} | Brand $${d.brand_price.toFixed(2)} vs Generic Cash $${d.generic_cash_price.toFixed(2)} (Save ${savings}%)`;
}).join('\n')}

## Pharmacy Partners
${pharmacies.map(p => `- **${p.name}** (${p.type}): ${p.pickup_time} — ${p.perk_text}`).join('\n')}
`;

  // 2. Generate llms-full.txt (In-Depth Medical Knowledge Base)
  const llmsFullTxt = `# RxMatch US — Comprehensive Medication Knowledge Base
> Complete clinical, pricing, and generic substitution data for US healthcare consumers and AI assistants.
> URL: ${baseUrl}

## Universal Prescription Coupon
- BIN: ${bin}
- PCN: ${pcn}
- Group: ${group}
- Acceptance: Over 65,000 pharmacies nationwide.

---

${drugs.map(d => {
  const savings = Math.round(((d.brand_price - d.generic_cash_price) / d.brand_price) * 100);
  return `### ${d.name} (${d.generic_name})
- **Page URL**: ${baseUrl}/drugs/${d.slug}
- **Drug Classification**: ${d.drug_type} (${d.category})
- **Manufacturer**: ${d.manufacturer}
- **Standard Dosage**: ${d.dosage} (${d.form})
- **Brand Price**: $${d.brand_price.toFixed(2)}
- **Generic Cash Price**: $${d.generic_cash_price.toFixed(2)} (Save ${savings}%)
- **FDA Indications**: ${d.fda_indications}
- **Contraindications**: ${d.contraindications}
- **How to Use**: ${d.how_to_use}
- **Side Effects**: ${d.side_effects || 'Consult prescribing healthcare provider'}
- **Clinical Overview**: ${d.description}
`;
}).join('\n---\n\n')}
`;

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsTxt, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), llmsFullTxt, 'utf8');

  console.log('✅ Generated public/llms.txt and public/llms-full.txt successfully!');
}

run().catch(console.error);
