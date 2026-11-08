import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getDrugBySlug, recordTrafficClick, getSiteSettings } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { pharmacy: string } }
) {
  const pharmacySlug = params.pharmacy;
  const searchParams = request.nextUrl.searchParams;

  const drugSlug = searchParams.get('drug');
  const source = searchParams.get('source') || 'direct';
  const utmSource = searchParams.get('utm_source') || 'rxmatch_us';
  const utmCampaign = searchParams.get('utm_campaign') || 'affiliate';

  const db = getDb();
  const pRes = await db.execute({
    sql: 'SELECT * FROM pharmacies WHERE slug = ?',
    args: [pharmacySlug]
  });
  const pharmacy = pRes.rows[0] as any;

  if (!pharmacy) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  let drugId: number | undefined;
  let drugName: string | undefined;
  if (drugSlug) {
    const drug = await getDrugBySlug(drugSlug);
    if (drug) {
      drugId = drug.id;
      drugName = drug.name;
    }
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Log the US affiliate click
  try {
    await recordTrafficClick({
      drugId,
      pharmacyId: pharmacy.id,
      source,
      utmSource,
      utmCampaign,
      ip,
      userAgent
    });
  } catch (err) {
    console.error('Failed to log affiliate click:', err);
  }

  // Construct final destination URL with affiliate tracking
  const settings = await getSiteSettings();
  const globalSubId = settings['affiliate_subid'] || 'rxmatch_us';
  const affiliateParamName = pharmacy.affiliate_param || 'subid';

  let destination: URL;
  try {
    destination = new URL(pharmacy.base_url);
  } catch {
    destination = new URL('https://' + pharmacy.base_url);
  }

  // If a specific drug is searched, add query search path
  if (drugName) {
    if (!destination.pathname || destination.pathname === '/') {
      destination.pathname = '/search';
    }
    destination.searchParams.set('q', drugName);
  }

  // Add affiliate tracking tags
  destination.searchParams.set(affiliateParamName, `${globalSubId}_${Date.now()}`);
  destination.searchParams.set('utm_source', utmSource);
  destination.searchParams.set('utm_medium', 'affiliate');
  destination.searchParams.set('utm_campaign', utmCampaign);

  return NextResponse.redirect(destination.toString(), 307);
}
