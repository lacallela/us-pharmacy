import { getDb, ensureSchema, Drug, Pharmacy, DrugPriceOffer, SiteSettingItem, AdminUser } from './db';

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function getAllDrugs(): Promise<Drug[]> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute(`
    SELECT * FROM drugs ORDER BY is_trending DESC, clicks_count DESC
  `);
  return toPlain(res.rows) as unknown as Drug[];
}

export async function getTrendingDrugs(limit = 8): Promise<Drug[]> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute({
    sql: `SELECT * FROM drugs ORDER BY is_trending DESC, clicks_count DESC LIMIT ?`,
    args: [limit]
  });
  return toPlain(res.rows) as unknown as Drug[];
}

export async function getDrugBySlug(slug: string): Promise<Drug | null> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute({
    sql: `SELECT * FROM drugs WHERE slug = ?`,
    args: [slug]
  });
  return res.rows[0] ? (toPlain(res.rows[0]) as unknown as Drug) : null;
}

export async function getDrugById(id: number): Promise<Drug | null> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute({
    sql: `SELECT * FROM drugs WHERE id = ?`,
    args: [id]
  });
  return res.rows[0] ? (toPlain(res.rows[0]) as unknown as Drug) : null;
}

export async function getGenericAlternatives(genericName: string, currentSlug: string): Promise<Drug[]> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute({
    sql: `SELECT * FROM drugs WHERE generic_name = ? AND slug != ? ORDER BY generic_cash_price ASC`,
    args: [genericName, currentSlug]
  });
  return toPlain(res.rows) as unknown as Drug[];
}

export async function getPharmacyOffersForDrug(drugId: number): Promise<DrugPriceOffer[]> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute({
    sql: `
      SELECT 
        o.id,
        o.drug_id,
        o.pharmacy_id,
        p.name AS pharmacy_name,
        p.slug AS pharmacy_slug,
        p.type AS pharmacy_type,
        p.pickup_time,
        p.perk_text,
        o.cash_price,
        o.coupon_price,
        o.in_stock,
        o.affiliate_url
      FROM drug_pharmacy_prices o
      JOIN pharmacies p ON o.pharmacy_id = p.id
      WHERE o.drug_id = ? AND p.is_active = 1
      ORDER BY o.coupon_price ASC
    `,
    args: [drugId]
  });
  return toPlain(res.rows) as unknown as DrugPriceOffer[];
}

export async function getAllPharmacies(): Promise<Pharmacy[]> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute(`
    SELECT * FROM pharmacies WHERE is_active = 1 ORDER BY epc DESC
  `);
  return toPlain(res.rows) as unknown as Pharmacy[];
}

export async function getAllPharmaciesAdmin(): Promise<Pharmacy[]> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute(`
    SELECT * FROM pharmacies ORDER BY id ASC
  `);
  return toPlain(res.rows) as unknown as Pharmacy[];
}

export async function getPharmacyById(id: number): Promise<Pharmacy | null> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute({
    sql: `SELECT * FROM pharmacies WHERE id = ?`,
    args: [id]
  });
  return res.rows[0] ? (toPlain(res.rows[0]) as unknown as Pharmacy) : null;
}

export async function searchDrugs(query: string): Promise<Drug[]> {
  const q = query.toLowerCase().trim();
  const all = await getAllDrugs();
  if (!q) return all;
  return all.filter((d) => 
    d.name.toLowerCase().includes(q) ||
    d.generic_name.toLowerCase().includes(q) ||
    d.category.toLowerCase().includes(q) ||
    (d.symptoms && d.symptoms.toLowerCase().includes(q))
  );
}

export async function getCategoriesWithCounts(): Promise<{ category: string; count: number }[]> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute(`
    SELECT category, COUNT(*) as count 
    FROM drugs 
    GROUP BY category 
    ORDER BY count DESC
  `);
  return toPlain(res.rows) as unknown as { category: string; count: number }[];
}

export async function getAllQuizzes() {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute(`SELECT * FROM quizzes`);
  return toPlain(res.rows);
}

export async function getQuizById(id: string) {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute({
    sql: `SELECT * FROM quizzes WHERE id = ?`,
    args: [id]
  });
  return res.rows[0] ? toPlain(res.rows[0]) : null;
}

