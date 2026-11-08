const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_PATH = path.join(DB_DIR, 'us_rx.db');

const db = new DatabaseSync(DB_PATH);

console.log('Initializing US Rx schema...');
db.exec(`
  DROP TABLE IF EXISTS drug_pharmacy_prices;
  DROP TABLE IF EXISTS traffic_clicks;
  DROP TABLE IF EXISTS drugs;
  DROP TABLE IF EXISTS pharmacies;
  DROP TABLE IF EXISTS quizzes;
  DROP TABLE IF EXISTS imported_batches;

  CREATE TABLE pharmacies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- retail, online, telehealth
    logo_text TEXT,
    pickup_time TEXT,
    perk_text TEXT,
    base_url TEXT NOT NULL,
    affiliate_param TEXT,
    epc REAL DEFAULT 3.50,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE drugs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    drug_type TEXT NOT NULL, -- Rx, OTC, Telehealth
    category TEXT NOT NULL,
    symptoms TEXT NOT NULL, -- JSON
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
  );

  CREATE TABLE drug_pharmacy_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_id INTEGER NOT NULL,
    pharmacy_id INTEGER NOT NULL,
    cash_price REAL NOT NULL,
    coupon_price REAL NOT NULL,
    in_stock INTEGER DEFAULT 1,
    affiliate_url TEXT,
    FOREIGN KEY (drug_id) REFERENCES drugs(id),
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id)
  );

  CREATE TABLE traffic_clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_id INTEGER,
    pharmacy_id INTEGER,
    source TEXT,
    utm_source TEXT,
    utm_campaign TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE quizzes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    badge TEXT,
    estimated_time TEXT,
    questions_json TEXT NOT NULL
  );

  CREATE TABLE imported_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    source_name TEXT NOT NULL,
    records_count INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_us_drugs_slug ON drugs(slug);
  CREATE INDEX idx_us_drugs_generic ON drugs(generic_name);
  CREATE INDEX idx_us_drugs_category ON drugs(category);
  CREATE INDEX idx_us_clicks_created ON traffic_clicks(created_at);
`);

console.log('Seeding US Pharmacies...');
const pharmacies = [
  {
    slug: 'cvs',
    name: 'CVS Pharmacy',
    type: 'Retail Pharmacy',
    logo_text: 'CVS',
    pickup_time: 'Ready in 15 mins (9,900+ stores)',
    perk_text: 'ExtraCare Rewards & Free Drive-thru Pickup',
    base_url: 'https://www.cvs.com',
    affiliate_param: '?utm_source=rxmatch_us&utm_medium=affiliate&subid=',
    epc: 4.20
  },
  {
    slug: 'walgreens',
    name: 'Walgreens',
    type: 'Retail Pharmacy',
    logo_text: 'Walgreens',
    pickup_time: 'Same-day 30-min pickup',
    perk_text: 'myWalgreens Cash rewards & 24/7 store access',
    base_url: 'https://www.walgreens.com',
    affiliate_param: '?utm_source=rxmatch_us&aff_id=us_rx&clickid=',
    epc: 3.90
  },
  {
    slug: 'walmart',
    name: 'Walmart Pharmacy',
    type: 'Big Box Retail',
    logo_text: 'Walmart',
    pickup_time: 'Curbside or inside pickup',
    perk_text: '$4 for 30-day supply & $10 for 90-day generics',
    base_url: 'https://www.walmart.com/pharmacy',
    affiliate_param: '?partner=rxmatch_us&source=rx_coupon&sub=',
    epc: 3.40
  },
  {
    slug: 'amazon-pharmacy',
    name: 'Amazon Pharmacy',
    type: 'Mail Order Delivery',
    logo_text: 'Amazon Rx',
    pickup_time: 'Free 2-day delivery to your door',
    perk_text: 'Prime RxPass: $5/month for unlimited eligible meds',
    base_url: 'https://pharmacy.amazon.com',
    affiliate_param: '?tag=rxmatch-20&linkCode=as2&subid=',
    epc: 6.80
  },
  {
    slug: 'cost-plus',
    name: 'Cost Plus Drugs (Mark Cuban)',
    type: 'Direct Wholesale',
    logo_text: 'Cost Plus',
    pickup_time: 'Direct home delivery in 3-5 days',
    perk_text: 'Zero middlemen: Actual manufacturing cost + 15%',
    base_url: 'https://costplusdrugs.com',
    affiliate_param: '?ref=rxmatch_us&campaign=transparent_pricing&uid=',
    epc: 5.10
  },
  {
    slug: 'ro-telehealth',
    name: 'Ro Healthcare (Telehealth)',
    type: 'Telehealth & Online Rx',
    logo_text: 'Ro',
    pickup_time: 'Online doctor consult + discreet delivery',
    perk_text: 'GLP-1 Weight Loss & Hair/Men’s health without insurance',
    base_url: 'https://ro.co',
    affiliate_param: '?utm_source=rxmatch_cpa&utm_medium=affiliate&cpa_token=',
    epc: 18.50 // High Telehealth CPA ($100-$250 bounty payout average)
  }
];

