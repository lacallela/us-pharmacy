import Link from 'next/link';
import { getAllQuizzes } from '@/lib/queries';
import { Sparkles, Clock, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function QuizzesIndexPage() {
  const quizzes = (await getAllQuizzes()) as any[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            RxMatch Clinical Screeners
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Interactive Prescription Savings & Telehealth Screeners
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Answer a few quick questions to check your eligibility for generic copay relief, GLP-1 weight loss prescriptions, or OTC substitutes without waiting at the doctor&apos;s office.
          </p>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quizzes.map((q) => {
          let questions = [];
          try {
            questions = JSON.parse(q.questions_json);
          } catch {
            // ignore
          }

          return (
            <div
              key={q.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition p-6 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    {q.badge}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {q.estimated_time}
                  </span>
                </div>

                <h2 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition">
                  {q.title}
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {q.subtitle}
                </p>

                <div className="text-xs text-slate-400 font-medium">
                  {questions.length} questions • Instant Digital Coupon
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href={`/quiz/${q.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/20"
                >
                  Start Screener
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
