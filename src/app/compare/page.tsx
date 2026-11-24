import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, ArrowRight, DollarSign, Scale, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Prescription Drug Comparisons & Generic Savings | RxMatch US',
  description: 'Side-by-side clinical & cash price comparisons between expensive US brand-name prescriptions and FDA-approved bioequivalent generics. Save up to 98% with free digital coupons.',
  alternates: {
    canonical: 'https://us-pharmacy.pages.dev/compare',
  },
};

interface ComparisonCard {
  slug: string;
  brandA: string;
  genericA: string;
  brandB: string;
  genericB: string;
  category: string;
  savingsPct: number;
  highlight: string;
}

const FEATURED_COMPARISONS: ComparisonCard[] = [
  {
    slug: 'ozempic-vs-compounded-semaglutide',
    brandA: 'Ozempic ($948/mo)',
    genericA: 'Semaglutide Pen',
    brandB: 'Compounded Semaglutide ($199/mo)',
    genericB: 'Semaglutide + B12',
    category: 'GLP-1 Weight Loss',
    savingsPct: 79,
    highlight: 'Save $749/month via certified telehealth compounder'
  },
  {
    slug: 'viagra-vs-sildenafil',
    brandA: 'Viagra ($780.00)',
    genericA: 'Brand Retail',
    brandB: 'Sildenafil ($14.50)',
    genericB: 'FDA Bioequivalent Generic',
    category: "Men's Health",
    savingsPct: 98,
    highlight: 'Identical active molecule, 98% lower cash price'
  },
  {
    slug: 'viagra-vs-cialis',
    brandA: 'Viagra (Sildenafil)',
    genericA: '4-6 hr duration',
    brandB: 'Cialis (Tadalafil)',
    genericB: 'Up to 36 hr duration',
    category: "Men's Health",
    savingsPct: 97,
    highlight: 'Fast onset vs weekend duration clinical comparison'
  },
  {
    slug: 'lipitor-vs-atorvastatin',
    brandA: 'Lipitor ($185.00)',
    genericA: 'Pfizer Brand',
    brandB: 'Atorvastatin ($7.20)',
    genericB: 'Generic Statin',
    category: 'Cholesterol & Heart',
    savingsPct: 96,
    highlight: 'Save $177 per refill on identical statin therapy'
  },
  {
    slug: 'lipitor-vs-crestor',
    brandA: 'Lipitor (Atorvastatin)',
    genericA: 'Standard high-intensity statin',
    brandB: 'Crestor (Rosuvastatin)',
    genericB: 'Longer half-life, potent LDL reduction',
    category: 'Cardiovascular',
    savingsPct: 94,
    highlight: 'Statin potency, LDL reduction rates and price comparison'
  },
  {
    slug: 'zoloft-vs-lexapro',
    brandA: 'Zoloft (Sertraline)',
    genericA: 'SSRI with broad anxiety profile',
    brandB: 'Lexapro (Escitalopram)',
    genericB: 'Highly selective SSRI, clean drug interaction profile',
    category: 'Mental Health & Mood',
    savingsPct: 93,
    highlight: 'Side effect profile and cash discount coupon comparison'
  },
  {
    slug: 'propecia-vs-avodart',
    brandA: 'Propecia (Finasteride 1mg)',
    genericA: 'Type II 5-AR inhibitor',
    brandB: 'Avodart (Dutasteride 0.5mg)',
    genericB: 'Dual Type I & II 5-AR inhibitor',
    category: 'Hair Loss & Dermatology',
    savingsPct: 90,
    highlight: 'DHT reduction efficiency and monthly cost breakdown'
  },
  {
    slug: 'zyrtec-vs-cetirizine-generic',
    brandA: 'Zyrtec 24-Hr ($28.99)',
    genericA: 'Retail OTC Brand',
    brandB: 'Generic Cetirizine ($6.99)',
    genericB: 'FDA Equivalence',
    category: 'Allergy & Sinus',
    savingsPct: 76,
    highlight: 'Save $22 per bottle on identical 10mg antihistamine'
  }
];

export default function CompareIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
            <Scale className="w-4 h-4 text-blue-400" />
            Evidence-Based Drug & Price Comparisons
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Compare Medication Prices, Active Molecules & Generic Savings
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Choose smarter prescription options. We analyze FDA bioequivalence, retail cash prices across 65,000+ pharmacies, and digital coupons to save you up to 98% out-of-pocket.
          </p>
        </div>
      </div>

      {/* Trust & Methodology Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">FDA Bioequivalence Verified</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Generics contain identical active ingredients in the same strength and dosage form, rigorously certified for therapeutic equivalence.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Up to 98% Cash Discount</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminate brand-name markups. Access wholesale pharmacy prices and pre-negotiated discount credentials (BIN 015995, PCN GDC).
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Honest Side-by-Side Pros/Cons</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Transparent comparison tables covering onset times, half-lives, drug interactions, and manufacturer reliability.
          </p>
        </div>
      </div>

      {/* Comparisons Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Popular Head-to-Head Comparisons
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            Updated November 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURED_COMPARISONS.map((comp) => (
            <Link
              key={comp.slug}
              href={`/compare/${comp.slug}`}
              className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">
                    {comp.category}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full">
                    Save {comp.savingsPct}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-400 block font-medium">Option A</span>
                    <strong className="text-sm font-bold text-slate-900 block">{comp.brandA}</strong>
                    <span className="text-[11px] text-slate-500">{comp.genericA}</span>
                  </div>
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <span className="text-xs text-emerald-600 block font-medium">Option B</span>
                    <strong className="text-sm font-bold text-slate-900 block">{comp.brandB}</strong>
                    <span className="text-[11px] text-slate-500">{comp.genericB}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  {comp.highlight}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                <span>View Full Clinical & Price Breakdown</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Comparison FAQ */}
      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 space-y-6">
        <h2 className="text-xl font-black text-slate-900">
          Frequently Asked Questions About Brand vs. Generic Prescriptions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="space-y-2 bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900">Are generic drugs as safe and effective as brand names?</h4>
            <p>
              Yes. The FDA requires generic medicines to have the same active ingredient, strength, dosage form, and route of administration as brand-name drugs. They must demonstrate bioequivalence, meaning they deliver the same amount of active ingredient into your bloodstream at the same rate.
            </p>
          </div>

          <div className="space-y-2 bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900">Why are brand-name prescriptions so much more expensive?</h4>
            <p>
              Brand manufacturers invest heavily in initial drug discovery, patent filings, and direct-to-consumer advertising. Once patents expire, generic manufacturers compete, driving prices down by up to 85–98% without compromising clinical efficacy.
            </p>
          </div>

          <div className="space-y-2 bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900">Can my pharmacist switch my prescription to a cheaper generic?</h4>
            <p>
              In most US states, pharmacists are legally permitted (and frequently required) to dispense the FDA-equivalent generic unless your prescribing doctor specifically checks &quot;Dispense as Written&quot; (DAW). Always ask your pharmacist for the lowest cash price.
            </p>
          </div>

          <div className="space-y-2 bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900">How do I use RxMatch discount credentials?</h4>
            <p>
              Simply show our digital card credentials (BIN: 015995, PCN: GDC, Group: RXMATCH) to your pharmacy technician at checkout. They input these billing codes into their computer to apply the pre-negotiated discount rate immediately.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
