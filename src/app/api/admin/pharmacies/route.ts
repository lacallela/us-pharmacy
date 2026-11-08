import { NextResponse } from 'next/server';
import { getAllPharmaciesAdmin, createPharmacy } from '@/lib/queries';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pharmacies = await getAllPharmaciesAdmin();
  return NextResponse.json({ pharmacies });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.name || !data.slug || !data.base_url) {
      return NextResponse.json(
        { error: 'Name, slug, and base_url are required' },
        { status: 400 }
      );
    }

    const newPharmacy = await createPharmacy({
      slug: data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'),
      name: data.name.trim(),
      type: data.type || 'retail',
      logo_text: data.logo_text || data.name,
      pickup_time: data.pickup_time || 'Same-day pickup',
      perk_text: data.perk_text || 'Save with digital coupon',
      base_url: data.base_url.trim(),
      affiliate_param: data.affiliate_param || 'subid',
      epc: Number(data.epc) || 3.50,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1
    });

    return NextResponse.json({ success: true, pharmacy: newPharmacy });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create pharmacy' }, { status: 500 });
  }
}
