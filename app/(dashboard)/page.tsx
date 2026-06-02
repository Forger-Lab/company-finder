import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TrackedLink } from '@/components/tracked-link';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Search,
  Zap,
  Bot,
  Building2,
  Clock,
  PoundSterling,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  FileText,
  Database,
  Gauge,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────
// Page-level structured data for SEO.
// FAQPage + WebApplication schemas help Google surface rich results
// (accordion in search, app card with rating slot) and reinforce the
// page's topical focus.
// ────────────────────────────────────────────────────────────────────────

const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: 'How does Companies House decide if two company names are the "same as"?',
    a: 'Schedule 3 of The Company, Limited Liability Partnership and Business (Names and Trading Disclosures) Regulations 2015 lists the disregarded words (Limited, Ltd, Company, UK, Great Britain, etc.), character equivalents (& = and, + = plus, 4 = four/for, etc.) and punctuation/spacing rules that two names must differ by to be considered distinct. We implement those rules end-to-end so the verdict you see here matches what Companies House would decide.',
  },
  {
    q: 'Is this an official Companies House tool?',
    a: 'No. We are an independent service that uses the public Companies House API to fetch live data, then applies the official "same as" ruleset locally. We always link out to the official Companies House page for each match so you can verify yourself.',
  },
  {
    q: 'What does it cost to check a name?',
    a: 'Searching is free. Create an account to save searches, get AI-generated alternatives, and bulk-check shortlists.',
  },
  {
    q: 'Why did a name come back available here but get rejected by Companies House?',
    a: 'The "same as" rule is one of several name checks Companies House performs. They also reject names containing sensitive words (e.g. "Bank", "Royal"), names that are "too like" an existing name in their reviewer\'s judgement, and trademark conflicts. We check the algorithmic same-as rule precisely; the subjective "too like" check is not algorithmic and you should always run a final check on the official tool before incorporating.',
  },
  {
    q: 'Does a dissolved company name become available again?',
    a: 'Sometimes — Companies House keeps a name reserved for a period after dissolution. We flag dissolved matches separately with an amber "you may still be able to register this name" hint, but you should confirm with Companies House before incorporating.',
  },
  {
    q: 'Can I check several names at once?',
    a: 'Yes. The "I\'m looking for a name" tab lets you describe your business in plain English, get 10 AI-generated name ideas, tick the ones you like, and bulk-check their availability in one go.',
  },
  {
    q: 'How fresh is the company data?',
    a: 'Every search hits the live Companies House Advanced Search and Basic Search APIs in real time, so you see exactly the same dataset the official register would show you — including active, dissolved, in-liquidation, in-administration, and removed companies.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CompanyNameCheck.uk',
  url: 'https://companynamecheck.uk',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  description:
    'UK company name availability checker. Validates against Companies House Schedule 3 "same as" rules in real time and suggests AI-powered alternatives when your name is taken.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
  audience: {
    '@type': 'Audience',
    audienceType: 'Founders and entrepreneurs incorporating UK limited companies',
  },
};

