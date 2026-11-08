import { NextResponse } from 'next/server';
import { getPharmacyById, updatePharmacy, deletePharmacy } from '@/lib/queries';
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
  const pharmacy = await getPharmacyById(id);
  if (!pharmacy) {
    return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 });
  }

  return NextResponse.json({ pharmacy });
}

export async function PUT(request: Request, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = Number(params.id);
    const existing = await getPharmacyById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 });
    }

    const data = await request.json();
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.slug !== undefined) updateData.slug = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (data.type !== undefined) updateData.type = data.type;
    if (data.logo_text !== undefined) updateData.logo_text = data.logo_text;
    if (data.pickup_time !== undefined) updateData.pickup_time = data.pickup_time;
    if (data.perk_text !== undefined) updateData.perk_text = data.perk_text;
    if (data.base_url !== undefined) updateData.base_url = data.base_url.trim();
    if (data.affiliate_param !== undefined) updateData.affiliate_param = data.affiliate_param;
    if (data.epc !== undefined) updateData.epc = Number(data.epc);
    if (data.is_active !== undefined) updateData.is_active = data.is_active ? 1 : 0;

    await updatePharmacy(id, updateData);
    const updated = await getPharmacyById(id);

    return NextResponse.json({ success: true, pharmacy: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update pharmacy' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  const existing = await getPharmacyById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 });
  }

  await deletePharmacy(id);
  return NextResponse.json({ success: true });
}
