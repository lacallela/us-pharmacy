import Link from 'next/link';
import { ShieldAlert, Heart, ExternalLink, PhoneCall, Mail } from 'lucide-react';

interface Props {
  settings?: Record<string, string>;
}

export function Footer({ settings }: Props) {
  const siteName = settings?.['site_name'] || 'RxMatch US';
  const phone = settings?.['support_phone'] || '1-800-555-RXUSA';
  const email = settings?.['support_email'] || 'help@rxmatch.us';
  const bin = settings?.['coupon_bin'] || '015995';
  const pcn = settings?.['coupon_pcn'] || 'GDC';
  const group = settings?.['coupon_group'] || 'RXMATCH';

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* US FDA & Healthcare disclaimer */}
        <div className="bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-700/60 mb-10 flex items-start gap-3 text-xs leading-relaxed text-slate-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">FDA & PRESCRIPTION DISCLAIMER:</span> {siteName} is not an online pharmacy and does not dispense prescription medications. All medication pricing, discounts, and coupons shown are estimates based on standard US cash retail rates at participating licensed US pharmacies (including CVS, Walgreens, Walmart, and Amazon Pharmacy). Brand names, trademarks, and logos are property of their respective manufacturers. Always consult a licensed healthcare provider before starting, changing, or discontinuing any medication.
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h4 className="text-white font-semibold mb-3">Top Rx Discounts</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/drugs" className="hover:text-white transition">All Medications Catalog</Link></li>
              <li><Link href="/drugs/lipitor" className="hover:text-white transition">Lipitor / Atorvastatin ($8.90)</Link></li>
              <li><Link href="/drugs/ozempic" className="hover:text-white transition">Ozempic & Semaglutide Telehealth</Link></li>
              <li><Link href="/drugs/zoloft" className="hover:text-white transition">Zoloft / Sertraline ($7.50)</Link></li>
              <li><Link href="/drugs/viagra" className="hover:text-white transition">Viagra / Sildenafil ($1.20/pill)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Savings Screeners</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/quiz/rx-savings-finder" className="hover:text-white transition">Free Rx Coupon Finder</Link></li>
              <li><Link href="/quiz/glp1-eligibility-screener" className="hover:text-white transition">GLP-1 Weight Loss Screener</Link></li>
              <li><Link href="/quiz/allergy-otc-guide" className="hover:text-white transition">Allergy & Sinus Relief Guide</Link></li>
              <li><Link href="/quiz" className="hover:text-white transition">All Interactive Tools</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Partner US Pharmacies</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/go/cvs" className="hover:text-white transition flex items-center gap-1">CVS Pharmacy <ExternalLink className="w-3 h-3 text-slate-500" /></Link></li>
              <li><Link href="/go/walgreens" className="hover:text-white transition flex items-center gap-1">Walgreens <ExternalLink className="w-3 h-3 text-slate-500" /></Link></li>
              <li><Link href="/go/walmart" className="hover:text-white transition flex items-center gap-1">Walmart $4 List <ExternalLink className="w-3 h-3 text-slate-500" /></Link></li>
              <li><Link href="/go/amazon-pharmacy" className="hover:text-white transition flex items-center gap-1">Amazon Pharmacy <ExternalLink className="w-3 h-3 text-slate-500" /></Link></li>
              <li><Link href="/go/cost-plus" className="hover:text-white transition flex items-center gap-1">Cost Plus Drugs <ExternalLink className="w-3 h-3 text-slate-500" /></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Support & Console</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>{phone}</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>{email}</span>
              </li>
              <li className="pt-2 text-slate-500 text-[11px] font-mono">
                Rx Card: BIN {bin} / PCN {pcn} / GRP {group}
              </li>
              <li className="pt-2">
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">External Guides & Coverage:</span>
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-blue-400">
                  <a href="https://rentry.co/rxmatch-complete-drug-index" target="_blank" rel="noopener noreferrer" className="hover:underline">101 Drug Index</a>
                  <span>•</span>
                  <a href="https://rentry.co/rxmatch-us-savings" target="_blank" rel="noopener noreferrer" className="hover:underline">Savings Guide</a>
                  <span>•</span>
                  <a href="https://rentry.co/pharm-store-discount-guide" target="_blank" rel="noopener noreferrer" className="hover:underline">PharmStore Review</a>
                </div>
              </li>
              <li className="pt-2"><Link href="/admin" className="text-slate-400 hover:text-white transition font-medium">Admin Console →</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Arbitrage & Programmatic Health Platform</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>

      </div>
    </footer>
  );
}
