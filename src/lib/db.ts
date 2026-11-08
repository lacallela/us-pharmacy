import { createClient, Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const LOCAL_DB_PATH = path.join(DB_DIR, 'us_rx.db').replace(/\\/g, '/');

let _client: Client | null = null;
let _schemaInitialized = false;

export function getDb(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL || `file:${LOCAL_DB_PATH}`;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    _client = createClient({ url, authToken });
  }
  return _client;
}

export async function ensureSchema(client: Client) {
  if (_schemaInitialized) return;

  try {
    const tableCheck = await client.execute(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='site_settings'`);
    if (tableCheck.rows.length > 0) {
      _schemaInitialized = true;
      return;
    }
  } catch {
    // proceed
  }

  const ddlStatements = [
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
      affiliate_url TEXT,
      FOREIGN KEY (drug_id) REFERENCES drugs(id),
      FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id)
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

  for (const sql of ddlStatements) {
    await client.execute(sql);
  }

  // Seed default admin if none exists
  const adminCheck = await client.execute(`SELECT COUNT(*) as count FROM admin_users`);
  if (Number(adminCheck.rows[0].count) === 0) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('admin12345', salt, 10000, 32, 'sha256').toString('hex');
    const passwordHash = `${salt}:${hash}`;
    await client.execute({
      sql: `INSERT INTO admin_users (username, password_hash, name, role) VALUES (?, ?, ?, ?)`,
      args: ['admin', passwordHash, 'System Administrator', 'superadmin']
    });
  }

  // Seed default settings if empty
  const settingsCheck = await client.execute(`SELECT COUNT(*) as count FROM site_settings`);
  if (Number(settingsCheck.rows[0].count) === 0) {
    const defaultSettings: [string, string, string][] = [
      ['site_name', 'RxMatch US', 'Website title / brand name'],
      ['site_tagline', 'Prescription Savings & Telehealth Price Comparison', 'Website tagline'],
      ['support_phone', '1-800-555-RXUSA', 'Toll-free customer support phone number'],
      ['support_email', 'help@rxmatch.us', 'Customer support email address'],
      ['coupon_bin', '015995', 'National Rx discount network BIN number'],
      ['coupon_pcn', 'GDC', 'National Rx discount network PCN number'],
      ['coupon_group', 'RXMATCH', 'Discount card group code'],
      ['default_coupon_code', 'RXSAVER80', 'Default coupon promo code'],
      ['announcement_text', 'Save up to 90% on FDA-approved prescriptions at 65,000+ US pharmacies', 'Top announcement ticker text'],
      ['hero_title', 'Stop Overpaying for Prescriptions. Save up to 90%', 'Homepage main hero heading'],
      ['hero_subtitle', 'Compare cash and coupon prices across CVS, Walgreens, Walmart, and Amazon Pharmacy. Find FDA-approved generics without needing insurance.', 'Homepage hero description'],
      ['affiliate_subid', 'rxmatch_us', 'Default affiliate subid tag for outbound tracking'],
      ['avg_epc_usd', '3.85', 'Target blended EPC in USD for revenue calculation'],
      ['currency_symbol', '$', 'Default currency symbol']
    ];

    for (const [key, value, desc] of defaultSettings) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO site_settings (key, value, description) VALUES (?, ?, ?)`,
        args: [key, value, desc]
      });
    }
  }

  _schemaInitialized = true;
}

export interface Drug {
  id: number;
  slug: string;
  name: string;
  generic_name: string;
  drug_type: string;
  category: string;
  symptoms: string;
  dosage: string;
  form: string;
  manufacturer: string;
  brand_price: number;
  generic_cash_price: number;
  coupon_code: string;
  description: string;
  fda_indications: string;
  contraindications: string;
  how_to_use: string;
  side_effects: string | null;
  rating: number;
  clicks_count: number;
  is_trending: number;
  created_at: string;
}

export interface Pharmacy {
  id: number;
  slug: string;
  name: string;
  type: string;
  logo_text: string;
  pickup_time: string;
  perk_text: string;
  base_url: string;
  affiliate_param: string;
  epc: number;
  is_active: number;
}

export interface DrugPriceOffer {
  id: number;
  drug_id: number;
  pharmacy_id: number;
  pharmacy_name: string;
  pharmacy_slug: string;
  pharmacy_type: string;
  pickup_time: string;
  perk_text: string;
  cash_price: number;
  coupon_price: number;
  in_stock: number;
  affiliate_url: string;
}

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  role: string;
  created_at: string;
}

export interface SiteSettingItem {
  key: string;
  value: string;
  description: string;
  updated_at: string;
}