const insertPharmacy = db.prepare(`
  INSERT INTO pharmacies (slug, name, type, logo_text, pickup_time, perk_text, base_url, affiliate_param, epc)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const p of pharmacies) {
  insertPharmacy.run(p.slug, p.name, p.type, p.logo_text, p.pickup_time, p.perk_text, p.base_url, p.affiliate_param, p.epc);
}

console.log('Seeding US FDA Drugs & Generic Alternatives...');
const drugsData = [
  // 1. Cholesterol & Heart
  {
    slug: 'lipitor',
    name: 'Lipitor (Brand)',
    generic_name: 'Atorvastatin Calcium',
    drug_type: 'Rx',
    category: 'Cholesterol & Heart',
    symptoms: JSON.stringify(['high cholesterol', 'heart disease prevention', 'atherosclerosis', 'cardiovascular risk']),
    dosage: '20mg, 30 tablets',
    form: 'Oral Tablet',
    manufacturer: 'Pfizer Inc.',
    brand_price: 185.00,
    generic_cash_price: 8.90,
    coupon_code: 'LIPITOR95',
    description: 'Lipitor is an FDA-approved HMG-CoA reductase inhibitor (statin) used to lower bad cholesterol (LDL) and triglycerides in the blood, while increasing good cholesterol (HDL).',
    fda_indications: 'Hypercholesterolemia, prevention of cardiovascular disease, reduction of risk of stroke and myocardial infarction.',
    contraindications: 'Active liver disease, unexplained persistent elevations in hepatic transaminases, pregnancy, and nursing mothers.',
    how_to_use: 'Take once daily at the same time every day, with or without food. Avoid excessive intake of grapefruit juice.',
    side_effects: 'Mild muscle ache, joint pain, diarrhea, and slight increase in blood sugar levels.',
    rating: 4.8,
    clicks_count: 1420,
    is_trending: 1
  },
  {
    slug: 'atorvastatin',
    name: 'Atorvastatin (Generic Lipitor)',
    generic_name: 'Atorvastatin Calcium',
    drug_type: 'Rx',
    category: 'Cholesterol & Heart',
    symptoms: JSON.stringify(['high cholesterol', 'heart disease prevention']),
    dosage: '20mg, 30 tablets',
    form: 'Oral Tablet',
    manufacturer: 'Teva / Sandoz Generics',
    brand_price: 185.00,
    generic_cash_price: 7.20,
    coupon_code: 'STATIN96',
    description: 'Direct FDA-approved generic equivalent of Lipitor. Contains identical active ingredient, potency, bioequivalence, and safety profile at 96% lower retail cost.',
    fda_indications: 'Primary hyperlipidemia, cardiovascular risk reduction in adults.',
    contraindications: 'Severe hepatic impairment, pregnancy, hypersensitivity to atorvastatin.',
    how_to_use: 'Take 1 tablet daily. Routine lipid panel tests recommended every 6 to 12 months.',
    side_effects: 'Occasional mild muscle soreness.',
    rating: 4.9,
    clicks_count: 3120,
    is_trending: 1
  },

  // 2. GLP-1 & Weight Management
  {
    slug: 'ozempic',
    name: 'Ozempic (Brand Pen)',
    generic_name: 'Semaglutide Injection',
    drug_type: 'Rx',
    category: 'Weight Loss & GLP-1',
    symptoms: JSON.stringify(['type 2 diabetes', 'obesity', 'excess weight', 'insulin resistance']),
    dosage: '2mg/3mL (0.5mg or 1mg weekly dose)',
    form: 'Prefilled Subcutaneous Pen',
    manufacturer: 'Novo Nordisk',
    brand_price: 948.00,
    generic_cash_price: 299.00,
    coupon_code: 'GLP1SAVE',
    description: 'A weekly GLP-1 receptor agonist that slows stomach emptying, reduces hunger cravings, and significantly regulates blood sugar levels.',
    fda_indications: 'Type 2 Diabetes mellitus; off-label for chronic weight management and obesity.',
    contraindications: 'Personal or family history of medullary thyroid carcinoma (MTC) or Multiple Endocrine Neoplasia syndrome type 2 (MEN 2).',
    how_to_use: 'Inject subcutaneously once weekly in abdomen, thigh, or upper arm on the same day each week.',
    side_effects: 'Nausea, vomiting, diarrhea, abdominal discomfort, constipation (especially when escalating dose).',
    rating: 4.9,
    clicks_count: 4890,
    is_trending: 1
  },
  {
    slug: 'compounded-semaglutide',
    name: 'Compounded Semaglutide (Telehealth)',
    generic_name: 'Semaglutide + B12 (Cyanocobalamin)',
    drug_type: 'Telehealth',
    category: 'Weight Loss & GLP-1',
    symptoms: JSON.stringify(['weight loss', 'obesity', 'high BMI', 'metabolic health']),
    dosage: 'Monthly Supply (Tailored Dose)',
    form: 'Subcutaneous Injectable Vial',
    manufacturer: 'FDA-Regulated 503A/503B Compounder',
    brand_price: 948.00,
    generic_cash_price: 199.00,
    coupon_code: 'ROGLP1',
    description: 'Affordable compounded semaglutide formulated by licensed US 503A/503B state-board pharmacies through telehealth platforms (Ro, Hims). Includes physician consult and home delivery.',
    fda_indications: 'Chronic weight management in adults with BMI >= 30, or BMI >= 27 with at least one weight-related comorbid condition.',
    contraindications: 'Pregnancy, history of pancreatitis, thyroid cancer risk.',
    how_to_use: 'Inject weekly with sterile micro-needle as prescribed by your online physician.',
    side_effects: 'Mild transient nausea.',
    rating: 4.8,
    clicks_count: 5670,
    is_trending: 1
  },

  // 3. Mental Health & SSRIs
  {
    slug: 'zoloft',
    name: 'Zoloft (Brand)',
    generic_name: 'Sertraline Hydrochloride',
    drug_type: 'Rx',
    category: 'Mental Health & Mood',
    symptoms: JSON.stringify(['depression', 'generalized anxiety', 'panic attacks', 'PTSD', 'OCD', 'social anxiety']),
    dosage: '50mg, 30 tablets',
    form: 'Oral Tablet',
    manufacturer: 'Pfizer Inc.',
    brand_price: 115.00,
    generic_cash_price: 7.90,
    coupon_code: 'ZOLOFT93',
    description: 'Selective serotonin reuptake inhibitor (SSRI) that restores neurotransmitter chemical balance in the brain to treat depression and major anxiety disorders.',
    fda_indications: 'Major depressive disorder, obsessive-compulsive disorder, panic disorder, posttraumatic stress disorder, social anxiety disorder.',
    contraindications: 'Concomitant use of monoamine oxidase inhibitors (MAOIs) or pimozide.',
    how_to_use: 'Take once daily in morning or evening. Do not stop abruptly without tapering.',
    side_effects: 'Dry mouth, insomnia, mild gastrointestinal upset during initial 2 weeks.',
    rating: 4.7,
    clicks_count: 1890,
    is_trending: 1
  },
  {
    slug: 'sertraline',
    name: 'Sertraline (Generic Zoloft)',
    generic_name: 'Sertraline Hydrochloride',
    drug_type: 'Rx',
    category: 'Mental Health & Mood',
    symptoms: JSON.stringify(['depression', 'generalized anxiety', 'panic disorder']),
    dosage: '50mg, 30 tablets',
    form: 'Oral Tablet',
    manufacturer: 'Aurobindo / Lupin Pharma',
    brand_price: 115.00,
    generic_cash_price: 6.50,
    coupon_code: 'SAVERXSER',
    description: 'Direct bioequivalent generic for Zoloft. One of the most prescribed medications in the United States, available for under $7 cash at major retail pharmacies.',
    fda_indications: 'Anxiety, depression, OCD, PMDD.',
    contraindications: 'MAOI use within 14 days.',
    how_to_use: 'Take 1 tablet daily with food or water.',
    side_effects: 'Mild dizziness, transient sleepiness.',
    rating: 4.8,
    clicks_count: 2430,
    is_trending: 0
  },

  // 4. Men's Health & ED
  {
    slug: 'viagra',
    name: 'Viagra (Brand)',
    generic_name: 'Sildenafil Citrate',
    drug_type: 'Rx',
    category: "Men's Health",
    symptoms: JSON.stringify(['erectile dysfunction', 'performance anxiety', 'blood flow']),
    dosage: '50mg, 10 tablets',
    form: 'Blue Film-Coated Tablet',
    manufacturer: 'Viatris / Pfizer',
    brand_price: 780.00, // ~$78 per pill
    generic_cash_price: 18.00, // ~$1.80 per pill
    coupon_code: 'EDSAVE98',
    description: 'The iconic phosphodiesterase type 5 (PDE5) inhibitor that increases blood flow to the penis during sexual stimulation.',
    fda_indications: 'Erectile dysfunction (ED) in adult males.',
    contraindications: 'Never use with organic nitrates (nitroglycerin for heart conditions) or riociguat due to dangerous blood pressure drops.',
    how_to_use: 'Take 1 tablet approximately 30 to 60 minutes before sexual activity. Works up to 4 to 6 hours.',
    side_effects: 'Facial flushing, headache, nasal congestion, indigestion.',
    rating: 4.9,
    clicks_count: 2780,
    is_trending: 1
  },
  {
    slug: 'sildenafil',
    name: 'Sildenafil (Generic Viagra)',
    generic_name: 'Sildenafil Citrate',
    drug_type: 'Rx',
    category: "Men's Health",
    symptoms: JSON.stringify(['erectile dysfunction', 'male performance']),
    dosage: '50mg, 30 tablets',
    form: 'White Oral Tablet',
    manufacturer: 'Greenstone / Teva',
    brand_price: 780.00,
    generic_cash_price: 14.50,
    coupon_code: 'EDGENERIC',
    description: 'Exact molecular equivalent of brand Viagra. Saves men over 98% per pill compared to the brand name.',
    fda_indications: 'Treatment of erectile dysfunction.',
    contraindications: 'Nitrate medications, severe cardiovascular disease.',
    how_to_use: 'Take as needed 45 minutes prior to intimacy.',
    side_effects: 'Mild facial warmth or flushing.',
    rating: 4.9,
    clicks_count: 3890,
    is_trending: 1
  },

  // 5. Allergy & Sinus (OTC / Rx)
  {
    slug: 'zyrtec',
    name: 'Zyrtec (Brand 24-Hr)',
    generic_name: 'Cetirizine Hydrochloride',
    drug_type: 'OTC',
    category: 'Allergy & Sinus',
    symptoms: JSON.stringify(['seasonal allergies', 'runny nose', 'itchy watery eyes', 'sneezing', 'hives']),
    dosage: '10mg, 30 tablets',
    form: 'Oral Tablet',
    manufacturer: 'Johnson & Johnson Kenvue',
    brand_price: 28.99,
    generic_cash_price: 6.99,
    coupon_code: 'ALLERGY75',
    description: 'Second-generation non-drowsy antihistamine that blocks histamine release from pollen, pet dander, dust mites, and mold.',
    fda_indications: 'Relief of outdoor and indoor allergy symptoms and chronic urticaria (itchy rash).',
    contraindications: 'Severe end-stage renal impairment.',
    how_to_use: 'Adults: take one 10mg tablet once daily with water. Do not exceed recommended dosage.',
    side_effects: 'Rare mild drowsiness in sensitive individuals.',
    rating: 4.8,
    clicks_count: 1650,
    is_trending: 1
  },
  {
    slug: 'cetirizine-generic',
    name: 'Cetirizine HCl (Generic Zyrtec)',
    generic_name: 'Cetirizine Hydrochloride',
    drug_type: 'OTC',
    category: 'Allergy & Sinus',
    symptoms: JSON.stringify(['hay fever', 'seasonal allergies', 'itchy eyes', 'sneezing']),
    dosage: '10mg, 100 tablets (Value Pack)',
    form: 'Oral Tablet',
    manufacturer: 'Major Pharmaceuticals / Kirkland',
    brand_price: 28.99,
    generic_cash_price: 8.50,
    coupon_code: 'VALUEALLERGY',
    description: 'Same 24-hour allergy relief as Zyrtec with 3 times more tablets for a fraction of the cost.',
    fda_indications: 'Allergic rhinitis and hives.',
    contraindications: 'Hypersensitivity to hydroxyzine or cetirizine.',
    how_to_use: '1 tablet daily.',
    side_effects: 'Minimal.',
    rating: 4.9,
    clicks_count: 2210,
    is_trending: 1
  },

  // 6. Gastro & Acid Reflux
  {
    slug: 'prilosec-otc',
    name: 'Prilosec OTC (Brand)',
    generic_name: 'Omeprazole Delayed-Release',
    drug_type: 'OTC',
    category: 'Acid Reflux & GERD',
    symptoms: JSON.stringify(['frequent heartburn', 'acid reflux', 'GERD', 'stomach burning']),
    dosage: '20mg, 42 tablets (3x 14-day courses)',
    form: 'Delayed-Release Tablet',
    manufacturer: 'Procter & Gamble',
    brand_price: 27.50,
    generic_cash_price: 9.90,
    coupon_code: 'GERD70',
    description: 'Proton pump inhibitor (PPI) that shuts down excess stomach acid pumps at the source for round-the-clock 24-hour relief from painful heartburn.',
    fda_indications: 'Frequent heartburn occurring 2 or more days a week.',
    contraindications: 'Trouble or pain swallowing food, vomiting with blood, or bloody/black stools (see doctor immediately).',
    how_to_use: 'Take 1 tablet every morning before eating for 14 days. Do not chew or crush.',
    side_effects: 'Headache, stomach pain, diarrhea.',
    rating: 4.7,
    clicks_count: 1140,
    is_trending: 0
  },
  {
    slug: 'omeprazole-generic',
    name: 'Omeprazole (Generic Prilosec)',
    generic_name: 'Omeprazole',
    drug_type: 'OTC',
    category: 'Acid Reflux & GERD',
    symptoms: JSON.stringify(['heartburn', 'acid indigestion']),
    dosage: '20mg, 42 capsules',
    form: 'Capsule',
    manufacturer: 'Dr. Reddy’s / Perrigo',
    brand_price: 27.50,
    generic_cash_price: 8.20,
    coupon_code: 'SAVEGERD',
    description: 'Generic bioequivalent of Prilosec with identical acid suppression and clinical outcomes.',
    fda_indications: 'Heartburn treatment.',
    contraindications: 'Known allergy to PPIs.',
    how_to_use: 'Take with a glass of water before breakfast.',
    side_effects: 'None in most patients.',
    rating: 4.8,
    clicks_count: 1530,
    is_trending: 0
  },

  // 7. Pain & Inflammation
  {
    slug: 'advil',
    name: 'Advil Liqui-Gels (Brand)',
    generic_name: 'Ibuprofen Solubilized',
    drug_type: 'OTC',
    category: 'Pain & Inflammation',
    symptoms: JSON.stringify(['headache', 'backache', 'fever', 'arthritis', 'menstrual cramps', 'toothache']),
    dosage: '200mg, 80 capsules',
    form: 'Liquid Filled Capsule',
    manufacturer: 'Haleon US',
    brand_price: 15.99,
    generic_cash_price: 4.49,
    coupon_code: 'PAIN75',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID) designed to target the site of inflammation and rapidly block pain signals.',
    fda_indications: 'Temporary relief of minor aches, pains, headaches, and fever reduction.',
    contraindications: 'Active stomach ulcers, bleeding disorders, severe heart disease, or during third trimester of pregnancy.',
    how_to_use: 'Adults: take 1 to 2 capsules every 4 to 6 hours while symptoms persist. Do not exceed 6 capsules in 24 hours.',
    side_effects: 'Mild stomach upset (take with food or milk to minimize).',
    rating: 4.8,
    clicks_count: 980,
    is_trending: 0
  },
  {
    slug: 'ibuprofen-generic',
    name: 'Ibuprofen (Generic Advil / Motrin)',
    generic_name: 'Ibuprofen',
    drug_type: 'OTC',
    category: 'Pain & Inflammation',
    symptoms: JSON.stringify(['pain relief', 'fever reducer', 'muscle ache']),
    dosage: '200mg, 100 tablets',
    form: 'Brown Coated Tablet',
    manufacturer: 'Major Pharmaceuticals',
    brand_price: 15.99,
    generic_cash_price: 3.29,
    coupon_code: 'SAVEPAIN',
    description: 'Exact same active ingredient as brand Advil. Standard first-line pain reliever recommended by US healthcare providers.',
    fda_indications: 'Pain and fever reduction.',
    contraindications: 'Aspirin allergy, third trimester pregnancy.',
    how_to_use: '1-2 tablets with food.',
    side_effects: 'Mild gastrointestinal discomfort.',
    rating: 4.7,
    clicks_count: 1720,
    is_trending: 1
  }
];

const insertDrug = db.prepare(`
  INSERT INTO drugs (
    slug, name, generic_name, drug_type, category, symptoms, dosage, form,
    manufacturer, brand_price, generic_cash_price, coupon_code, description,
    fda_indications, contraindications, how_to_use, side_effects, rating, clicks_count, is_trending
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const d of drugsData) {
  insertDrug.run(
    d.slug, d.name, d.generic_name, d.drug_type, d.category, d.symptoms,
    d.dosage, d.form, d.manufacturer, d.brand_price, d.generic_cash_price,
    d.coupon_code, d.description, d.fda_indications, d.contraindications,
    d.how_to_use, d.side_effects, d.rating, d.clicks_count, d.is_trending
  );
}

console.log('Generating pharmacy price comparisons & coupon cards...');
const insertedDrugs = db.prepare('SELECT id, slug, brand_price, generic_cash_price, drug_type FROM drugs').all();
const pharmacyRows = db.prepare('SELECT id, slug, base_url, affiliate_param FROM pharmacies').all();

const insertOffer = db.prepare(`
  INSERT INTO drug_pharmacy_prices (drug_id, pharmacy_id, cash_price, coupon_price, in_stock, affiliate_url)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const drug of insertedDrugs) {
  for (const ph of pharmacyRows) {
    // Pricing variations across US retailers
    let cashMult = 1.0;
    let couponMult = 1.0;

    if (ph.slug === 'walmart') {
      cashMult = 0.90;
      couponMult = 0.88;
    } else if (ph.slug === 'amazon-pharmacy') {
      cashMult = 0.95;
      couponMult = 0.92;
    } else if (ph.slug === 'cost-plus') {
      cashMult = 0.85;
      couponMult = 0.80;
    } else if (ph.slug === 'cvs') {
      cashMult = 1.05;
      couponMult = 1.00;
    } else if (ph.slug === 'walgreens') {
      cashMult = 1.03;
      couponMult = 0.98;
    } else if (ph.slug === 'ro-telehealth') {
      cashMult = 1.10;
      couponMult = 0.85;
    }

    const cashPrice = Number((drug.generic_cash_price * cashMult).toFixed(2));
    const couponPrice = Number((drug.generic_cash_price * couponMult * 0.92).toFixed(2));
    const affUrl = `${ph.base_url}/search?q=${drug.slug}${ph.affiliate_param}rx_lead`;

    insertOffer.run(drug.id, ph.id, cashPrice, couponPrice, 1, affUrl);
  }
}

console.log('Inserting US High-Converting Quizzes...');
const quizzes = [
  {
    id: 'rx-savings-finder',
    title: 'Free Rx Coupon & Drug Price Checker',
    subtitle: 'Find the lowest cash price in your ZIP code without needing insurance',
    badge: 'GoodRx Model • 1 Min',
    estimated_time: '1 minute',
    questions_json: JSON.stringify([
      {
        id: 'drug_interest',
        question: 'Which prescription medication are you looking to fill or refill?',
        options: [
          { label: 'Cholesterol & Heart (Lipitor / Atorvastatin)', value: 'cholesterol', matchSlug: 'atorvastatin' },
          { label: 'Weight Loss & GLP-1 (Ozempic / Semaglutide)', value: 'weight_loss', matchSlug: 'compounded-semaglutide' },
          { label: 'Anxiety & Depression (Zoloft / Sertraline)', value: 'mental_health', matchSlug: 'sertraline' },
          { label: "Men's Health & ED (Viagra / Sildenafil)", value: 'ed', matchSlug: 'sildenafil' },
          { label: 'Allergies & Sinus (Zyrtec / Cetirizine)', value: 'allergy', matchSlug: 'cetirizine-generic' }
        ]
      },
      {
        id: 'insurance_status',
        question: 'What is your current prescription insurance status?',
        options: [
          { label: 'No insurance (Uninsured / Self-pay cash)', value: 'uninsured' },
          { label: 'High deductible plan (Medication not covered yet)', value: 'high_deductible' },
          { label: 'Insurance copay is too high ($50+)', value: 'high_copay' },
          { label: 'Medicare Part D donut hole gap', value: 'medicare' }
        ]
      },
      {
        id: 'delivery_preference',
        question: 'How do you prefer to get your prescription filled?',
        options: [
          { label: 'Instant pickup today at local pharmacy (CVS, Walgreens, Walmart)', value: 'local_pickup' },
          { label: 'Free discreet 2-day home delivery (Amazon Pharmacy / Ro)', value: 'home_delivery' },
          { label: 'Wholesale online mail-order (Cost Plus Drugs)', value: 'wholesale' }
        ]
      }
    ])
  },
  {
    id: 'glp1-eligibility-screener',
    title: 'GLP-1 Weight Loss & Telehealth Eligibility Screener',
    subtitle: 'Check your eligibility for medical Semaglutide & Tirzepatide prescriptions online',
    badge: 'High CPA Telehealth • 2 Min',
    estimated_time: '2 minutes',
    questions_json: JSON.stringify([
      {
        id: 'bmi_range',
        question: 'What is your estimated Body Mass Index (BMI) or weight goal?',
        options: [
          { label: 'BMI 30+ (Looking to lose 25+ lbs for health)', value: 'bmi_30_plus', matchSlug: 'compounded-semaglutide' },
          { label: 'BMI 27–29 with high blood pressure, cholesterol, or A1C', value: 'bmi_27_plus', matchSlug: 'compounded-semaglutide' },
          { label: 'Looking to maintain current weight', value: 'maintenance' }
        ]
      },
      {
        id: 'past_efforts',
        question: 'Have you attempted diet and exercise modifications previously?',
        options: [
          { label: 'Yes, tried multiple diets with constant biological food noise / rebound weight', value: 'rebound_weight' },
          { label: 'Yes, but need medical metabolic support to break through plateaus', value: 'plateau' },
          { label: 'First time starting a medical weight journey', value: 'first_time' }
        ]
      },
      {
        id: 'health_history',
        question: 'Do you have any personal or family history of medullary thyroid cancer?',
        options: [
          { label: 'No, completely clear of thyroid cancer history', value: 'clear' },
          { label: 'Yes, or history of MEN-2 syndrome (requires physician clearance)', value: 'has_history' }
        ]
      }
    ])
  },
  {
    id: 'allergy-otc-guide',
    title: 'Seasonal Allergy & Sinus Relief Guide',
    subtitle: 'Find the right non-drowsy antihistamine and save up to 75% on retail brand names',
    badge: 'Quick OTC Match • 1 Min',
    estimated_time: '1 minute',
    questions_json: JSON.stringify([
      {
        id: 'primary_symptom',
        question: 'What is your most frustrating allergy symptom?',
        options: [
          { label: 'Itchy, watery eyes and sneezing fits', value: 'eyes_sneezing', matchSlug: 'cetirizine-generic' },
          { label: 'Severe nasal congestion and sinus pressure', value: 'sinus_pressure' },
          { label: 'Itchy skin rash, hives, or pet dander reaction', value: 'hives', matchSlug: 'cetirizine-generic' }
        ]
      },
      {
        id: 'drowsiness_concern',
        question: 'Do you need 100% non-drowsy daytime performance?',
        options: [
          { label: 'Yes, need to drive, work, and focus with zero sedation', value: 'non_drowsy' },
          { label: 'Nighttime relief is okay if it helps me sleep', value: 'nighttime' }
        ]
      }
    ])
  }
];

const insertQuiz = db.prepare(`
  INSERT INTO quizzes (id, title, subtitle, badge, estimated_time, questions_json)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const q of quizzes) {
  insertQuiz.run(q.id, q.title, q.subtitle, q.badge, q.estimated_time, q.questions_json);
}

console.log('Generating seed US traffic analytics clicks...');
const sources = ['rx_card', 'brand_vs_generic', 'quiz_result', 'search_box', 'compare_matrix'];
const utmSources = ['google_us_search', 'bing_ads', 'tiktok_glp1', 'reddit_supplements', 'direct_coupon'];
const utmCampaigns = ['ozempic_coupon', 'lipitor_generic', 'cheap_viagra_cash', 'walmart_4_dollar', 'allergy_season'];

const insertClick = db.prepare(`
  INSERT INTO traffic_clicks (drug_id, pharmacy_id, source, utm_source, utm_campaign, ip, user_agent, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
`);

for (let i = 0; i < 320; i++) {
  const randomDrug = insertedDrugs[Math.floor(Math.random() * insertedDrugs.length)];
  const randomPharm = pharmacyRows[Math.floor(Math.random() * pharmacyRows.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];
  const utmSource = utmSources[Math.floor(Math.random() * utmSources.length)];
  const utmCamp = utmCampaigns[Math.floor(Math.random() * utmCampaigns.length)];
  const randomHourOffset = `-${Math.floor(Math.random() * 96)} hours`;

  insertClick.run(
    randomDrug.id,
    randomPharm.id,
    source,
    utmSource,
    utmCamp,
    `68.180.228.${Math.floor(Math.random() * 255)}`,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15',
    randomHourOffset
  );
}

console.log('US Rx Database successfully seeded!');
