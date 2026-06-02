'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';

// Drop-in <Link> replacement that fires a GA `cta_click` event on click.
// Use it from server components (the wrapper itself is the only
// "use client" boundary you need).
//
// Pass `cta` to identify the button — keep it short and slug-like
// (`hero_signup`, `final_cta_search`, etc.) for clean analytics rollups.
export function TrackedLink({
  href,
  cta,
  external = false,
  children,
  className,
}: {
  href: string;
  cta: string;
  external?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const handleClick = () => trackEvent('cta_click', { cta, href });

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
