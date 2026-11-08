import { getAllPharmaciesAdmin } from '@/lib/queries';
import { getCurrentAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/AdminNav';
import { PharmaciesManager } from './PharmaciesManager';

export const revalidate = 0;

export default async function AdminPharmaciesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const pharmacies = await getAllPharmaciesAdmin();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <AdminNav adminUsername={admin.username} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PharmaciesManager initialPharmacies={pharmacies} />
      </main>
    </div>
  );
}
