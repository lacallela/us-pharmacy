import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getSiteSettings } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'RxMatch US — Free Prescription Coupons & Brand vs Generic Price Match',
  description: 'Save up to 90% on FDA-approved prescription medications without insurance. Compare cash and coupon prices at CVS, Walgreens, Walmart, and Amazon Pharmacy.',
  keywords: 'rx coupons, drug prices without insurance, generic lipitor, ozempic coupon, goodrx alternative, cheap prescription drugs, cvs pharmacy prices, cost plus drugs',
  metadataBase: new URL('https://rxmatch-us.example.com'),
  openGraph: {
    title: 'RxMatch US — Free Rx Discount Coupons & Generic Substitutions',
    description: 'Pay cash and save up to 85% on your prescriptions at over 65,000 US pharmacies nationwide.',
    type: 'website',
    locale: 'en_US',
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings: Record<string, string> = {};
  try {
    settings = await getSiteSettings();
  } catch (err) {
    console.error('Failed to load site settings in RootLayout:', err);
  }

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans selection:bg-brand-500 selection:text-white">
        <Navbar settings={settings} />
        <main className="flex-1">
          {children}
        </main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
