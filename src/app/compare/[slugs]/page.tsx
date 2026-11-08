import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getDrugBySlug } from '@/lib/queries';
import { Sparkles, ArrowRight, ExternalLink, Check, DollarSign } from 'lucide-react';

interface Props {
  params: {
    slugs: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parts = params.slugs.split('-vs-');
  if (parts.length !== 2) return { title: 'Medication Comparison | RxMatch US' };

  const drugA = await getDrugBySlug(parts[0]);
  const drugB = await getDrugBySlug(parts[1]);

  if (!drugA || !drugB) return { title: 'Comparison Not Found' };

  return {
    title: `${drugA.name} vs ${drugB.name}: Price Comparison, Generics & Savings | RxMatch US`,
    description: `Compare ${drugA.name} and ${drugB.name}. Active ingredients, FDA approvals, side effects, and cash coupon prices from $${Math.min(drugA.generic_cash_price, drugB.generic_cash_price).toFixed(2)}.`,
  };
}

export default async function ComparePage({ params }: Props) {
  const parts = params.slugs.split('-vs-');
  if (parts.length !== 2) notFound();

  const drugA = await getDrugBySlug(parts[0]);
  const drugB = await getDrugBySlug(parts[1]);

  if (!drugA || !drugB) notFound();

  const cheaper = drugA.generic_cash_price <= drugB.generic_cash_price ? drugA : drugB;
  const pricier = drugA.generic_cash_price > drugB.generic_cash_price ? drugA : drugB;
  const priceDiff = Math.abs(drugA.generic_cash_price - drugB.generic_cash_price);
  const annualSavings = Math.round(priceDiff * 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumbs */}
      <nav className="text-xs text-slate-400 flex items-center gap-2 font-medium">
        <Link href="/" className="hover:text-slate-800">Home</Link>
        <span>/</span>
        <Link href="/drugs" className="hover:text-slate-800">Directory</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{drugA.name} vs {drugB.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Clinical & Pricing Comparison
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          <span className="text-blue-600">{drugA.name}</span> vs <span className="text-emerald-600">{drugB.name}</span>
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Comparing dosages, FDA clinical indications, pharmacy retail prices, and cash discount coupons.
        </p>

        {priceDiff > 0 && (
          <div className="pt-2">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-3.5 py-1 rounded-full">
              Switching to {cheaper.name} saves approximately ${annualSavings} per year
            </span>
          </div>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Drug A Card */}
        <div className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between ${cheaper.id === drugA.id ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{drugA.drug_type}</span>
              {cheaper.id === drugA.id && (
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full">
                  Lowest Cash Price
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900">{drugA.name}</h2>

            <div className="text-2xl font-black text-slate-900">
              ${drugA.generic_cash_price.toFixed(2)}
              <span className="text-xs text-slate-400 font-normal ml-2">Brand retail: ${drugA.brand_price.toFixed(2)}</span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div>
                <span className="font-bold text-slate-900 block">Active Molecule:</span>
                {drugA.generic_name}
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Standard Dosage & Form:</span>
                {drugA.dosage} ({drugA.form})
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Manufacturer:</span>
                {drugA.manufacturer}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Clinical Overview:</span>
              {drugA.description}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href={`/go/cvs?drug=${drugA.slug}&source=compare_page`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              Get Coupon for {drugA.name}
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Drug B Card */}
        <div className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between ${cheaper.id === drugB.id ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{drugB.drug_type}</span>
              {cheaper.id === drugB.id && (
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full">
                  Lowest Cash Price
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900">{drugB.name}</h2>

            <div className="text-2xl font-black text-slate-900">
              ${drugB.generic_cash_price.toFixed(2)}
              <span className="text-xs text-slate-400 font-normal ml-2">Brand retail: ${drugB.brand_price.toFixed(2)}</span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div>
                <span className="font-bold text-slate-900 block">Active Molecule:</span>
                {drugB.generic_name}
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Standard Dosage & Form:</span>
                {drugB.dosage} ({drugB.form})
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Manufacturer:</span>
                {drugB.manufacturer}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Clinical Overview:</span>
              {drugB.description}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href={`/go/cvs?drug=${drugB.slug}&source=compare_page`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              Get Coupon for {drugB.name}
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Clinical Verdict */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-lg font-black text-slate-900">
          Pharmacist Bioequivalence & Savings Verdict
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {drugA.generic_name.toLowerCase() === drugB.generic_name.toLowerCase() ? (
            <>
              Both medications contain the identical active ingredient (<strong>{drugA.generic_name}</strong>). According to FDA standards, therapeutic equivalence requires the same rate and extent of absorption in the human body. Choosing the generic option (<strong>{cheaper.name}</strong>) provides the exact same clinical benefit while saving hundreds of dollars.
            </>
          ) : (
            <>
              These medications belong to related therapeutic classes but utilize distinct molecular active agents. If your doctor prescribes brand <strong>{pricier.name}</strong>, ask whether an alternative like <strong>{cheaper.name}</strong> is appropriate for your diagnosis to lower your prescription costs.
            </>
          )}
        </p>
      </div>

    </div>
  );
}
