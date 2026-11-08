import { getAllSiteSettingsList, getSiteSettings } from '@/lib/queries';
import { getCurrentAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/AdminNav';
import { SettingsClientForm } from './SettingsClientForm';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const settings = await getSiteSettings();
  const settingsList = await getAllSiteSettingsList();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <AdminNav adminUsername={admin.username} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Site Configuration & Parameters
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Customize branding, digital coupon card parameters, hero text, and affiliate tracking defaults.
          </p>
        </div>

        <SettingsClientForm initialSettings={settings} settingsList={settingsList} />
      </main>
    </div>
  );
}
