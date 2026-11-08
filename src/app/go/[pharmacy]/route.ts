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

  // Check if we have an explicit affiliate_url in drug_pharmacy_prices
  if (drugId) {
    try {
      const priceRes = await db.execute({
        sql: 'SELECT affiliate_url FROM drug_pharmacy_prices WHERE drug_id = ? AND pharmacy_id = ?',
        args: [drugId, pharmacy.id]
      });
      const priceRow = priceRes.rows[0] as any;
      if (priceRow && priceRow.affiliate_url) {
        let dest = String(priceRow.affiliate_url).trim();
        if (pharmacy.slug === 'pharm-store' || dest.includes('pharm-store.com')) {
          if (!dest.includes('id=924')) {
            dest += (dest.includes('?') ? '&' : '?') + 'id=924';
          }
        }
        return NextResponse.redirect(dest, 307);
      }
    } catch (err) {
      console.error('Error fetching affiliate_url from prices:', err);
    }
  }

  // Specific handler for pharm-store fallback
  if (pharmacy.slug === 'pharm-store' || (pharmacy.base_url && pharmacy.base_url.includes('pharm-store.com'))) {
    const fallbackUrl = 'http://pharm-store.com/?id=924';
    return NextResponse.redirect(fallbackUrl, 307);
  }

  // Generic affiliate URL fallback construction
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
  if (affiliateParamName && !affiliateParamName.includes('=')) {
    destination.searchParams.set(affiliateParamName, `${globalSubId}_${Date.now()}`);
  }
  destination.searchParams.set('utm_source', utmSource);
  destination.searchParams.set('utm_medium', 'affiliate');
  destination.searchParams.set('utm_campaign', utmCampaign);

  return NextResponse.redirect(destination.toString(), 307);
}
