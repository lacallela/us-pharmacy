const { createClient } = require('@libsql/client');
const { neon } = require('@neondatabase/serverless');
const path = require('path');
const fs = require('fs');

const localDbPath = path.join(__dirname, '..', 'data', 'us_rx.db').replace(/\\/g, '/');
const localClient = createClient({ url: `file:${localDbPath}` });

const neonUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_LVoi1pZ4zUDY@ep-plain-mud-ba01n8lt-pooler.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(neonUrl);

async function migrate() {
  console.log('🚀 Starting migration from SQLite to Neon Postgres...\n');

  // 1. Create Tables
  console.log('1. Creating schema in Neon Postgres...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS pharmacies (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      logo_text TEXT,
      pickup_time TEXT,
      perk_text TEXT,
      base_url TEXT NOT NULL,
      affiliate_param TEXT,
      epc REAL DEFAULT 3.50,
      is_active INTEGER DEFAULT 1
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS drugs (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      generic_name TEXT NOT NULL,
      drug_type TEXT NOT NULL,
      category TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      dosage TEXT NOT NULL,
      form TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      brand_price REAL NOT NULL,
      generic_cash_price REAL NOT NULL,
      coupon_code TEXT DEFAULT 'RXSAVER80',
      description TEXT NOT NULL,
      fda_indications TEXT NOT NULL,
      contraindications TEXT NOT NULL,
      how_to_use TEXT NOT NULL,
      side_effects TEXT,
      rating REAL DEFAULT 4.8,
      clicks_count INTEGER DEFAULT 0,
      is_trending INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS drug_pharmacy_prices (
      id SERIAL PRIMARY KEY,
      drug_id INTEGER NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
      pharmacy_id INTEGER NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
      cash_price REAL NOT NULL,
      coupon_price REAL NOT NULL,
      in_stock INTEGER DEFAULT 1,
      affiliate_url TEXT
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS traffic_clicks (
      id SERIAL PRIMARY KEY,
      drug_id INTEGER,
      pharmacy_id INTEGER,
      source TEXT,
      utm_source TEXT,
      utm_campaign TEXT,
      ip TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      badge TEXT,
      estimated_time TEXT,
      questions_json TEXT NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  console.log('✅ Tables created successfully!');

  // 2. Transfer Data
  console.log('\n2. Transferring data from local SQLite...');

  // admin_users
  const admins = await localClient.execute('SELECT * FROM admin_users');
  for (const row of admins.rows) {
    await sql`
      INSERT INTO admin_users (username, password_hash, name, role)
      VALUES (${row.username}, ${row.password_hash}, ${row.name}, ${row.role})
      ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;
    `;
  }
  console.log(`   - admin_users: ${admins.rows.length} rows`);

  // site_settings
  const settings = await localClient.execute('SELECT * FROM site_settings');
  for (const row of settings.rows) {
    await sql`
      INSERT INTO site_settings (key, value, description)
      VALUES (${row.key}, ${row.value}, ${row.description})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    `;
  }
  console.log(`   - site_settings: ${settings.rows.length} rows`);

  // pharmacies
  const pharmacies = await localClient.execute('SELECT * FROM pharmacies');
  for (const p of pharmacies.rows) {
    await sql`
      INSERT INTO pharmacies (id, slug, name, type, logo_text, pickup_time, perk_text, base_url, affiliate_param, epc, is_active)
      VALUES (${p.id}, ${p.slug}, ${p.name}, ${p.type}, ${p.logo_text}, ${p.pickup_time}, ${p.perk_text}, ${p.base_url}, ${p.affiliate_param}, ${p.epc}, ${p.is_active})
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, base_url = EXCLUDED.base_url;
    `;
  }
  if (pharmacies.rows.length > 0) {
    await sql`SELECT setval(pg_get_serial_sequence('pharmacies', 'id'), COALESCE(MAX(id), 1)) FROM pharmacies;`;
  }
  console.log(`   - pharmacies: ${pharmacies.rows.length} rows`);

  // drugs
  const drugs = await localClient.execute('SELECT * FROM drugs');
  for (const d of drugs.rows) {
    await sql`
      INSERT INTO drugs (
        id, slug, name, generic_name, drug_type, category, symptoms,
        dosage, form, manufacturer, brand_price, generic_cash_price,
        coupon_code, description, fda_indications, contraindications,
        how_to_use, side_effects, rating, clicks_count, is_trending
      ) VALUES (
        ${d.id}, ${d.slug}, ${d.name}, ${d.generic_name}, ${d.drug_type}, ${d.category}, ${d.symptoms},
        ${d.dosage}, ${d.form}, ${d.manufacturer}, ${d.brand_price}, ${d.generic_cash_price},
        ${d.coupon_code}, ${d.description}, ${d.fda_indications}, ${d.contraindications},
        ${d.how_to_use}, ${d.side_effects}, ${d.rating}, ${d.clicks_count}, ${d.is_trending}
      )
      ON CONFLICT (slug) DO UPDATE SET brand_price = EXCLUDED.brand_price, generic_cash_price = EXCLUDED.generic_cash_price;
    `;
  }
  if (drugs.rows.length > 0) {
    await sql`SELECT setval(pg_get_serial_sequence('drugs', 'id'), COALESCE(MAX(id), 1)) FROM drugs;`;
  }
  console.log(`   - drugs: ${drugs.rows.length} rows`);

  // drug_pharmacy_prices
  const prices = await localClient.execute('SELECT * FROM drug_pharmacy_prices');
  await sql`DELETE FROM drug_pharmacy_prices;`;
  for (const pr of prices.rows) {
    await sql`
      INSERT INTO drug_pharmacy_prices (id, drug_id, pharmacy_id, cash_price, coupon_price, in_stock, affiliate_url)
      VALUES (${pr.id}, ${pr.drug_id}, ${pr.pharmacy_id}, ${pr.cash_price}, ${pr.coupon_price}, ${pr.in_stock}, ${pr.affiliate_url});
    `;
  }
  if (prices.rows.length > 0) {
    await sql`SELECT setval(pg_get_serial_sequence('drug_pharmacy_prices', 'id'), COALESCE(MAX(id), 1)) FROM drug_pharmacy_prices;`;
  }
  console.log(`   - drug_pharmacy_prices: ${prices.rows.length} rows`);

  // quizzes
  const quizzes = await localClient.execute('SELECT * FROM quizzes');
  for (const q of quizzes.rows) {
    await sql`
      INSERT INTO quizzes (id, title, subtitle, badge, estimated_time, questions_json)
      VALUES (${q.id}, ${q.title}, ${q.subtitle}, ${q.badge}, ${q.estimated_time}, ${q.questions_json})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  console.log(`   - quizzes: ${quizzes.rows.length} rows`);

  console.log('\n🎉 ALL DATA MIGRATED TO NEON POSTGRES SUCCESSFULLY!');
}

migrate().catch(console.error);
