import { NextResponse } from 'next/server';
import { getDrugById, updateDrug, deleteDrug } from '@/lib/queries';
import { getCurrentAdmin } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  const drug = await getDrugById(id);
  if (!drug) {
    return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
  }

  return NextResponse.json({ drug });
}

export async function PUT(request: Request, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = Number(params.id);
    const existing = await getDrugById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
    }

    const data = await request.json();
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.slug !== undefined) updateData.slug = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (data.generic_name !== undefined) updateData.generic_name = data.generic_name.trim();
    if (data.drug_type !== undefined) updateData.drug_type = data.drug_type;
    if (data.category !== undefined) updateData.category = data.category.trim();
    if (data.dosage !== undefined) updateData.dosage = data.dosage;
    if (data.form !== undefined) updateData.form = data.form;
    if (data.manufacturer !== undefined) updateData.manufacturer = data.manufacturer;
    if (data.brand_price !== undefined) updateData.brand_price = Number(data.brand_price);
    if (data.generic_cash_price !== undefined) updateData.generic_cash_price = Number(data.generic_cash_price);
    if (data.coupon_code !== undefined) updateData.coupon_code = data.coupon_code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.fda_indications !== undefined) updateData.fda_indications = data.fda_indications;
    if (data.contraindications !== undefined) updateData.contraindications = data.contraindications;
    if (data.how_to_use !== undefined) updateData.how_to_use = data.how_to_use;
    if (data.side_effects !== undefined) updateData.side_effects = data.side_effects;
    if (data.is_trending !== undefined) updateData.is_trending = data.is_trending ? 1 : 0;
    if (data.symptoms !== undefined) updateData.symptoms = typeof data.symptoms === 'string' ? data.symptoms : JSON.stringify(data.symptoms);

    await updateDrug(id, updateData);
    const updated = await getDrugById(id);

    return NextResponse.json({ success: true, drug: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update drug' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  const existing = await getDrugById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
  }

  await deleteDrug(id);
  return NextResponse.json({ success: true });
}
