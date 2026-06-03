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
        try {
          window.dataLayer = window.dataLayer || [];
          // Expose gtag globally so app code (trackEvent helper, etc.)
          // can dispatch events. Without this the gtag function would
          // be local to this callback.
          if (typeof window.gtag !== 'function') {
            window.gtag = function() { window.dataLayer.push(arguments); };
          }

          // Belt-and-braces: explicitly inject gtag.js in case
          // Silktide's "scripts" array didn't (silent failures here
          // are the most common reason a GA4 stream stays "Not
          // active"). The ?id= query string makes gtag.js auto-init
          // the property as soon as it loads.
          if (!document.querySelector('script[data-ga-loader="true"]')) {
            var s = document.createElement('script');
            s.async = true;
            s.src = 'https://www.googletagmanager.com/gtag/js?id=G-T2BBXDFNV4';
            s.setAttribute('data-ga-loader', 'true');
            document.head.appendChild(s);
          }

          window.gtag('js', new Date());
          window.gtag('config', 'G-T2BBXDFNV4', {
            send_page_view: true,
            // Match the URL the user actually sees, even on SPA navs.
            page_location: window.location.href,
            page_path: window.location.pathname,
            page_title: document.title
          });
          // Manual page_view in case the auto one was dropped by a
          // race between gtag.js loading and the config call.
          window.gtag('event', 'page_view', {
            page_location: window.location.href,
            page_path: window.location.pathname,
            page_title: document.title
          });

          console.info('[GA] analytics consent accepted, gtag bootstrapped');
        } catch (e) {
          console.error('[GA] bootstrap failed', e);
        }
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
    // Front-load the high-intent keyword phrase so it wins the tab
    // title and SERP cuts cleanly.
    default:
      'UK Company Name Checker — Check Limited Company Name Availability | Company Name Check',
    template: '%s | UK Company Name Check',
  },
  description:
    'Free UK company name checker. Instantly see if your limited company name is available to register at Companies House — official Schedule 3 "same as" rules, dissolved-name clashes flagged, AI-generated alternatives when your first pick is taken.',
  keywords: [
    'UK company name checker',
    'company name availability UK',
    'check company name availability',
    'Companies House name check',
    'register limited company name',
    'company name search UK',
    'same as name rules',
    'company name generator UK',
    'AI company name ideas',
    'incorporate limited company',
    'UK company name finder',
    'free company name checker',
  ],
  authors: [{ name: 'Company Name Check' }],
  creator: 'Company Name Check',
  applicationName: 'UK Company Name Check',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://companynamecheck.uk',
    siteName: 'UK Company Name Check',
    title:
      'UK Company Name Checker — Check Limited Company Name Availability',
    description:
      'Find out in seconds if your UK limited company name is free to register at Companies House. Official Schedule 3 same-as rules, dissolved-name clashes, AI alternatives.',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'UK Company Name Checker — Check Limited Company Name Availability',
    description:
      'Free UK company name availability checker. Live Companies House data, official Schedule 3 rules, AI-generated alternatives.',
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
