import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from './providers';
import { Toaster } from '@/components/shadcn-ui/sonner';

// Viewport configuration (Next.js 15+ - themeColor moved here)
export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: {
    default: "HUZILERZ | For all business owners and upcoming entrepreneurs built in Cameroon for Cameroon",
    template: "%s | HUZILERZ",
  },
  description: "For all business owners and upcoming entrepreneurs built in Cameroon for Cameroon",
  metadataBase: new URL('https://huzilerz.com'), // Replace with actual domain when live
  alternates: {
    canonical: './',
  },
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
  twitter: {
    card: "summary_large_image",
    title: "HUZILERZ",
    description: "For all business owners and upcoming entrepreneurs built in Cameroon for Cameroon",
    images: ["/icons/icon-512x512.png"], // Ideally a landscape image (1200x630)
    creator: "@huzilerz", // Replace with actual handle
  },
  keywords: [
    "make money online Cameroon",
    "How do i make money as a student Cameroon",
    "student side hustle Cameroon",
    "dropshipping Cameroon",
    "own website for cheap Cameroon",
    "online business for students Cameroon",
    "create online store Cameroon",
    "sell online Cameroon",
    "side hustle cameroon",
    "alternatives to Jumia",
    "entrepreneurship Cameroon",
    "solo entrepreneur Cameroon",
    "solopreneur Cameroon",
    "Huzilerz",
    "African SaaS",
  ],
  authors: [{ name: "HUZILERZ Team" }],
  creator: "HUZILERZ",
  publisher: "HUZILERZ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: "SYsdaLVjFR4ZReaLkHJ5Dute4AzeyF0poTpycJYoawc",
  },
  // Geo-targeting for Cameroon
  other: {
    "geo.region": "CM",
    "geo.placename": "Cameroon",
    "geo.position": "7.3697;12.3547", // Approximate center of Cameroon
    "ICBM": "7.3697, 12.3547",
  },
};

import JsonLd from '@/components/seo/JsonLd';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
      >
        <JsonLd />
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}