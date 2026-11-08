import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  getDrugBySlug, 
  getGenericAlternatives, 
  getPharmacyOffersForDrug,
  getSiteSettings
} from '@/lib/queries';
import { 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  Clock, 
  Percent, 
  ArrowRight, 
  FileText, 
  DollarSign, 
  Sparkles,
  TrendingDown,
  Printer
} from 'lucide-react';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const drug = await getDrugBySlug(params.slug);
  if (!drug) return { title: 'Medication Not Found' };

  return {
    title: `${drug.name} Cash Prices & Free Coupons from $${drug.generic_cash_price.toFixed(2)} | RxMatch US`,
    description: `Find the lowest cash price for ${drug.name} (${drug.generic_name}) at CVS, Walgreens, Walmart, and Amazon Pharmacy. Free printable discount coupons. Save up to 90% without insurance.`,
    keywords: `${drug.name} coupon, ${drug.name} cash price, cheap ${drug.generic_name}, ${drug.name} discount card, walmart ${drug.name}`,
    openGraph: {
      title: `${drug.name} Coupons & Generic Savings from $${drug.generic_cash_price.toFixed(2)}`,
      description: `Compare prices at local US pharmacies. Free prescription discount coupons without insurance.`,
    }
  };
}

export default async function DrugDetailPage({ params }: Props) {
  const drug = await getDrugBySlug(params.slug);
  if (!drug) notFound();

  const alternatives = await getGenericAlternatives(drug.generic_name, drug.slug);
  const offers = await getPharmacyOffersForDrug(drug.id);
  const settings = await getSiteSettings();

  const couponBin = settings['coupon_bin'] || '015995';
  const couponPcn = settings['coupon_pcn'] || 'GDC';
  const couponGroup = settings['coupon_group'] || 'RXMATCH';

  const savingsPct = Math.round(
    ((drug.brand_price - drug.generic_cash_price) / drug.brand_price) * 100
  );

  // Schema.org Structured Data for US SEO (USD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Drug',
    name: drug.name,
    nonProprietaryName: drug.generic_name,
    dosageForm: drug.form,
    activeIngredient: drug.generic_name,
    prescriptionStatus: drug.drug_type === 'Rx' ? 'https://schema.org/PrescriptionOnly' : 'https://schema.org/OTC',
    description: drug.description,
    manufacturer: {
      '@type': 'Organization',
      name: drug.manufacturer,
      address: 'United States'
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: drug.generic_cash_price,
      highPrice: drug.brand_price,
      offerCount: offers.length
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Inject SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="text-xs text-slate-400 flex items-center gap-2 font-medium">
        <Link href="/" className="hover:text-slate-800 transition">Home</Link>
        <span>/</span>
        <Link href="/drugs" className="hover:text-slate-800 transition">Directory</Link>
        <span>/</span>
        <Link href={`/drugs?cat=${encodeURIComponent(drug.category)}`} className="hover:text-slate-800 transition">{drug.category}</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{drug.name}</span>
      </nav>

      {/* Main Drug Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full">
                {drug.category}
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {drug.drug_type}
              </span>
              {savingsPct > 0 && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Save {savingsPct}% vs Brand
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {drug.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <div>
                Active Ingredient: <span className="font-bold text-slate-900">{drug.generic_name}</span>
              </div>
              <div>
                Dosage & Form: <span className="font-medium text-slate-800">{drug.dosage} ({drug.form})</span>
              </div>
              <div>
                Manufacturer: <span className="font-medium text-slate-800">{drug.manufacturer}</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed pt-2">
              {drug.description}
            </p>

            {/* Digital Rx Coupon Badge */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-transparent p-4 rounded-2xl border border-emerald-300/60 max-w-lg mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Free Digital Rx Coupon Card
                </span>
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans">BIN</span>
                  <span className="font-bold text-slate-900">{couponBin}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans">PCN</span>
                  <span className="font-bold text-slate-900">{couponPcn}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans">GROUP</span>
                  <span className="font-bold text-slate-900">{couponGroup}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans">MEMBER ID</span>
                  <span className="font-bold text-emerald-700 font-mono">US{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 block mt-2">
                Show this digital card to the pharmacist to receive the discounted cash rate.
              </span>
            </div>

          </div>

          {/* Quick Price Summary Box */}
          <div className="bg-slate-50 lg:w-80 rounded-2xl p-5 border border-slate-200 flex-shrink-0 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs text-slate-500 font-medium">Lowest Cash Coupon Price</div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                ${drug.generic_cash_price.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 line-through mt-0.5">
                Brand retail price: ${drug.brand_price.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Available at {offers.length} major US retail chains
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Ready for pickup today or free 2-day delivery
              </div>
            </div>

            <a
              href="#pharmacy-prices"
              className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              Compare Pharmacy Prices
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>

      {/* PRICE COMPARISON TABLE (MONETIZATION HUB) */}
      <section id="pharmacy-prices" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {drug.name} Prices Across US Pharmacies
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Click &quot;Get Coupon&quot; to transfer or order directly with the affiliate discount applied
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Updated today
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {offers.map((offer, idx) => (
              <div
                key={offer.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-blue-900 text-xs">
                    {offer.pharmacy_name.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {offer.pharmacy_name}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Lowest Price
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{offer.pickup_time}</span>
                      <span>•</span>
                      <span className="text-blue-600 font-semibold">{offer.perk_text}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">
                      ${offer.coupon_price.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400 line-through">
                      retail ${offer.cash_price.toFixed(2)}
                    </div>
                  </div>

                  <Link
                    href={`/go/${offer.pharmacy_slug}?drug=${drug.slug}&source=drug_card`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition shadow-sm"
                  >
                    <span>Get Coupon</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GENERIC ALTERNATIVES SECTION */}
      {alternatives.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <TrendingDown className="w-4 h-4" />
                Generic Equivalents
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Cheaper Alternatives for {drug.name} ({drug.generic_name})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alternatives.map((alt) => (
              <div
                key={alt.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-500">{alt.form}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full">
                      Generic Alternative
                    </span>
                  </div>

                  <Link href={`/drugs/${alt.slug}`}>
                    <h3 className="font-bold text-slate-900 text-base hover:text-blue-600 transition">
                      {alt.name}
                    </h3>
                  </Link>

                  <div className="text-xs text-slate-500 mt-1">
                    Dosage: {alt.dosage}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Coupon from</span>
                    <span className="text-base font-black text-slate-900">${alt.generic_cash_price.toFixed(2)}</span>
                  </div>

                  <Link
                    href={`/compare/${drug.slug}-vs-${alt.slug}`}
                    className="text-xs font-bold text-slate-700 hover:text-blue-600 py-1.5 px-3 rounded-lg border border-slate-200 hover:border-blue-300 transition"
                  >
                    Compare
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FDA PRESCRIBING INFORMATION */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            FDA Clinical & Prescribing Information: {drug.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700 leading-relaxed">
          
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                FDA Indications & Uses
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">{drug.fda_indications}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Dosage & Administration
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">{drug.how_to_use}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-100">
              <h3 className="font-bold text-rose-900 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Contraindications & Warnings
              </h3>
              <p className="text-xs sm:text-sm text-rose-950/80">{drug.contraindications}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Common Adverse Effects
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">{drug.side_effects || 'Consult prescribing healthcare professional.'}</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
