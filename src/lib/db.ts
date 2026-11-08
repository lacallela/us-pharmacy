import { createClient, Client } from '@libsql/client';
import { neon } from '@neondatabase/serverless';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export interface DbClient {
  execute(query: string | { sql: string; args?: any[] }): Promise<{ rows: any[]; lastInsertRowid?: number | bigint }>;
}

class NeonClientAdapter implements DbClient {
  private sql: ReturnType<typeof neon>;

  constructor(url: string) {
    this.sql = neon(url);
  }

  async execute(stmt: string | { sql: string; args?: any[] }) {
    const sqlStr = typeof stmt === 'string' ? stmt : stmt.sql;
    const args = typeof stmt === 'string' ? [] : (stmt.args || []);

    let paramIndex = 1;
    let pgSql = sqlStr.replace(/\?/g, () => `$${paramIndex++}`);

    const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
    const hasReturning = /RETURNING\b/i.test(pgSql);
    if (isInsert && !hasReturning) {
      pgSql += ' RETURNING id';
    }

    try {
      const res = await this.sql.query(pgSql, args);
      const rows = Array.isArray(res) ? res : (res && (res as any).rows ? (res as any).rows : []);
      const lastInsertRowid = isInsert && rows && rows[0] && rows[0].id ? rows[0].id : undefined;
      return {
        rows,
        lastInsertRowid
      };
    } catch (err: any) {
      if (isInsert && err.message && err.message.includes('column "id" does not exist')) {
        let i = 1;
        const fallbackSql = sqlStr.replace(/\?/g, () => `$${i++}`);
        const res = await this.sql.query(fallbackSql, args);
        const rows = Array.isArray(res) ? res : (res && (res as any).rows ? (res as any).rows : []);
        return {
          rows,
          lastInsertRowid: undefined
        };
      }
      throw err;
    }
  }
}

function getDatabaseUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }

  // When deployed on Vercel serverless functions, the root filesystem is read-only.
  // /tmp is the only writable directory, so copy the sqlite db to /tmp if not already there.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDb = '/tmp/us_rx.db';
    if (!fs.existsSync(tmpDb)) {
      const sourceDb = path.join(process.cwd(), 'data', 'us_rx.db');
      if (fs.existsSync(sourceDb)) {
        try {
          fs.copyFileSync(sourceDb, tmpDb);
          fs.chmodSync(tmpDb, 0o666);
        } catch (err) {
          console.error('Failed to copy db to /tmp:', err);
        }
      }
    } else {
      try {
        fs.chmodSync(tmpDb, 0o666);
      } catch {}
    }
    return `file:${tmpDb}`;
  }

  const DB_DIR = path.join(process.cwd(), 'data');
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  return `file:${path.join(DB_DIR, 'us_rx.db').replace(/\\/g, '/')}`;
}

let _client: DbClient | null = null;
let _schemaInitialized = false;

export function getDb(): DbClient {
  if (!_client) {
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      const url = process.env.DATABASE_URL || process.env.POSTGRES_URL!;
      _client = new NeonClientAdapter(url);
    } else {
      const url = getDatabaseUrl();
      const authToken = process.env.TURSO_AUTH_TOKEN;
      _client = createClient({ url, authToken }) as unknown as DbClient;
    }
  }
  return _client;
}

export async function ensureSchema(client: DbClient) {
  if (_schemaInitialized) return;

  try {
    const isPostgres = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
    const checkSql = isPostgres
      ? `SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users'`
      : `SELECT 1 FROM sqlite_master WHERE type='table' AND name='admin_users'`;

    const tableCheck = await client.execute(checkSql);
    if (tableCheck.rows.length > 0) {
      const adminCount = await client.execute(`SELECT COUNT(*) as count FROM admin_users`);
      if (Number(adminCount.rows[0].count) > 0) {
        _schemaInitialized = true;
        return;
      }
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