export default function HomePage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

      <Hero />
      <TrustBar />
      <PainSection />
      <FeaturesSection />
      <HowItWorks />
      <ComparisonSection />
      <DemoTeaser />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/60 via-white to-white">
      {/* animated background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl animate-blob" />
        <div className="absolute top-40 -right-20 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl animate-blob-slow" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl animate-blob" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="fade-up-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-orange-200 text-sm font-semibold text-orange-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 animate-pulse-ring" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              Live Companies House data · 5.6m+ UK records
            </div>

            <h1 className="fade-up-2 mt-6 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
              Brainstorm a company name{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                  you can actually register.
                </span>
              </span>
            </h1>

            <p className="fade-up-3 mt-6 text-xl text-gray-600 max-w-xl leading-relaxed">
              Describe what you do, and our AI generates ten distinctive UK
              company names — each one checked live against{' '}
              <strong className="text-gray-900">Companies House</strong> using
              the official Schedule 3 "same as" rules. Pick a winner you know is
              free to grab.
            </p>

            <div className="fade-up-4 mt-8 flex flex-col sm:flex-row gap-3">
              <TrackedLink href="/sign-up" cta="hero_signup">
                <Button
                  size="lg"
                  className="text-base rounded-full bg-orange-500 hover:bg-orange-600 px-8 py-6 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5"
                >
                  Get started — it's free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </TrackedLink>
              <TrackedLink href="/dashboard" cta="hero_try_search">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base rounded-full px-8 py-6 border-2 hover:bg-gray-50"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Try a search
                </Button>
              </TrackedLink>
            </div>

            <div className="fade-up-5 mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                No credit card required
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Free forever for solo founders
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                GDPR compliant
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroSearchPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSearchPreview() {
  return (
    <div className="fade-up-3 relative">
      <div className="absolute -inset-4 bg-gradient-to-br from-orange-400/30 via-rose-300/30 to-amber-400/30 rounded-3xl blur-2xl" />
      <div className="relative rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
          <div className="ml-3 text-xs text-gray-400 font-mono">
            companynamecheck.uk/dashboard
          </div>
        </div>

        <div className="rounded-2xl border-2 border-orange-500/30 bg-orange-50/40 px-4 py-3 flex items-center gap-3">
          <Search className="h-5 w-5 text-orange-500" />
          <span className="font-mono text-base text-gray-800">
            northwind coffee
          </span>
          <span className="ml-auto inline-block h-5 w-px bg-gray-400 animate-pulse" />
        </div>

        <div className="mt-4 space-y-3">
          <ResultRow
            name="Northwind Coffee Ltd"
            number="14552981"
            status="Active"
            verdict="taken"
          />
          <ResultRow
            name="Northwind Coffee Roasters Ltd"
            number="08821044"
            status="Dissolved"
            verdict="reclaimable"
          />
          <ResultRow
            name="Northwind Coffee House Ltd"
            number="11220039"
            status="Active"
            verdict="taken"
          />
        </div>

        <div className="mt-5 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-900">
            <Sparkles className="h-4 w-4" />
            AI suggestions you could register today
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              'Northwind Roastworks',
              'Borough Bean Co.',
              'Compass Coffee Labs',
              'Meridian Brew',
            ].map(n => (
              <span
                key={n}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-purple-200 text-xs font-semibold text-purple-800"
              >
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({
  name,
  number,
  status,
  verdict,
}: {
  name: string;
  number: string;
  status: string;
  verdict: 'taken' | 'reclaimable';
}) {
  const isTaken = verdict === 'taken';
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {name}
          </div>
          <div className="text-xs text-gray-500 font-mono">{number}</div>
        </div>
      </div>
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
          isTaken
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}
      >
        {status}
      </span>
    </div>
  );
}

// ─── Trust bar / stats ───────────────────────────────────────────────────

function TrustBar() {
  const stats = [
    { v: '5.6M+', l: 'UK companies checked against' },
    { v: '< 800ms', l: 'Average search time' },
    { v: '100%', l: 'Schedule 3 rule coverage' },
    { v: '0', l: 'Cost to get started' },
  ];
  return (
    <section className="border-y border-gray-100 bg-gray-50/80 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.l} className="text-center reveal-on-scroll">
            <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-br from-orange-500 to-rose-500 bg-clip-text text-transparent">
              {s.v}
            </div>
            <div className="mt-1 text-sm text-gray-600">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Pain section ────────────────────────────────────────────────────────

function PainSection() {
  const pains = [
    {
      icon: Sparkles,
      title: 'The blank-page problem',
      body: 'Coming up with a name you actually like is hard. Every shortlist starts strong and ends with you doodling synonyms of "venture" in a notebook at midnight.',
    },
    {
      icon: AlertTriangle,
      title: 'Every name you love is already taken',
      body: 'You finally pick one — and ten minutes later you discover a near-duplicate on the register. Back to the doodling. Companies House\'s own checker won\'t suggest anything new.',
    },
    {
      icon: Clock,
      title: 'Checking a shortlist one-by-one is painful',
      body: 'The official tool is yes-or-no for a single name at a time. You paste, wait, paste the next, wait. Twenty candidates becomes an hour of clicking.',
    },
  ];
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto reveal-on-scroll">
          <span className="inline-block text-sm font-bold uppercase tracking-wider text-orange-600">
            The problem
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Naming a company is two problems, not one.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            You have to <strong className="text-gray-900">come up</strong> with a
            name that fits your business — and then{' '}
            <strong className="text-gray-900">verify</strong> nobody else has
            grabbed it under Companies House{' '}
            <strong className="text-gray-900">"same as"</strong> rules. Most
            tools only help with one. We do both, in the same flow.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {pains.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="reveal-on-scroll group relative rounded-2xl border border-gray-200 bg-white p-7 hover:border-orange-200 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-gray-900">{title}</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ────────────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Schedule 3 rules, faithfully implemented',
      body: 'Accent folding, & ↔ and, numeral ↔ word equivalents, disregarded suffixes, plural collapsing, the 60-character cap — all the same rules Companies House applies, end to end.',
      tone: 'orange',
    },
    {
      icon: Database,
      title: 'Live Companies House data',
      body: 'We hit the official Advanced Search and Basic Search APIs in real time, including dissolved, in-liquidation, in-administration and removed companies that the public search hides.',
      tone: 'blue',
    },
    {
      icon: Bot,
      title: 'AI name brainstormer',
      body: 'Describe your business in plain English. Gemini-powered suggestions are tuned to avoid the disregarded fillers that weaken distinctiveness — and we batch-check availability for you.',
      tone: 'purple',
    },
    {
      icon: Zap,
      title: 'Built for speed',
      body: 'Sub-second searches, parallel multi-name checks, and one-click links straight to the official Companies House record for every match.',
      tone: 'amber',
    },
    {
      icon: FileText,
      title: 'Honest verdicts',
      body: 'Big green YES when the name is yours to take. Big red NO when it\'s blocked. Amber "you may still be able to register this" for dissolved-name edge cases. No jargon.',
      tone: 'green',
    },
    {
      icon: Gauge,
      title: 'One click to register',
      body: "When the name's free, we link you straight through to the Companies House registration flow with the name in hand. No re-typing, no re-searching.",
      tone: 'rose',
    },
  ];

  const tone: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <section className="py-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto reveal-on-scroll">
          <span className="inline-block text-sm font-bold uppercase tracking-wider text-orange-600">
            What you get
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Brainstorm and verify, in one flow.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Generate ideas, shortlist your favourites, and find out which ones
            you can actually grab — without leaving the page.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, body, tone: t }) => (
            <div
              key={title}
              className="reveal-on-scroll group rounded-2xl bg-white border border-gray-200 p-7 hover:shadow-xl hover:-translate-y-1 hover:border-gray-300 transition-all"
            >
              <div
                className={`h-12 w-12 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform ${tone[t]}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">{title}</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Type a name or describe your business',
      body: 'Search a specific name you have in mind, or describe what you do and let our AI generate ten distinctive candidates.',
    },
    {
      n: '02',
      title: "We check it against every UK company on the register",
      body: "Live Companies House data, deduplicated across the basic and advanced search endpoints, normalised with the official Schedule 3 same-as ruleset.",
    },
    {
      n: '03',
      title: 'You get a clear verdict — and a path forward',
      body: "Green: register it. Red: see exactly which companies block it, plus AI alternatives that are actually free. Amber: dissolved match — may still be claimable.",
    },
  ];
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto reveal-on-scroll">
          <span className="inline-block text-sm font-bold uppercase tracking-wider text-orange-600">
            How it works
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Three steps, under a minute.
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
          {steps.map(s => (
            <div key={s.n} className="reveal-on-scroll relative text-center">
              <div className="relative mx-auto h-24 w-24 rounded-full bg-white border-2 border-orange-200 shadow-lg flex items-center justify-center">
                <span className="text-2xl font-extrabold bg-gradient-to-br from-orange-500 to-rose-500 bg-clip-text text-transparent">
                  {s.n}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">{s.title}</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Comparison ──────────────────────────────────────────────────────────

function ComparisonSection() {
  const rows: Array<{ feature: string; us: boolean | string; them: boolean | string }> = [
    { feature: 'Searches the live Companies House register', us: true, them: true },
    { feature: 'Applies official Schedule 3 "same as" rules', us: true, them: true },
    { feature: 'Surfaces dissolved-name clashes', us: true, them: 'Sometimes' },
    { feature: 'Bulk-checks a shortlist in one click', us: true, them: false },
    { feature: 'AI brainstorms registrable alternatives', us: true, them: false },
    { feature: 'Plain-English verdict (not a registry page)', us: true, them: false },
    { feature: 'Links straight to registration when free', us: true, them: 'Manual' },
    { feature: 'Free for solo founders', us: true, them: true },
  ];
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto reveal-on-scroll">
          <span className="inline-block text-sm font-bold uppercase tracking-wider text-orange-600">
            Comparison
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Why not just use the official tool?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            You should — for the final pre-incorporation check. But the official
            tool isn't built for the messy, exploratory part of naming a company.
            That's where we come in.
          </p>
        </div>

        <div className="reveal-on-scroll mt-12 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="grid grid-cols-[1fr_auto_auto] divide-x divide-gray-200">
            <div className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50">
              Capability
            </div>
            <div className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 text-center min-w-[140px]">
              CompanyNameCheck
            </div>
            <div className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50 text-center min-w-[140px]">
              Official checker
            </div>
            {rows.map(r => (
              <ComparisonRow key={r.feature} {...r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonRow({
  feature,
  us,
  them,
}: {
  feature: string;
  us: boolean | string;
  them: boolean | string;
}) {
  const cell = (v: boolean | string, primary = false) => {
    if (v === true) {
      return (
        <CheckCircle2
          className={`h-5 w-5 mx-auto ${primary ? 'text-orange-600' : 'text-green-600'}`}
        />
      );
    }
    if (v === false) {
      return <XCircle className="h-5 w-5 mx-auto text-gray-300" />;
    }
    return (
      <span className="text-xs font-medium text-gray-500">{v}</span>
    );
  };
  return (
    <>
      <div className="px-6 py-4 text-sm text-gray-700 border-t border-gray-100">
        {feature}
      </div>
      <div className="px-6 py-4 text-center border-t border-gray-100 bg-orange-50/30">
        {cell(us, true)}
      </div>
      <div className="px-6 py-4 text-center border-t border-gray-100">
        {cell(them)}
      </div>
    </>
  );
}

// ─── Demo teaser ─────────────────────────────────────────────────────────

function DemoTeaser() {
  return (
    <section className="py-24 bg-gray-900 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-orange-600/20 blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-rose-600/20 blur-3xl animate-blob-slow" />
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="reveal-on-scroll">
          <span className="inline-block text-sm font-bold uppercase tracking-wider text-orange-400">
            See it in action
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Type a name. Get an answer. Move on with your day.
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            No account needed to try it. Bring a name, get a verdict in under a
            second, and link straight to Companies House if the name is yours.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <TrackedLink href="/dashboard" cta="demo_try_search">
              <Button
                size="lg"
                className="text-base rounded-full bg-white text-gray-900 hover:bg-gray-100 px-8 py-6"
              >
                <Search className="mr-2 h-5 w-5" />
                Try a search now
              </Button>
            </TrackedLink>
            <TrackedLink href="/sign-up" cta="demo_signup">
              <Button
                size="lg"
                variant="outline"
                className="text-base rounded-full px-8 py-6 border-2 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Sign up for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </TrackedLink>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────

function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center reveal-on-scroll">
          <span className="inline-block text-sm font-bold uppercase tracking-wider text-orange-600">
            FAQ
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Questions, answered.
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQ_ITEMS.map(({ q, a }) => (
            <details
              key={q}
              className="reveal-on-scroll group rounded-2xl border border-gray-200 bg-white px-6 py-5 open:shadow-md transition-shadow"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-bold text-gray-900 pr-4">{q}</h3>
                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ───────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-orange-300/40 blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-rose-300/40 blur-3xl animate-blob-slow" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 reveal-on-scroll">
          Your next company name is one prompt away.
        </h2>
        <p className="mt-6 text-xl text-gray-700 max-w-2xl mx-auto reveal-on-scroll">
          Sign up for free, describe your business, and walk away with a
          shortlist of distinctive names you know are free to register at
          Companies House.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center reveal-on-scroll">
          <TrackedLink href="/sign-up" cta="final_cta_signup">
            <Button
              size="lg"
              className="text-base rounded-full bg-gray-900 hover:bg-gray-800 text-white px-10 py-6 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
            >
              Get started — free forever
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </TrackedLink>
          <TrackedLink href="/dashboard" cta="final_cta_try_search">
            <Button
              size="lg"
              variant="outline"
              className="text-base rounded-full px-10 py-6 border-2 border-gray-300 bg-white hover:bg-gray-50"
            >
              <Search className="mr-2 h-5 w-5" />
              Try a search first
            </Button>
          </TrackedLink>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          No credit card. Cancel any time. Built by founders who picked the
          wrong name once, so you don't have to.
        </p>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="text-xl font-semibold text-white">
            CompanyNameCheck.uk
          </div>
          <p className="mt-3 text-sm leading-relaxed max-w-md">
            The UK company name availability checker built on the official
            Companies House Schedule 3 same-as ruleset. Independent — not
            affiliated with Companies House or HM Government.
          </p>
        </div>
        <div>
          <div className="text-sm font-bold text-white uppercase tracking-wider">
            Product
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/dashboard" className="hover:text-white">
                Search names
              </Link>
            </li>
            <li>
              <Link href="/sign-up" className="hover:text-white">
                Sign up
              </Link>
            </li>
            <li>
              <Link href="/sign-in" className="hover:text-white">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-bold text-white uppercase tracking-wider">
            Resources
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="#faq" className="hover:text-white">
                FAQ
              </a>
            </li>
            <li>
              <a
                href="https://www.legislation.gov.uk/uksi/2015/17/schedule/3"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                Schedule 3 regulations
              </a>
            </li>
            <li>
              <a
                href="https://find-and-update.company-information.service.gov.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                Companies House
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-10 border-t border-white/10 pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-xs text-gray-500">
          © {new Date().getFullYear()} CompanyNameCheck.uk. All rights
          reserved.
        </div>
        <a
          href="https://www.solvolab.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <span className="uppercase tracking-wider font-semibold">
            Powered by
          </span>
          <img
            src="https://www.solvolab.com/brandlogo/SolvoLabLogo-Cut.png"
            alt="SolvoLab"
            className="h-6 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
            loading="lazy"
          />
        </a>
      </div>
    </footer>
  );
}
