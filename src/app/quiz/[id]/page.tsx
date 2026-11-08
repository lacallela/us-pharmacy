import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getQuizById, getAllDrugs, getSiteSettings } from '@/lib/queries';
import { QuizRunner } from '@/components/QuizRunner';
import { ArrowLeft } from 'lucide-react';

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const quiz = (await getQuizById(params.id)) as any;
  if (!quiz) return { title: 'Screener Not Found' };

  return {
    title: `${quiz.title} | RxMatch US`,
    description: quiz.subtitle,
  };
}

export default async function QuizDetailPage({ params }: Props) {
  const quiz = (await getQuizById(params.id)) as any;
  if (!quiz) notFound();

  let questions = [];
  try {
    questions = JSON.parse(quiz.questions_json);
  } catch {
    // fallback
  }

  const allDrugs = await getAllDrugs();
  const settings = await getSiteSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <div>
        <Link
          href="/quiz"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Savings Screeners
        </Link>
      </div>

      {/* Runner */}
      <QuizRunner
        quiz={{
          id: quiz.id,
          title: quiz.title,
          subtitle: quiz.subtitle,
          estimated_time: quiz.estimated_time
        }}
        questions={questions}
        allDrugs={allDrugs}
        couponBin={settings['coupon_bin']}
        couponPcn={settings['coupon_pcn']}
        couponGroup={settings['coupon_group']}
      />

    </div>
  );
}
