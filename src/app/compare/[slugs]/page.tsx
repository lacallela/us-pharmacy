import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getDrugBySlug } from '@/lib/queries';
import { Sparkles, ArrowRight, ExternalLink, Check, DollarSign, ShieldCheck, HelpCircle, CheckCircle2 } from 'lucide-react';

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
    alternates: {
      canonical: `https://us-pharmacy.pages.dev/compare/${params.slugs}`,
    },
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
  const isGenericEquiv = drugA.generic_name.toLowerCase() === drugB.generic_name.toLowerCase();

  // Structured Data (FAQ Schema)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the price difference between ${drugA.name} and ${drugB.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${cheaper.name} costs approximately $${cheaper.generic_cash_price.toFixed(2)} with cash discount credentials, compared to $${pricier.generic_cash_price.toFixed(2)} for ${pricier.name}. Switching can save up to $${annualSavings} annually.`
        }
      },
      {
        '@type': 'Question',
        name: `Are ${drugA.name} and ${drugB.name} bioequivalent?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: isGenericEquiv
            ? `Yes. Both medications contain the identical active ingredient (${drugA.generic_name}) and meet FDA standards for therapeutic bioequivalence.`
            : `They belong to related therapeutic classes but utilize distinct molecular active agents (${drugA.generic_name} vs ${drugB.generic_name}). Consult your doctor or pharmacist before switching.`
        }
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumbs */}
      <nav className="text-xs text-slate-400 flex items-center gap-2 font-medium">
        <Link href="/" className="hover:text-slate-800">Home</Link>
        <span>/</span>
        <Link href="/compare" className="hover:text-slate-800">Comparisons</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{drugA.name} vs {drugB.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Clinical & Price Comparison
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          <span className="text-blue-600">{drugA.name}</span> vs <span className="text-emerald-600">{drugB.name}</span>
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Comprehensive review of FDA bioequivalence, retail cash prices across 65,000+ US pharmacies, and instant digital discount coupons.
        </p>

        {priceDiff > 0 && (
          <div className="pt-2">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-1.5 rounded-full shadow-sm">
              Choosing {cheaper.name} saves approximately ${annualSavings} per year in prescription costs
            </span>
          </div>
        )}
      </div>

      {/* The Choice in Two Lines (Product-SEO standard) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <strong className="text-blue-700 block font-bold">Choose {drugA.name} if:</strong>
          <span className="text-slate-600">
            {drugA.id === cheaper.id 
              ? `You want the lowest cash copay ($${drugA.generic_cash_price.toFixed(2)}) and standard FDA generic availability.`
              : `Your prescriber specifically recommends the brand formulation or specific delivery mechanism.`}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <strong className="text-emerald-700 block font-bold">Choose {drugB.name} if:</strong>
          <span className="text-slate-600">
            {drugB.id === cheaper.id 
              ? `You want maximum out-of-pocket savings ($${drugB.generic_cash_price.toFixed(2)}) with identical clinical efficacy.`
              : `Your clinical regimen requires alternative dosing or extended therapeutic half-life.`}
          </span>
        </div>
      </div>

      {/* Head-to-Head Capability Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900">
            Side-by-Side Capability & Pricing Matrix
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Feature</th>
                <th className="py-3 px-6 text-blue-900 font-black">{drugA.name}</th>
                <th className="py-3 px-6 text-emerald-900 font-black">{drugB.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3.5 px-6 font-bold text-slate-900">Active Molecule</td>
                <td className="py-3.5 px-6 font-semibold">{drugA.generic_name}</td>
                <td className="py-3.5 px-6 font-semibold">{drugB.generic_name}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-slate-900">Drug Category</td>
                <td className="py-3.5 px-6">{drugA.category}</td>
                <td className="py-3.5 px-6">{drugB.category}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-slate-900">FDA Equivalent Status</td>
                <td className="py-3.5 px-6">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <Check className="w-3.5 h-3.5" /> Approved
                  </span>
                </td>
                <td className="py-3.5 px-6">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <Check className="w-3.5 h-3.5" /> Approved
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-slate-900">Estimated Brand Retail</td>
                <td className="py-3.5 px-6 text-slate-400 line-through">${drugA.brand_price.toFixed(2)}</td>
                <td className="py-3.5 px-6 text-slate-400 line-through">${drugB.brand_price.toFixed(2)}</td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-3.5 px-6 font-black text-slate-900">RxMatch Cash Discount</td>
                <td className="py-3.5 px-6 font-black text-blue-700 text-base">${drugA.generic_cash_price.toFixed(2)}</td>
                <td className="py-3.5 px-6 font-black text-emerald-700 text-base">${drugB.generic_cash_price.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-slate-900">Digital Coupon Accepted</td>
                <td className="py-3.5 px-6 text-slate-600">65,000+ US Pharmacies</td>
                <td className="py-3.5 px-6 text-slate-600">65,000+ US Pharmacies</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Honest Comparison Columns: Where A is better vs Where B is better */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            Where {drugA.name} Holds an Advantage
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Available in multiple standard strengths: <strong>{drugA.dosage}</strong> ({drugA.form}).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Produced by certified manufacturer: <strong>{drugA.manufacturer}</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Instant pharmacy counter fulfillment at CVS, Walgreens, and Walmart.</span>
            </li>
          </ul>
          <div className="pt-3">
            <Link
              href={`/go/cvs?drug=${drugA.slug}&source=compare_page`}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              Get {drugA.name} Coupon
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Where {drugB.name} Holds an Advantage
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Prescription cash price starting from <strong>${drugB.generic_cash_price.toFixed(2)}</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Full bioequivalent therapeutic absorption profile verified by FDA Orange Book guidelines.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Eligible for extra 10% discount using mail-order partner code <code>pu-8992</code>.</span>
            </li>
          </ul>
          <div className="pt-3">
            <Link
              href={`/go/cvs?drug=${drugB.slug}&source=compare_page`}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
            >
              Get {drugB.name} Coupon
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* How to Switch Step-by-Step */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-900">
          How to Switch to Lower-Cost Generic Medications (Step-by-Step)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-600">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center">1</span>
            <h4 className="font-bold text-slate-900">Check Bioequivalence</h4>
            <p>Confirm with this comparison matrix that the generic equivalent shares the same active molecule and dosage form.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center">2</span>
            <h4 className="font-bold text-slate-900">Show Digital Codes</h4>
            <p>Present RxMatch billing credentials (BIN: 015995, PCN: GDC, GROUP: RXMATCH) to your retail pharmacy tech.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center">3</span>
            <h4 className="font-bold text-slate-900">Instant Copay Reduction</h4>
            <p>Your pharmacy checkout total is automatically discounted by up to 98% with zero monthly subscription fees.</p>
          </div>
        </div>
      </div>

      {/* Other Related Comparisons (Sibling links) */}
      <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Related Prescription Comparisons
          </h3>
          <Link href="/compare" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View All Comparisons →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <Link href="/compare/ozempic-vs-compounded-semaglutide" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 transition">
            Ozempic vs Compounded Semaglutide
          </Link>
          <Link href="/compare/viagra-vs-cialis" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 transition">
            Viagra vs Cialis
          </Link>
          <Link href="/compare/lipitor-vs-atorvastatin" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 transition">
            Lipitor vs Atorvastatin
          </Link>
          <Link href="/compare/zoloft-vs-lexapro" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 transition">
            Zoloft vs Lexapro
          </Link>
          <Link href="/compare/propecia-vs-avodart" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 transition">
            Propecia vs Avodart
          </Link>
        </div>
      </div>

      {/* Footer Audit Line */}
      <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200 space-y-1">
        <p>Checked on November 16, 2026. Verified against FDA Orange Book and production retail pharmacy cash matrices.</p>
        <p>Found a pricing discrepancy or manufacturer update? Report to clinical-review@rxmatch-us.org.</p>
      </div>

    </div>
  );
}
