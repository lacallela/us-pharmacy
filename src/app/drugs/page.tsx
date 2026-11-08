import Link from 'next/link';
import { getAllDrugs, getCategoriesWithCounts, searchDrugs } from '@/lib/queries';
import { Search, ArrowRight, DollarSign, Tag, ShieldCheck } from 'lucide-react';

interface Props {
  searchParams: {
    q?: string;
    cat?: string;
  };
}

export default async function DrugsCatalogPage({ searchParams }: Props) {
  const query = searchParams.q || '';
  const selectedCategory = searchParams.cat || 'all';

  let drugs = query ? await searchDrugs(query) : await getAllDrugs();

  if (selectedCategory !== 'all') {
    drugs = drugs.filter((d) => d.category === selectedCategory);
  }

  const categories = await getCategoriesWithCounts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="text-xs text-slate-400 mb-2 flex items-center gap-2 font-medium">
          <Link href="/" className="hover:text-slate-800 transition">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Prescription Directory</span>
          {selectedCategory !== 'all' && (
            <>
              <span>/</span>
              <span className="text-blue-600 font-bold">{selectedCategory}</span>
            </>
          )}
        </nav>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {query ? `Search Results for "${query}"` : 'US Prescription & OTC Drug Pricing Directory'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Showing {drugs.length} medications with generic savings and local coupon prices
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <form action="/drugs" method="GET" className="w-full md:max-w-md relative">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by brand name or generic (e.g. Lipitor, Sildenafil)..."
            className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl pl-10 pr-4 py-2 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-none">
          <Link
            href="/drugs"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.category}
              href={`/drugs?cat=${encodeURIComponent(c.category)}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                selectedCategory === c.category
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{c.category}</span>
              <span className={`text-[10px] px-1.5 rounded-full ${selectedCategory === c.category ? 'bg-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                {c.count}
              </span>
            </Link>
          ))}
        </div>

      </div>

      {/* Drugs Grid */}
      {drugs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="text-lg font-bold text-slate-800">No medications found matching your query</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try searching for the generic drug name or check our free Rx Savings Screener.
          </p>
          <div className="pt-2">
            <Link
              href="/quiz/rx-savings-finder"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-700 transition"
            >
              Launch Rx Savings Screener
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drugs.map((drug) => {
            const savingsPct = Math.round(
              ((drug.brand_price - drug.generic_cash_price) / drug.brand_price) * 100
            );

            return (
              <div
                key={drug.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                      {drug.category}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {drug.drug_type}
                    </span>
                  </div>

                  <Link href={`/drugs/${drug.slug}`}>
                    <h2 className="text-lg font-black text-slate-900 hover:text-blue-600 transition">
                      {drug.name}
                    </h2>
                  </Link>

                  <div className="text-xs text-slate-500 mt-1">
                    Active Molecule: <span className="font-bold text-slate-800">{drug.generic_name}</span>
                  </div>

                  <div className="text-xs text-slate-400 mt-0.5">
                    Dosage: {drug.dosage} ({drug.form})
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {drug.description}
                  </p>

                  {savingsPct > 0 && (
                    <div className="mt-3">
                      <span className="inline-block text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Save {savingsPct}% vs Brand Retail
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Coupon Price From</span>
                    <span className="text-lg font-black text-slate-900">${drug.generic_cash_price.toFixed(2)}</span>
                  </div>

                  <Link
                    href={`/drugs/${drug.slug}`}
                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-sm"
                  >
                    View Prices
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
