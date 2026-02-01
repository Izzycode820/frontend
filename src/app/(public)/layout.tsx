/**
 * Public Routes Layout
 * Layout for unauthenticated routes (auth, marketing pages)
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'HUZILERZ | For all business owners and upcoming entrepreneurs built in Cameroon for Cameroon',
  },
  description: 'For all business owners and upcoming entrepreneurs built in Cameroon for Cameroon',
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HUZILERZ",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://huzilerz.com",
    siteName: "HUZILERZ",
    title: "HUZILERZ",
    description: "For all business owners and upcomming entrepreneurs build in Cameroon for Cameroon",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "HUZILERZ Logo",
      },
    ],
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {children}
    </div>
  );
}