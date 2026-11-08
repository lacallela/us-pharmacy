const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

const tursoUrl = process.argv[2] || process.env.TURSO_DATABASE_URL;
const tursoToken = process.argv[3] || process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  console.log('\n❌ Ошибка: Не указаны параметры подключения к Turso.');
  console.log('\nИспользование:');
  console.log('  node scripts/push_to_turso.js <TURSO_DATABASE_URL> <TURSO_AUTH_TOKEN>\n');
  console.log('Или через переменные окружения:');
  console.log('  $env:TURSO_DATABASE_URL="libsql://your-db.turso.io"');
  console.log('  $env:TURSO_AUTH_TOKEN="your-token"');
  console.log('  node scripts/push_to_turso.js\n');
  process.exit(1);
}

const localDbPath = path.join(__dirname, '..', 'data', 'us_rx.db');
if (!fs.existsSync(localDbPath)) {
  console.error('❌ Локальная база данных не найдена по пути:', localDbPath);
  process.exit(1);
}

const localClient = createClient({ url: `file:${localDbPath.replace(/\\/g, '/')}` });
const remoteClient = createClient({ url: tursoUrl, authToken: tursoToken });

async function migrate() {
  console.log('🚀 Подключение к Turso Cloud...');
  console.log('URL:', tursoUrl);

  // 1. DDL Schema
  const schemaStatements = [
    `CREATE TABLE IF NOT EXISTS pharmacies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    );`,
    `CREATE TABLE IF NOT EXISTS drugs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS drug_pharmacy_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drug_id INTEGER NOT NULL,
      pharmacy_id INTEGER NOT NULL,
      cash_price REAL NOT NULL,
      coupon_price REAL NOT NULL,
      in_stock INTEGER DEFAULT 1,
      affiliate_url TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS traffic_clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drug_id INTEGER,
      pharmacy_id INTEGER,
      source TEXT,
      utm_source TEXT,
      utm_campaign TEXT,
      ip TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      badge TEXT,
      estimated_time TEXT,
      questions_json TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  console.log('📦 Создание таблиц на Turso...');
  for (const sql of schemaStatements) {
    await remoteClient.execute(sql);
  }

  // 2. Data copy
  const tables = ['admin_users', 'site_settings', 'pharmacies', 'drugs', 'drug_pharmacy_prices', 'quizzes'];

  for (const table of tables) {
    const res = await localClient.execute(`SELECT * FROM ${table}`);
    if (res.rows.length === 0) continue;

    console.log(`⏳ Перенос данных таблицы "${table}" (${res.rows.length} записей)...`);
    const cols = res.columns;
    const placeholders = cols.map(() => '?').join(', ');
    const insertSql = `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`;

    for (const row of res.rows) {
      const values = cols.map(c => row[c]);
      await remoteClient.execute({ sql: insertSql, args: values });
    }
  }

  console.log('\n✨ УСПЕХ: Все данные успешно синхронизированы с облачной базой Turso!');
}

migrate().catch((err) => {
  console.error('\n❌ Ошибка при переносе в Turso:', err);
  process.exit(1);
});
