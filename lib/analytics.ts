// Thin client-side wrapper around gtag. Safe to call from any component:
// - SSR: no-ops (window guard).
// - Pre-consent: gtag is undefined because Silktide hasn't loaded GA yet.
//   The call no-ops; events are not buffered (we don't want to send a
//   backlog of pre-consent activity the moment the user accepts).
// - Post-consent: pushes through gtag.js to GA4 (G-T2BBXDFNV4).
//
// Add new event types as a string-literal union below so call sites get
// autocomplete and we avoid typos.

type AnalyticsEvent =
  // Tab 1 — direct name lookup
  | 'search_name'
  | 'search_suggestion_tile'
  // Tab 2 — AI brainstormer + bulk check
  | 'generate_names'
  | 'generate_names_error'
  | 'select_generated_name'
  | 'bulk_check_names'
  | 'name_check_result'
  // Outbound clicks
  | 'click_register_at_ch'
  | 'click_view_on_ch'
  | 'click_ai_alternatives'
  // Landing-page CTAs
  | 'cta_click';

type GtagFn = (
  command: 'event' | 'config' | 'js',
  action: string,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

export function trackEvent(
  action: AnalyticsEvent,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', action, params);
    }
    // If gtag isn't loaded the user hasn't consented to analytics yet —
    // drop the event silently. Do NOT push to dataLayer ahead of GA load:
    // that would queue up events and replay them on consent, which is
    // not what GDPR-compliant flows expect.
  } catch (err) {
    console.warn('[analytics] trackEvent failed', err);
  }
}