export async function recordTrafficClick(data: {
  drugId?: number;
  pharmacyId?: number;
  source?: string;
  utmSource?: string;
  utmCampaign?: string;
  ip?: string;
  userAgent?: string;
}) {
  const db = getDb();
  await ensureSchema(db);
  await db.execute({
    sql: `
      INSERT INTO traffic_clicks (drug_id, pharmacy_id, source, utm_source, utm_campaign, ip, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      data.drugId || null,
      data.pharmacyId || null,
      data.source || 'direct',
      data.utmSource || null,
      data.utmCampaign || null,
      data.ip || '127.0.0.1',
      data.userAgent || 'unknown'
    ]
  });

  if (data.drugId) {
    await db.execute({
      sql: `UPDATE drugs SET clicks_count = clicks_count + 1 WHERE id = ?`,
      args: [data.drugId]
    });
  }
}

export async function getAnalyticsStats() {
  const db = getDb();
  await ensureSchema(db);
  
  const cTotal = await db.execute(`SELECT COUNT(*) as count FROM traffic_clicks`);
  const totalClicks = Number(cTotal.rows[0]?.count || 0);

  const dTotal = await db.execute(`SELECT COUNT(*) as count FROM drugs`);
  const totalDrugs = Number(dTotal.rows[0]?.count || 0);

  const pTotal = await db.execute(`SELECT COUNT(*) as count FROM pharmacies`);
  const totalPharmacies = Number(pTotal.rows[0]?.count || 0);
  
  const srcRes = await db.execute(`
    SELECT source, COUNT(*) as count FROM traffic_clicks GROUP BY source ORDER BY count DESC
  `);
  const clicksBySource = toPlain(srcRes.rows);

  const utmRes = await db.execute(`
    SELECT COALESCE(utm_source, 'direct') as utm_source, COUNT(*) as count 
    FROM traffic_clicks 
    GROUP BY utm_source 
    ORDER BY count DESC 
    LIMIT 5
  `);
  const clicksByUtm = toPlain(utmRes.rows);

  const topRes = await db.execute(`
    SELECT name, generic_name, clicks_count, generic_cash_price, category, brand_price 
    FROM drugs 
    ORDER BY clicks_count DESC 
    LIMIT 6
  `);
  const topDrugs = toPlain(topRes.rows);

  const recentRes = await db.execute(`
    SELECT 
      c.id, c.source, c.utm_source, c.utm_campaign, c.created_at,
      d.name as drug_name,
      p.name as pharmacy_name
    FROM traffic_clicks c
    LEFT JOIN drugs d ON c.drug_id = d.id
    LEFT JOIN pharmacies p ON c.pharmacy_id = p.id
    ORDER BY c.id DESC
    LIMIT 12
  `);
  const recentClicks = toPlain(recentRes.rows);

  const settings = await getSiteSettings();
  const epc = parseFloat(settings['avg_epc_usd'] || '3.85') || 3.85;

  return {
    totalClicks,
    totalDrugs,
    totalPharmacies,
    clicksBySource,
    clicksByUtm,
    topDrugs,
    recentClicks,
    estimatedRevenueUsd: Math.round(totalClicks * epc)
  };
}

// ==================== SITE SETTINGS ====================

export async function getSiteSettings(): Promise<Record<string, string>> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute(`SELECT key, value FROM site_settings`);
  const settings: Record<string, string> = {};
  for (const row of res.rows) {
    settings[String(row.key)] = String(row.value);
  }
  return settings;
}

export async function getAllSiteSettingsList(): Promise<SiteSettingItem[]> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute(`SELECT key, value, description, updated_at FROM site_settings ORDER BY key ASC`);
  return toPlain(res.rows) as unknown as SiteSettingItem[];
}

export async function updateSiteSettings(settings: Record<string, string>): Promise<void> {
  const db = getDb();
  await ensureSchema(db);
  for (const [key, value] of Object.entries(settings)) {
    await db.execute({
      sql: `
        INSERT INTO site_settings (key, value, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET 
          value = excluded.value, 
          updated_at = CURRENT_TIMESTAMP
      `,
      args: [key, String(value)]
    });
  }
}

// ==================== ADMIN USER ====================

export async function findAdminByUsername(username: string): Promise<{ id: number; username: string; password_hash: string; name: string; role: string } | null> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute({
    sql: `SELECT * FROM admin_users WHERE username = ?`,
    args: [username]
  });
  return res.rows[0] ? (toPlain(res.rows[0]) as any) : null;
}

export async function updateAdminPassword(username: string, newPasswordHash: string): Promise<void> {
  const db = getDb();
  await ensureSchema(db);
  await db.execute({
    sql: `UPDATE admin_users SET password_hash = ? WHERE username = ?`,
    args: [newPasswordHash, username]
  });
}

// ==================== DRUG CRUD ====================

export async function createDrug(data: {
  slug: string;
  name: string;
  generic_name: string;
  drug_type: string;
  category: string;
  symptoms?: string;
  dosage: string;
  form: string;
  manufacturer: string;
  brand_price: number;
  generic_cash_price: number;
  coupon_code?: string;
  description: string;
  fda_indications: string;
  contraindications: string;
  how_to_use: string;
  side_effects?: string;
  is_trending?: number;
}): Promise<Drug> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute({
    sql: `
      INSERT INTO drugs (
        slug, name, generic_name, drug_type, category, symptoms,
        dosage, form, manufacturer, brand_price, generic_cash_price,
        coupon_code, description, fda_indications, contraindications,
        how_to_use, side_effects, is_trending
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      data.slug,
      data.name,
      data.generic_name,
      data.drug_type || 'Rx',
      data.category,
      data.symptoms || '[]',
      data.dosage,
      data.form,
      data.manufacturer,
      data.brand_price,
      data.generic_cash_price,
      data.coupon_code || 'RXSAVER80',
      data.description,
      data.fda_indications,
      data.contraindications,
      data.how_to_use,
      data.side_effects || '',
      data.is_trending || 0
    ]
  });

  const id = Number(res.lastInsertRowid);
  const inserted = await getDrugById(id);
  return inserted!;
}

export async function updateDrug(id: number, data: Partial<Drug>): Promise<void> {
  const db = getDb();
  await ensureSchema(db);
  const fields: string[] = [];
  const values: any[] = [];

  const allowed = [
    'slug', 'name', 'generic_name', 'drug_type', 'category', 'symptoms',
    'dosage', 'form', 'manufacturer', 'brand_price', 'generic_cash_price',
    'coupon_code', 'description', 'fda_indications', 'contraindications',
    'how_to_use', 'side_effects', 'is_trending'
  ];

  for (const key of allowed) {
    if (key in data) {
      fields.push(`${key} = ?`);
      values.push((data as any)[key]);
    }
  }

  if (fields.length === 0) return;

  values.push(id);
  await db.execute({
    sql: `UPDATE drugs SET ${fields.join(', ')} WHERE id = ?`,
    args: values
  });
}

export async function deleteDrug(id: number): Promise<void> {
  const db = getDb();
  await ensureSchema(db);
  await db.execute({
    sql: `DELETE FROM drug_pharmacy_prices WHERE drug_id = ?`,
    args: [id]
  });
  await db.execute({
    sql: `DELETE FROM drugs WHERE id = ?`,
    args: [id]
  });
}

// ==================== PHARMACY CRUD ====================

export async function createPharmacy(data: {
  slug: string;
  name: string;
  type: string;
  logo_text?: string;
  pickup_time?: string;
  perk_text?: string;
  base_url: string;
  affiliate_param?: string;
  epc?: number;
  is_active?: number;
}): Promise<Pharmacy> {
  const db = getDb();
  await ensureSchema(db);
  const res = await db.execute({
    sql: `
      INSERT INTO pharmacies (
        slug, name, type, logo_text, pickup_time, perk_text,
        base_url, affiliate_param, epc, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      data.slug,
      data.name,
      data.type,
      data.logo_text || data.name,
      data.pickup_time || 'Same-day pickup',
      data.perk_text || 'Save with digital coupon',
      data.base_url,
      data.affiliate_param || 'subid',
      data.epc ?? 3.50,
      data.is_active ?? 1
    ]
  });

  const id = Number(res.lastInsertRowid);
  const inserted = await getPharmacyById(id);
  return inserted!;
}

export async function updatePharmacy(id: number, data: Partial<Pharmacy>): Promise<void> {
  const db = getDb();
  await ensureSchema(db);
  const fields: string[] = [];
  const values: any[] = [];

  const allowed = [
    'slug', 'name', 'type', 'logo_text', 'pickup_time', 'perk_text',
    'base_url', 'affiliate_param', 'epc', 'is_active'
  ];

  for (const key of allowed) {
    if (key in data) {
      fields.push(`${key} = ?`);
      values.push((data as any)[key]);
    }
  }

  if (fields.length === 0) return;

  values.push(id);
  await db.execute({
    sql: `UPDATE pharmacies SET ${fields.join(', ')} WHERE id = ?`,
    args: values
  });
}

export async function deletePharmacy(id: number): Promise<void> {
  const db = getDb();
  await ensureSchema(db);
  await db.execute({
    sql: `DELETE FROM drug_pharmacy_prices WHERE pharmacy_id = ?`,
    args: [id]
  });
  await db.execute({
    sql: `DELETE FROM pharmacies WHERE id = ?`,
    args: [id]
  });
}
