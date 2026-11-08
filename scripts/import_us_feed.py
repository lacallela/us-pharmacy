#!/usr/bin/env python3
"""
RxMatch US NDC & Pharmacy Feed Importer
Imports US FDA prescription and OTC drug data directly into us_rx.db SQLite database.
"""

import sys
import os
import csv
import json
import sqlite3
import re
from pathlib import Path

# Ensure UTF-8 console output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "us_rx.db"

def slugify(text: str) -> str:
    s = text.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s or "us-drug"

def import_us_csv(file_path: str):
    if not os.path.exists(file_path):
        print(f"[ERROR] File not found: {file_path}")
        return

    print(f"[*] Opening US Pharmacy CSV feed: {file_path}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    count = 0
    with open(file_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("name", "").strip()
            if not name:
                continue

            generic_name = row.get("generic_name", name).strip()
            drug_type = row.get("drug_type", "Rx").strip()
            category = row.get("category", "General Health").strip()
            dosage = row.get("dosage", "Standard").strip()
            form = row.get("form", "Tablet").strip()
            manufacturer = row.get("manufacturer", "US Generics Inc.").strip()
            brand_price = float(row.get("brand_price", 100.0))
            generic_cash_price = float(row.get("generic_cash_price", 12.0))
            coupon_code = row.get("coupon_code", "RXSAVER80").strip()
            description = row.get("description", "FDA-approved medication.").strip()
            fda_indications = row.get("fda_indications", "Per physician prescription.").strip()
            contraindications = row.get("contraindications", "Known hypersensitivity.").strip()
            how_to_use = row.get("how_to_use", "Take as directed by doctor.").strip()
            side_effects = row.get("side_effects", "Consult physician.").strip()

            symptoms_raw = row.get("symptoms", "")
            if symptoms_raw.startswith("["):
                symptoms_json = symptoms_raw
            else:
                symptoms_list = [s.strip() for s in symptoms_raw.split(";") if s.strip()]
                symptoms_json = json.dumps(symptoms_list)

            slug = row.get("slug") or slugify(f"{name}-{dosage}")

            cursor.execute("""
                INSERT INTO drugs (
                    slug, name, generic_name, drug_type, category, symptoms, dosage, form,
                    manufacturer, brand_price, generic_cash_price, coupon_code, description,
                    fda_indications, contraindications, how_to_use, side_effects, is_trending
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                ON CONFLICT(slug) DO UPDATE SET
                    brand_price = excluded.brand_price,
                    generic_cash_price = excluded.generic_cash_price,
                    name = excluded.name
            """, (
                slug, name, generic_name, drug_type, category, symptoms_json, dosage, form,
                manufacturer, brand_price, generic_cash_price, coupon_code, description,
                fda_indications, contraindications, how_to_use, side_effects
            ))
            count += 1

    cursor.execute("""
        INSERT INTO imported_batches (filename, source_name, records_count)
        VALUES (?, 'US NDC CSV Importer', ?)
    """, (os.path.basename(file_path), count))

    conn.commit()
    conn.close()
    print(f"[OK] Successfully imported/updated {count} US medications into us_rx.db.")

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/import_us_feed.py <path_to_file.csv>")
        print("Example: python scripts/import_us_feed.py data/sample_us_ndc_feed.csv")
        return

    import_us_csv(sys.argv[1])

if __name__ == "__main__":
    main()
