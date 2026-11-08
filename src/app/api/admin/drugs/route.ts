import { NextResponse } from 'next/server';
import { getAllDrugs, createDrug } from '@/lib/queries';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const drugs = await getAllDrugs();
  return NextResponse.json({ drugs });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.name || !data.slug || !data.generic_name || !data.category) {
      return NextResponse.json(
        { error: 'Name, slug, generic name, and category are required' },
        { status: 400 }
      );
    }

    const newDrug = await createDrug({
      slug: data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'),
      name: data.name.trim(),
      generic_name: data.generic_name.trim(),
      drug_type: data.drug_type || 'Rx',
      category: data.category.trim(),
      symptoms: data.symptoms ? JSON.stringify(data.symptoms) : '[]',
      dosage: data.dosage || '10mg',
      form: data.form || 'tablet',
      manufacturer: data.manufacturer || 'Generic Pharma',
      brand_price: Number(data.brand_price) || 0,
      generic_cash_price: Number(data.generic_cash_price) || 0,
      coupon_code: data.coupon_code || 'RXSAVER80',
      description: data.description || '',
      fda_indications: data.fda_indications || '',
      contraindications: data.contraindications || '',
      how_to_use: data.how_to_use || '',
      side_effects: data.side_effects || '',
      is_trending: data.is_trending ? 1 : 0
    });

    return NextResponse.json({ success: true, drug: newDrug });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create drug' }, { status: 500 });
  }
}
