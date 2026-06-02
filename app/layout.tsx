import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import Script from 'next/script';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

// Silktide consent-manager init. Runs after the library script has loaded
// (strategy="afterInteractive"). The library exposes
// window.silktideConsentManager; the analytics consent entry will inject
// the GA4 tag on accept, so we don't load gtag.js unconditionally.
//
// We also inject a small <style> block before init() so the banner uses
// the site's orange/white palette instead of Silktide's default yellow/
// black. Silktide v2 exposes its colours as CSS custom properties on
// `#stcm-wrapper`, so a handful of variable overrides theme the entire
// banner, modal, and floating icon.
const SILKTIDE_INIT = `
(function () {
  var style = document.createElement('style');
  style.id = 'silktide-theme-overrides';
  style.textContent = [
    '#stcm-wrapper {',
    '  --primaryColor: #f97316;',                /* orange-500 — buttons + accents */
    '  --backgroundColor: #ffffff;',             /* card / banner background */
    '  --textColor: #111827;',                   /* gray-900 — body copy */
    '  --iconColor: #ffffff;',                   /* floating icon foreground */
    '  --iconBackgroundColor: #f97316;',         /* floating icon background */
    '  --backdropBackgroundColor: rgba(249,115,22,0.55);', /* orange-500 scrim */
    '  --backdropBackgroundBlur: 4px;',
    '  --boxShadow: 0 10px 30px rgba(17,24,39,0.18), 0 2px 8px rgba(17,24,39,0.08);',
    '  --fontFamily: Manrope, ui-sans-serif, system-ui, -apple-system, sans-serif;',
    '}',
    /* Primary button: orange fill, white text on hover-invert. */
    '#stcm-wrapper .stcm-button-primary {',
    '  color: #ffffff;',
    '  background-color: #f97316;',
    '  border: 2px solid #f97316;',
    '  border-radius: 9999px;',
    '}',
    '#stcm-wrapper .stcm-button-primary:hover {',
    '  background-color: #ea580c;',              /* orange-600 */
    '  border-color: #ea580c;',
    '  color: #ffffff;',
    '}',
    /* Secondary button: outline, orange text on white. */
    '#stcm-wrapper .stcm-button-secondary {',
    '  background-color: #ffffff;',
    '  color: #f97316;',
    '  border: 2px solid #f97316;',
    '  border-radius: 9999px;',
    '}',
    '#stcm-wrapper .stcm-button-secondary:hover {',
    '  background-color: #fff7ed;',              /* orange-50 */
    '  color: #ea580c;',
    '}',
    /* Inline links should stay readable on the white card. */
    '#stcm-wrapper a { color: #f97316; }',
    '#stcm-wrapper a:hover { color: #ea580c; }'
  ].join('\\n');
  document.head.appendChild(style);
})();

window.silktideConsentManager.init({
  backdrop: { show: true },
  icon: { position: "bottomRight" },
  prompt: { position: "center" },
  consentTypes: [
    {
      id: "essential",
      label: "Essential",
      description: "<p>These cookies are necessary for the website to function properly and cannot be switched off. They help with things like logging in and setting your privacy preferences.</p>",
      required: true,
      onAccept: function() {}
    },
    {
      id: "analytics",
      label: "Analytics",
      description: "<p>These cookies help us improve the site by tracking which pages are most popular and how visitors move around the site.</p>",
      required: false,
      gtag: "analytics_storage",
      scripts: [
        { url: "https://www.googletagmanager.com/gtag/js?id=G-T2BBXDFNV4", load: "async" }
      ],
      onAccept: function() {
        window.dataLayer = window.dataLayer || [];
        // Expose gtag globally so app code can call trackEvent() and
        // have those events flow to GA. Without this assignment the
        // gtag function is local to this callback and events fired
        // from React components silently no-op.
        window.gtag = function() { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', 'G-T2BBXDFNV4');
      }
    },
    {
      id: "marketing",
      label: "Marketing",
      description: "<p>These cookies are used by us and our advertising partners to show you relevant ads on this site and elsewhere, and to measure how those campaigns perform.</p>",
      required: false,
      onAccept: function() {},
      onReject: function() {}
    }
  ],
  text: {
    prompt: {
      description: "<p>We use cookies on our site to enhance your user experience, provide personalized content, and analyze our traffic.</p>",
      acceptAllButtonText: "Accept all",
      acceptAllButtonAccessibleLabel: "Accept all cookies",
      rejectNonEssentialButtonText: "Reject non-essential",
      rejectNonEssentialButtonAccessibleLabel: "Reject all non-essential cookies",
      preferencesButtonText: "Preferences",
      preferencesButtonAccessibleLabel: "Toggle preferences"
    },
    preferences: {
      title: "Customize your cookie preferences",
      description: "<p>We respect your right to privacy. You can choose not to allow some types of cookies. Your cookie preferences will apply across our website.</p>",
      saveButtonText: "Save and close",
      saveButtonAccessibleLabel: "Save your cookie preferences",
      creditLinkText: "Get this banner for free",
      creditLinkAccessibleLabel: "Get this banner for free"
    }
  }
});
`;

export const metadata: Metadata = {
  metadataBase: new URL('https://companynamecheck.uk'),
  title: {
    default: 'CompanyNameCheck.uk — UK Company Name Availability Checker',
    template: '%s · CompanyNameCheck.uk',
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
  authors: [{ name: 'CompanyNameCheck.uk' }],
  creator: 'CompanyNameCheck.uk',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://companynamecheck.uk',
    siteName: 'CompanyNameCheck.uk',
    title: 'UK Company Name Availability Checker — Companies House same-as rules, instantly',
    description:
      'Find out in seconds if your dream UK company name is free to register. Powered by the official Companies House dataset and the Schedule 3 same-as ruleset.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CompanyNameCheck.uk — UK Company Name Availability Checker',
    description:
      'Find out if your UK company name is actually free — before you build a brand around one you can\'t use. Live Companies House data, official Schedule 3 rules.',
  },
  alternates: {
    canonical: 'https://companynamecheck.uk',
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
      // Browser extensions (Liner, "be", Grammarly, etc.) often inject
      // data-* attributes on <html>/<body> after the server-rendered
      // HTML arrives. Suppress React's hydration warning for those two
      // nodes only — the rest of the tree is still strictly hydrated.
      suppressHydrationWarning
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <head>
        {/* Silktide cookie consent — stylesheet + preconnect. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          id="silktide-consent-manager-css"
          href="https://cdn.jsdelivr.net/gh/silktide/consent-manager@v2.0.0/silktide-consent-manager.css"
          integrity="sha384-IO1E/jCrQXyH5rwcI0SXP7OXw47JFqQNDQcKhbFvqnL2IunBxxwE2Ne5XyAmCqKs"
          crossOrigin="anonymous"
        />

        {/* Silktide consent-manager library. `beforeInteractive` forces
            it to load and execute before hydration, which guarantees
            `window.silktideConsentManager` exists by the time the
            `afterInteractive` init script runs below. With two
            `afterInteractive` scripts there is no ordering guarantee
            and the banner can silently fail to mount. */}
        <Script
          src="https://cdn.jsdelivr.net/gh/silktide/consent-manager@v2.0.0/silktide-consent-manager.js"
          integrity="sha384-j4NIMOecmtzMWe9GJADIIe5hTlHG63aiTQ/2XorW10RNyQJg+IU+xwFVDy45wBah"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body suppressHydrationWarning className="min-h-[100dvh] bg-gray-50">
        <Script
          id="silktide-consent-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: SILKTIDE_INIT }}
        />

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
