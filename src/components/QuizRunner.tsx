'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  ShieldAlert, 
  ShoppingCart,
  Pill,
  DollarSign
} from 'lucide-react';

interface Option {
  label: string;
  value: string;
  matchSlug?: string;
}

interface Question {
  id: string;
  question: string;
  options: Option[];
}

interface DrugItem {
  id: number;
  slug: string;
  name: string;
  generic_name: string;
  generic_cash_price: number;
  brand_price: number;
  form: string;
  dosage: string;
  description: string;
}

interface QuizRunnerProps {
  quiz: {
    id: string;
    title: string;
    subtitle: string;
    estimated_time: string;
  };
  questions: Question[];
  allDrugs: DrugItem[];
  couponBin?: string;
  couponPcn?: string;
  couponGroup?: string;
}

export function QuizRunner({ 
  quiz, 
  questions, 
  allDrugs,
  couponBin = '015995',
  couponPcn = 'GDC',
  couponGroup = 'RXMATCH'
}: QuizRunnerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentStep];
  const progressPercent = Math.round((currentStep / questions.length) * 100);

  const handleSelectOption = (opt: Option) => {
    const nextMatches = [...selectedMatches];
    if (opt.matchSlug && !nextMatches.includes(opt.matchSlug)) {
      nextMatches.push(opt.matchSlug);
    }
    setSelectedMatches(nextMatches);

    if (currentStep + 1 < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedMatches([]);
    setIsFinished(false);
  };

  let recommendedDrugs = allDrugs.filter((d) => selectedMatches.includes(d.slug));
  if (recommendedDrugs.length === 0) {
    recommendedDrugs = allDrugs.slice(0, 3);
  }

  const totalGenericPrice = recommendedDrugs.reduce((sum, d) => sum + d.generic_cash_price, 0);
  const totalBrandPrice = recommendedDrugs.reduce((sum, d) => sum + d.brand_price, 0);
  const totalSavings = Math.max(0, totalBrandPrice - totalGenericPrice);

  return (
    <div className="max-w-3xl mx-auto">
      
      {!isFinished ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
          
          {/* Header & Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span className="flex items-center gap-1.5 text-blue-700">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Step {currentStep + 1} of {questions.length}
              </span>
              <span>{progressPercent}% Complete</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-2">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className="w-full p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition flex items-center justify-between group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-xs font-bold text-slate-600 transition">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm font-bold text-slate-800 group-hover:text-blue-950 transition">
                    {opt.label}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Your answers are confidential and used only to match eligible cash discounts.
          </div>

        </div>
      ) : (
        /* FINISHED - RESULT & SAVINGS CARD */
        <div className="space-y-6">
          
          {/* Success Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
              Prescription Savings Report Generated
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              You Could Save Up to ${totalSavings.toFixed(2)} with Free Generic Coupons
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Based on your screening criteria, we matched FDA-approved bioequivalent alternatives and cash discount codes accepted at major US pharmacies.
            </p>
          </div>

          {/* Digital Discount Card */}
          <div className="bg-emerald-950 text-white p-6 rounded-3xl border border-emerald-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                RxMatch US Member Discount Pass
              </span>
              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded">
                NO INSURANCE REQUIRED
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs font-mono">
              <div className="bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-700/50">
                <span className="text-[10px] text-emerald-300 block font-sans">BIN</span>
                <span className="font-bold text-white text-sm">{couponBin}</span>
              </div>
              <div className="bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-700/50">
                <span className="text-[10px] text-emerald-300 block font-sans">PCN</span>
                <span className="font-bold text-white text-sm">{couponPcn}</span>
              </div>
              <div className="bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-700/50">
                <span className="text-[10px] text-emerald-300 block font-sans">GROUP</span>
                <span className="font-bold text-white text-sm">{couponGroup}</span>
              </div>
              <div className="bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-700/50">
                <span className="text-[10px] text-emerald-300 block font-sans">MEMBER ID</span>
                <span className="font-bold text-emerald-400 text-sm">US{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-300/80 pt-1">
              Show this card screen to your pharmacist at CVS, Walgreens, Walmart, or use it when ordering through Amazon Pharmacy.
            </p>
          </div>

          {/* Curated Medications List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-slate-900">
                  Recommended Generic Medications ({recommendedDrugs.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Cash prices compared across certified pharmacies
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {recommendedDrugs.map((drug) => (
                <div key={drug.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <Link href={`/drugs/${drug.slug}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 transition">
                        {drug.name}
                      </Link>
                      <div className="text-xs text-slate-500">
                        Active: {drug.generic_name} • {drug.dosage}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900">as low as ${drug.generic_cash_price.toFixed(2)}</span>
                    <span className="block text-[11px] text-slate-400 line-through">brand: ${drug.brand_price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Partner Action Buttons */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href={`/go/amazon-pharmacy?source=quiz_result&quiz_id=${quiz.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Order on Amazon Pharmacy (Prime 2-Day)
                </Link>

                <Link
                  href={`/go/cvs?source=quiz_result&quiz_id=${quiz.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Pickup Today at CVS / Walgreens
                </Link>
              </div>

              {/* Retake test */}
              <div className="text-center pt-2">
                <button
                  onClick={handleRestart}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retake Screener with Different Options
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
