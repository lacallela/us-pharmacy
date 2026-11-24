import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getSiteSettings } from '@/lib/queries';
import { getSiteUrl } from '@/lib/seo';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RxMatch US — Free Prescription Coupons & Brand vs Generic Price Match',
    template: '%s | RxMatch US'
  },
  description: 'Save up to 90% on FDA-approved prescription medications without insurance. Compare cash and coupon prices at CVS, Walgreens, Walmart, and Amazon Pharmacy.',
  keywords: [
    'rx coupons',
    'prescription discount card without insurance',
    'generic drug price comparison',
    'goodrx alternative 2026',
    'walmart rx savings',
    'cvs prescription prices',
    'walgreens medication discounts',
    'amazon pharmacy coupon',
    'cheap prescription drugs',
    'lipitor coupon',
    'ozempic price comparison'
  ],
  authors: [{ name: 'RxMatch US Clinical & Price Research Team', url: siteUrl }],
  creator: 'RxMatch US',
  publisher: 'RxMatch US Inc.',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': `${siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google-site-verification-rxmatch',
  },
  openGraph: {
    title: 'RxMatch US — Free Rx Discount Coupons & Generic Substitutions',
    description: 'Pay cash and save up to 90% on your prescriptions at over 65,000 US pharmacies nationwide. No insurance or membership required.',
    url: siteUrl,
    siteName: 'RxMatch US',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RxMatch US — Free Rx Discount Coupons & Generic Substitutions',
    description: 'Compare prescription drug prices at CVS, Walgreens, Walmart, and Amazon Pharmacy. Free instant digital coupon card.',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'geo.region': 'US',
    'geo.placename': 'United States',
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

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: settings['site_name'] || 'RxMatch US',
    url: siteUrl,
    description: 'National prescription savings and price comparison engine for FDA-approved brand and generic medications.',
    telephone: settings['support_phone'] || '1-800-555-RXUSA',
    email: settings['support_email'] || 'help@rxmatch.us',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US'
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States'
    }
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: settings['site_name'] || 'RxMatch US',
    description: settings['site_tagline'] || 'Prescription Savings & Telehealth Price Comparison',
    publisher: {
      '@id': `${siteUrl}/#organization`
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/drugs?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="application/rss+xml" title="RxMatch US RSS Feed" href="/feed.xml" />
        <link rel="canonical" href={siteUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
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
