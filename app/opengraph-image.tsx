import { ImageResponse } from 'next/og';

// File-based OG image. Next.js routes this at /opengraph-image and
// auto-injects <meta property="og:image" ...> with the dimensions/alt
// declared below.

export const runtime = 'edge';

export const alt = 'Free UK Company Name Checker & Finder — Companies House';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background:
            'linear-gradient(135deg, #fff7ed 0%, #ffffff 55%, #fef3c7 100%)',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          position: 'relative',
        }}
      >
        {/* Soft accent blob, top-right */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: 'rgba(249, 115, 22, 0.18)',
            filter: 'blur(20px)',
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#f97316',
            textTransform: 'uppercase',
            letterSpacing: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 9999,
              background: '#f97316',
            }}
          />
          Free · UK Companies House
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.0,
            marginTop: 28,
            letterSpacing: -2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>Find &amp; check a</span>
          <span style={{ color: '#f97316' }}>UK company name</span>
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 30,
            color: '#334155',
            marginTop: 32,
            maxWidth: 980,
            lineHeight: 1.25,
          }}
        >
          AI-generated names · Live Companies House data · Schedule 3
          same-as rules
        </div>

        {/* Domain footer */}
        <div
          style={{
            marginTop: 'auto',
            fontSize: 24,
            color: '#64748b',
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          companynamecheck.uk
        </div>
      </div>
    ),
    { ...size },
  );
}
