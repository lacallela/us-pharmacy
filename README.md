# RxMatch US — Prescription Savings & Telehealth Traffic Engine 💊🇺🇸

A standalone, high-conversion US healthcare affiliate & programmatic SEO traffic generation platform (GoodRx / SingleCare / Cost Plus Drugs model).

---

## 🇺🇸 US Market Specifics & Features

1. **Brand vs. Generic Price Comparison Matrix (Save up to 98%):**
   - Direct price comparison between costly US brand-name retail prescriptions and FDA-approved bioequivalent generics:
     - Lipitor ($185.00) vs Atorvastatin ($7.20) — **Save 96%**
     - Zoloft ($115.00) vs Sertraline ($6.50) — **Save 94%**
     - Viagra ($780.00) vs Sildenafil ($14.50) — **Save 98%**
     - Zyrtec ($28.99) vs Cetirizine ($6.99) — **Save 75%**
2. **High-Ticket Telehealth & GLP-1 Weight Loss Funnel:**
   - Dedicated screener for affordable compounded Semaglutide starting at **$199/mo** (vs $948/mo Ozempic), routing traffic to high-paying US telehealth networks (Ro, Hims) at **$100–$250 CPA**.
3. **Interactive Clinical Screeners (`/quiz`):**
   - *Free Rx Coupon & Drug Price Checker*
   - *GLP-1 Weight Loss & Telehealth Eligibility Screener*
   - *Seasonal Allergy & Sinus Relief Guide*
   - Outputs printable & digital Rx discount card (BIN 015995, PCN GDC, GROUP RXMATCH).
4. **Smart US Affiliate Router (`/go/[pharmacy]`):**
   - Routes users to **CVS Pharmacy**, **Walgreens**, **Walmart $4 List**, **Amazon Pharmacy**, **Cost Plus Drugs**, and **Ro Telehealth** with tracked subids and real-time click logging.
5. **Real-Time USD Revenue & EPC Analytics (`/admin`):**
   - Live click stream, top-performing prescriptions, traffic breakdown by UTM channel, and estimated revenue in USD.
6. **Automated Python Feeder (`scripts/import_us_feed.py`):**
   - Command-line tool to ingest US National Drug Code (NDC) and pharmacy affiliate pricing CSV feeds.

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components, TypeScript, Tailwind CSS)
- **Database:** SQLite 3 (`node:sqlite` Native Driver, zero external database setup required, persistent in `data/us_rx.db`)
- **Port:** Configured to run on **Port 3001** (leaving Port 3000 free for the Russian pharmacy project and 3002 for the psychologist landing).
- **SEO & Structured Data:** Schema.org `Drug` & `AggregateOffer` in USD ($), dynamic XML Sitemap, and robots.txt.

---

## 🚀 Quickstart Guide

```bash
cd D:\medtest\us-pharmacy

# 1. Seed or re-populate FDA drug database:
npm run seed

# 2. Start development server (Port 3001):
npm run dev

# 3. Production build and run:
npm run build
npm start
```

Open in your browser: **http://localhost:3001**

---

## 📍 Route Index

| Route | Purpose |
|---|---|
| `/` | Homepage with Rx search, savings matrix, GLP-1 banner |
| `/drugs` | Complete US prescription & generic catalog with category filters |
| `/drugs/[slug]` | PSEO Drug pricing page with CVS/Walgreens/Walmart price table & digital coupon |
| `/compare/[slug1]-vs-[slug2]` | Direct drug comparison (e.g. `lipitor-vs-atorvastatin`) |
| `/quiz` | Clinical savings screeners & coupon generator |
| `/admin` | Real-time US analytics, EPC stats, and live click stream |
| `/go/[pharmacy]?drug=...` | Smart outbound redirect with affiliate cookie & click tracking |
| `/sitemap.xml` | Dynamic US XML Sitemap for Googlebot indexing |
