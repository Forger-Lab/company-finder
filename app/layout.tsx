import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  metadataBase: new URL('https://doesthiscompanyexist.com'),
  title: {
    default: 'DoesThisCompanyExist.com — UK Company Name Availability Checker',
    template: '%s · DoesThisCompanyExist.com',
  },
  description:
    'Instantly check if a UK company name is available to register with Companies House. Uses the official Schedule 3 "same as" rules, surfaces dissolved-name clashes, and generates AI-powered alternatives when your first pick is taken.',
  keywords: [
    'UK company name checker',
    'Companies House name availability',
    'check company name availability UK',
    'register limited company name',
    'company name search UK',
    'same as name rules',
    'company name generator UK',
    'AI company name ideas',
    'incorporate limited company',
    'company name finder',
  ],
  authors: [{ name: 'DoesThisCompanyExist.com' }],
  creator: 'DoesThisCompanyExist.com',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://doesthiscompanyexist.com',
    siteName: 'DoesThisCompanyExist.com',
    title: 'UK Company Name Availability Checker — Companies House same-as rules, instantly',
    description:
      'Find out in seconds if your dream UK company name is free to register. Powered by the official Companies House dataset and the Schedule 3 same-as ruleset.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DoesThisCompanyExist.com — UK Company Name Availability Checker',
    description:
      'Stop wasting £50 on rejected incorporations. Check name availability against Companies House same-as rules in under a second.',
  },
  alternates: {
    canonical: 'https://doesthiscompanyexist.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  category: 'business',
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
