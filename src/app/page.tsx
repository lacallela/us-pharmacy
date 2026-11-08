import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Percent, 
  CheckCircle2, 
  Search, 
  TrendingDown, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  Tag,
  DollarSign,
  ChevronRight,
  Flame,
  Truck
} from 'lucide-react';
import { getTrendingDrugs, getAllPharmacies, getSiteSettings } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const trendingDrugs = await getTrendingDrugs(8);
  const pharmacies = await getAllPharmacies();
  const settings = await getSiteSettings();

  const heroTitle = settings['hero_title'] || 'Stop Overpaying for Prescriptions. Save up to 90%';
  const heroSubtitle = settings['hero_subtitle'] || 'Compare cash and coupon prices across CVS, Walgreens, Walmart, and Amazon Pharmacy. Find FDA-approved generics without needing insurance.';

  // Highlighted Brand vs Generic savings
  const brandVsGenericTeaser = [
    {
      brand: { name: 'Lipitor', price: 185.00, slug: 'lipitor' },
      generic: { name: 'Atorvastatin', price: 7.20, slug: 'atorvastatin' },
      category: 'Cholesterol & Heart',
      dosage: '20mg, 30 tablets',
      savePct: 96,
      saveUsd: 177.80
    },
    {
      brand: { name: 'Zoloft', price: 115.00, slug: 'zoloft' },
      generic: { name: 'Sertraline', price: 6.50, slug: 'sertraline' },
      category: 'Mental Health & Mood',
      dosage: '50mg, 30 tablets',
      savePct: 94,
      saveUsd: 108.50
    },
    {
      brand: { name: 'Viagra', price: 780.00, slug: 'viagra' },
      generic: { name: 'Sildenafil', price: 14.50, slug: 'sildenafil' },
      category: "Men's Health",
      dosage: '50mg, 30 tablets',
      savePct: 98,
      saveUsd: 765.50
    },
    {
      brand: { name: 'Zyrtec 24-Hr', price: 28.99, slug: 'zyrtec' },
      generic: { name: 'Cetirizine HCl', price: 6.99, slug: 'cetirizine-generic' },
      category: 'Allergy & Sinus',
      dosage: '10mg, 30 tablets',
      savePct: 75,
      saveUsd: 22.00
    }
  ];

  return (
    <div className="space-y-16 pb-12">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 border border-blue-200 text-blue-900 text-xs font-bold tracking-wide">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              Free Prescription Savings • Accepted at 65,000+ US Pharmacies
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {heroSubtitle}
            </p>

            {/* Big Search Form */}
            <form action="/drugs" method="GET" className="max-w-xl mx-auto">
              <div className="flex items-center bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="Enter medication name (e.g. Lipitor, Ozempic, Zoloft)..."
                  className="w-full px-3 py-2 text-slate-800 text-sm outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-500/20 flex-shrink-0 flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick search pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Popular Searches:</span>
              <Link href="/drugs/lipitor" className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-full transition">
                Lipitor / Atorvastatin ($7.20)
              </Link>
              <Link href="/drugs/ozempic" className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-full transition">
                Ozempic / Semaglutide
              </Link>
              <Link href="/drugs/zoloft" className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-full transition">
                Zoloft / Sertraline ($6.50)
              </Link>
              <Link href="/drugs/viagra" className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-full transition">
                Viagra / Sildenafil ($14.50)
              </Link>
              <Link href="/quiz/rx-savings-finder" className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold hover:bg-emerald-100 transition flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Rx Coupon Finder
              </Link>
            </div>

          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Save Up to 90%</div>
                <div className="text-xs text-slate-500">With free discount coupons</div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">No Insurance Needed</div>
                <div className="text-xs text-slate-500">Often cheaper than copay</div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">FDA Generics</div>
                <div className="text-xs text-slate-500">Same active ingredients</div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Local or Delivery</div>
                <div className="text-xs text-slate-500">Pickup today or 2-day mail</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. BRAND VS GENERIC SAVINGS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              Generic Price Matrix
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Why Pay More for the Brand Name?
            </h2>
            <p className="text-slate-600 text-sm">
              FDA-approved generics share the exact same active molecules, dosage, and efficacy.
            </p>
          </div>
          <Link
            href="/drugs"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View all medications <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {brandVsGenericTeaser.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="truncate">{item.category}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full">
                    Save {item.savePct}%
                  </span>
                </div>

                {/* Brand card */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Brand Retail Price</div>
                  <div className="font-semibold text-slate-800 text-sm">{item.brand.name}</div>
                  <div className="text-xs font-bold text-slate-500 mt-1">${item.brand.price.toFixed(2)}</div>
                </div>

                {/* Savings Pill */}
                <div className="flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    Save ${item.saveUsd.toFixed(2)} / fill
                  </span>
                </div>

                {/* Generic card */}
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <div className="text-[10px] uppercase font-bold text-emerald-700">Generic Cash Price</div>
                  <div className="font-bold text-slate-900 text-sm">{item.generic.name}</div>
                  <div className="text-xs font-black text-emerald-700 mt-1">as low as ${item.generic.price.toFixed(2)}</div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <Link
                  href={`/compare/${item.brand.slug}-vs-${item.generic.slug}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
                >
                  Compare & Get Coupon
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 3. GLP-1 & TELEHEALTH HIGH-CONVERSION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl">
          
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Telehealth GLP-1 Program • No Insurance Required
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Can’t Afford $950/Month for Ozempic® or Wegovy®?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Take our 2-minute clinical eligibility screener. Access FDA-regulated compounded Semaglutide through licensed US telehealth providers (Ro, Hims) starting at just <span className="font-bold text-emerald-400">$199/month</span>, including medical consultation and discrete home delivery.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0 w-full sm:w-auto">
              <Link
                href="/quiz/glp1-eligibility-screener"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/25"
              >
                <span>Check GLP-1 Eligibility</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/drugs/ozempic"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition"
              >
                View Ozempic Coupon Prices
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. TRENDING US MEDICATIONS DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-rose-500" />
              Most Searched Prescriptions
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Popular Medications & Local Coupon Prices
            </h2>
          </div>
          <Link href="/drugs" className="text-sm font-bold text-slate-600 hover:text-slate-900">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trendingDrugs.map((drug) => (
            <div key={drug.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                    {drug.category}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {drug.drug_type}
                  </span>
                </div>

                <Link href={`/drugs/${drug.slug}`}>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition leading-snug">
                    {drug.name}
                  </h3>
                </Link>

                <p className="text-xs text-slate-500 mt-1">
                  Generic: <span className="font-semibold text-slate-700">{drug.generic_name}</span>
                </p>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {drug.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Cash with Coupon</div>
                  <div className="text-lg font-black text-slate-900">as low as ${drug.generic_cash_price.toFixed(2)}</div>
                </div>

                <Link
                  href={`/drugs/${drug.slug}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs transition"
                >
                  Prices
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PHARMACY PARTNER DISCOUNTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-3xl p-6 sm:p-10 border border-slate-200">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-black text-slate-900">
              Accepted at Over 65,000 Pharmacies Nationwide
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Simply present your RxMatch digital coupon at the pharmacy counter or apply it at checkout online
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pharmacies.map((pharm) => (
              <div key={pharm.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-base text-slate-900">{pharm.name}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      {pharm.type}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {pharm.pickup_time}
                  </p>
                  <p className="text-xs text-blue-800 bg-blue-50 p-2.5 rounded-xl font-medium">
                    {pharm.perk_text}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link
                    href={`/go/${pharm.slug}?source=home_partners`}
                    className="w-full inline-flex items-center justify-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-600 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 transition"
                  >
                    View Pharmacy Discounts <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
