const { neon } = require('@neondatabase/serverless');
const { createClient } = require('@libsql/client');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_LVoi1pZ4zUDY@ep-plain-mud-ba01n8lt-pooler.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const localDbPath = path.join(__dirname, '..', 'data', 'us_rx.db').replace(/\\/g, '/');

async function sync() {
  console.log('🔄 Syncing Neon Postgres data to local SQLite database...');
  const sql = neon(DATABASE_URL);
  const sqlite = createClient({ url: `file:${localDbPath}` });

  // 1. Sync drugs
  const drugs = await sql`SELECT * FROM drugs`;
  console.log(`Fetched ${drugs.length} drugs from Neon.`);

  for (const d of drugs) {
    await sqlite.execute({
      sql: `INSERT OR REPLACE INTO drugs (
        id, slug, name, generic_name, drug_type, category, symptoms,
        dosage, form, manufacturer, brand_price, generic_cash_price,
        coupon_code, description, fda_indications, contraindications,
        how_to_use, side_effects, is_trending, clicks_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        d.id ?? null,
        d.slug ?? null,
        d.name ?? null,
        d.generic_name ?? null,
        d.drug_type ?? null,
        d.category ?? null,
        typeof d.symptoms === 'string' ? d.symptoms : JSON.stringify(d.symptoms ?? []),
        d.dosage ?? null,
        d.form ?? null,
        d.manufacturer ?? null,
        d.brand_price ?? 0,
        d.generic_cash_price ?? 0,
        d.coupon_code ?? 'pu-8992',
        d.description ?? null,
        d.fda_indications ?? null,
        d.contraindications ?? null,
        d.how_to_use ?? null,
        d.side_effects ?? null,
        d.is_trending ?? 0,
        d.clicks_count ?? 0,
        d.created_at ? new Date(d.created_at).toISOString() : new Date().toISOString()
      ]
    });
  }

  // 2. Sync pharmacies
  const pharmacies = await sql`SELECT * FROM pharmacies`;
  console.log(`Fetched ${pharmacies.length} pharmacies from Neon.`);
  for (const p of pharmacies) {
    await sqlite.execute({
      sql: `INSERT OR REPLACE INTO pharmacies (
        id, slug, name, type, logo_text, pickup_time, perk_text, base_url, affiliate_param, epc, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        p.id ?? null,
        p.slug ?? null,
        p.name ?? null,
        p.type ?? 'Online',
        p.logo_text ?? p.name,
        p.pickup_time ?? '2-3 Days',
        p.perk_text ?? '',
        p.base_url ?? 'http://pharm-store.com',
        p.affiliate_param ?? 'id=924',
        p.epc ?? 4.5,
        p.is_active ?? 1
      ]
    });
  }

  // 3. Sync drug_pharmacy_prices
  const prices = await sql`SELECT * FROM drug_pharmacy_prices`;
  console.log(`Fetched ${prices.length} drug pharmacy prices from Neon.`);
  for (const pr of prices) {
    await sqlite.execute({
      sql: `INSERT OR REPLACE INTO drug_pharmacy_prices (
        id, drug_id, pharmacy_id, cash_price, coupon_price, in_stock, affiliate_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        pr.id ?? null,
        pr.drug_id ?? null,
        pr.pharmacy_id ?? null,
        pr.cash_price ?? 0,
        pr.coupon_price ?? 0,
        pr.in_stock ?? 1,
        pr.affiliate_url ?? null
      ]
    });
  }

  // 4. Sync site_settings
  const settings = await sql`SELECT * FROM site_settings`;
  for (const s of settings) {
    await sqlite.execute({
      sql: `INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)`,
      args: [s.key ?? '', s.value ?? '', s.updated_at ? new Date(s.updated_at).toISOString() : new Date().toISOString()]
    });
  }

  console.log('✅ SQLite database is now fully in sync with Neon Postgres!');
}

sync().catch(console.error);
