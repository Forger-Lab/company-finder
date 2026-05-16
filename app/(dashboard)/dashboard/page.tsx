'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Loader2,
  ExternalLink,
  Building2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wand2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Company {
  id: string;
  name: string;
  description: string;
  website: string;
  logo: string;
  industry: string;
  employees: string;
  companyNumber: string;
  companyStatus: string;
  companyType: string;
  dateOfCreation: string;
  dateOfCessation?: string;
}

const RECLAIMABLE_STATUSES = new Set([
  'dissolved',
  'removed',
  'converted-closed',
]);

const isReclaimable = (status: string) =>
  RECLAIMABLE_STATUSES.has(status.toLowerCase());

const prettyStatus = (status: string) =>
  status
    ? status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Unknown';

const prettyType = (type: string) =>
  type ? type.replace(/-/g, ' ').toUpperCase() : 'UK COMPANY';

const formatDate = (iso: string) => {
  if (!iso) return 'Unknown';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const chUrl = (companyNumber: string) =>
  `https://find-and-update.company-information.service.gov.uk/company/${companyNumber}`;

const CH_REGISTER_URL =
  'https://www.tax.service.gov.uk/register-your-company/setting-up-new-limited-company';

const statusStyle = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'active' || s === 'open' || s === 'registered') {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (isReclaimable(s)) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

async function checkName(name: string): Promise<Company[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(name)}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

type Tab = 'know' | 'discover';

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('know');

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Find Your Perfect Company Name
        </h1>
        <p className="text-xl text-gray-500">
          Check name availability with Companies House — or brainstorm something brand new.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1.5">
          <button
            type="button"
            onClick={() => setTab('know')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              tab === 'know'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="h-4 w-4" />
            I know the name
          </button>
          <button
            type="button"
            onClick={() => setTab('discover')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              tab === 'discover'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Wand2 className="h-4 w-4" />
            I'm looking for a name
          </button>
        </div>
      </div>

      {tab === 'know' ? <KnowNameTab /> : <DiscoverNameTab />}
    </div>
  );
}

// ─── Tab 1 ────────────────────────────────────────────────────────────────

function KnowNameTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedFor, setSearchedFor] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    setSearchedFor(query.trim());
    try {
      setResults(await checkName(query));
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const blocking = results.filter(c => !isReclaimable(c.companyStatus));
  const isAvailable = results.length === 0 || blocking.length === 0;

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          <Input
            type="text"
            placeholder="Type a company name you'd like to use..."
            className="pl-12 pr-32 h-16 text-lg rounded-2xl shadow-lg border-2 border-transparent focus:border-orange-500 transition-all"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Button
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Check'}
          </Button>
        </div>
      </form>

      <div className="space-y-6">
        {isLoading ? (
          <Spinner label="Checking name availability..." />
        ) : hasSearched ? (
          <SearchResults
            searchedFor={searchedFor}
            results={results}
            isAvailable={isAvailable}
            blockingCount={blocking.length}
          />
        ) : (
          <SuggestionTiles
            onPick={tag => {
              setQuery(tag);
              setHasSearched(true);
              setSearchedFor(tag);
              setIsLoading(true);
              checkName(tag)
                .then(setResults)
                .catch(() => setResults([]))
                .finally(() => setIsLoading(false));
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Tab 2 ────────────────────────────────────────────────────────────────

interface NameCheck {
  name: string;
  status: 'pending' | 'available' | 'taken' | 'error';
  results?: Company[];
}

function DiscoverNameTab() {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checks, setChecks] = useState<NameCheck[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description.trim()) return;
    setIsGenerating(true);
    setChecks(null);
    setSelected(new Set());
    setGenerateError(null);
    setGenerated([]);
    try {
      const res = await fetch('/api/generate-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || `Request failed with ${res.status}`);
      }
      const names = Array.isArray(data?.names) ? data.names : [];
      if (names.length === 0) {
        throw new Error('No names were returned');
      }
      setGenerated(names);
    } catch (err) {
      console.error('Generate failed:', err);
      setGenerateError(
        "Sorry, we've had an error generating names. Please try again in a moment.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const toggle = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleCheckSelected = async () => {
    const names = [...selected];
    if (names.length === 0) return;
    setIsChecking(true);
    setChecks(names.map(name => ({ name, status: 'pending' })));
    const settled = await Promise.allSettled(names.map(checkName));
    setChecks(
      names.map((name, i) => {
        const r = settled[i];
        if (r.status === 'rejected') return { name, status: 'error' };
        const blocking = r.value.filter(c => !isReclaimable(c.companyStatus));
        return {
          name,
          status: blocking.length === 0 ? 'available' : 'taken',
          results: r.value,
        };
      }),
    );
    setIsChecking(false);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleGenerate} className="max-w-2xl mx-auto space-y-3">
        <label htmlFor="business-desc" className="block text-sm font-semibold text-gray-700 px-1">
          Tell us what your company does
        </label>
        <textarea
          id="business-desc"
          rows={3}
          placeholder="e.g. a small London bakery specialising in sourdough and rye breads, with a focus on locally-milled flour..."
          className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-base shadow-sm focus:border-orange-500 focus:outline-none transition-colors resize-none"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 rounded-xl px-6"
            disabled={isGenerating || !description.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate names
              </>
            )}
          </Button>
        </div>
      </form>

      {generateError && (
        <div className="max-w-2xl mx-auto rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-800">
              <p className="font-semibold">Something went wrong</p>
              <p className="text-sm mt-1">{generateError}</p>
            </div>
          </div>
        </div>
      )}

      {generated.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Pick the names you'd like to check
            </h3>
            <span className="text-sm text-gray-500">
              {selected.size} selected
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {generated.map(name => {
              const checked = selected.has(name);
              return (
                <label
                  key={name}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors ${
                    checked
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-orange-500"
                    checked={checked}
                    onChange={() => toggle(name)}
                  />
                  <span className="text-gray-900 font-medium">{name}</span>
                </label>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleCheckSelected}
              disabled={selected.size === 0 || isChecking}
              className="bg-orange-500 hover:bg-orange-600 rounded-xl px-6"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Checking {selected.size}...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search for these names
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {checks && checks.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 px-1">
            Availability
          </h3>
          {checks.map(check => (
            <NameCheckRow key={check.name} check={check} />
          ))}
        </div>
      )}
    </div>
  );
}

function NameCheckRow({ check }: { check: NameCheck }) {
  const [open, setOpen] = useState(false);
  const blocking = (check.results ?? []).filter(c => !isReclaimable(c.companyStatus));

  return (
    <div className="rounded-2xl border-2 border-gray-100 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          {check.status === 'pending' && (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400 flex-shrink-0" />
          )}
          {check.status === 'available' && (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          )}
          {check.status === 'taken' && (
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          {check.status === 'error' && (
            <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
          )}
          <span className="font-semibold text-gray-900 truncate">{check.name}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {check.status === 'available' && (
            <>
              <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                Available
              </span>
              <a
                href={CH_REGISTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Register at Companies House
              </a>
            </>
          )}
          {check.status === 'taken' && (
            <>
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                {blocking.length} {blocking.length === 1 ? 'match' : 'matches'}
              </span>
              <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                {open ? 'Hide' : 'Show'}
              </button>
            </>
          )}
          {check.status === 'error' && (
            <span className="text-xs text-gray-500">Check failed</span>
          )}
        </div>
      </div>
      {open && check.results && check.results.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-2">
          {check.results.map(c => (
            <div key={c.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">{c.name}</div>
                <div className="text-gray-500">
                  <span className="font-mono">{c.companyNumber}</span>
                  {' · '}
                  {prettyStatus(c.companyStatus)}
                  {c.dateOfCreation ? ` · Incorporated ${formatDate(c.dateOfCreation)}` : ''}
                </div>
              </div>
              <a
                href={chUrl(c.companyNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-xs font-medium text-gray-700"
              >
                <ExternalLink className="h-3 w-3" />
                CH
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared bits ──────────────────────────────────────────────────────────

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      <p className="text-gray-500 font-medium">{label}</p>
    </div>
  );
}

function SuggestionTiles({ onPick }: { onPick: (tag: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
      {[
        { tag: 'Creative', desc: 'Short, punchy, and memorable names.' },
        { tag: 'Professional', desc: 'Trustworthy and established sounding names.' },
        { tag: 'Modern', desc: 'Clean, tech-forward, and innovative names.' },
      ].map(item => (
        <button
          key={item.tag}
          onClick={() => onPick(item.tag)}
          className="p-6 rounded-2xl bg-white border border-gray-100 text-left hover:border-orange-200 hover:shadow-lg transition-all group"
        >
          <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
            <Search className="h-5 w-5 text-orange-600" />
          </div>
          <h4 className="font-bold text-gray-900">{item.tag} Names</h4>
          <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
        </button>
      ))}
    </div>
  );
}

function SearchResults({
  searchedFor,
  results,
  isAvailable,
  blockingCount,
}: {
  searchedFor: string;
  results: Company[];
  isAvailable: boolean;
  blockingCount: number;
}) {
  return (
    <>
      {isAvailable ? (
        <div className="rounded-2xl p-6 border-2 border-green-200 bg-green-50">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-green-900">
                YAYYY! "{searchedFor}" looks available
              </h2>
              <p className="text-green-800 mt-1">
                {results.length === 0
                  ? "We didn't find any registered company that matches this name under Companies House same-as rules."
                  : `All ${results.length} ${results.length === 1 ? 'match' : 'matches'} below are dissolved or removed, so this name is likely free to register. Double-check with the official availability checker before you incorporate.`}
              </p>
              <a
                href={CH_REGISTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Register "{searchedFor}" at Companies House
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-6 border-2 border-red-200 bg-red-50">
          <div className="flex items-start gap-4">
            <XCircle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-red-900">
                "{searchedFor}" is taken
              </h2>
              <p className="text-red-800 mt-1">
                {blockingCount} active {blockingCount === 1 ? 'company' : 'companies'} matches this name under Companies House same-as rules, so you can't register it as-is.
              </p>
              <Button
                type="button"
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                onClick={() => {
                  console.log('AI suggest matching names for', searchedFor);
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI search matching company names for availability
              </Button>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 px-1">
            {blockingCount > 0
              ? 'Companies close to this name'
              : 'Previously registered (now dissolved or removed)'}
          </h3>
          <div className="grid gap-4">
            {results.map(company => (
              <Card key={company.id} className="border-gray-100 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start gap-4 pb-3">
                  <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-7 w-7 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-lg font-bold text-gray-900 break-words">
                        {company.name}
                      </CardTitle>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${statusStyle(company.companyStatus)}`}>
                        {prettyStatus(company.companyStatus)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {prettyType(company.companyType)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <dt className="text-gray-500 font-medium">Company number</dt>
                      <dd className="font-mono text-gray-900">{company.companyNumber || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium">Incorporated</dt>
                      <dd className="text-gray-900">{formatDate(company.dateOfCreation)}</dd>
                    </div>
                    {company.dateOfCessation ? (
                      <div>
                        <dt className="text-gray-500 font-medium">Dissolved</dt>
                        <dd className="text-gray-900">{formatDate(company.dateOfCessation)}</dd>
                      </div>
                    ) : (
                      <div>
                        <dt className="text-gray-500 font-medium">Status</dt>
                        <dd className="text-gray-900">{prettyStatus(company.companyStatus)}</dd>
                      </div>
                    )}
                  </dl>

                  {isReclaimable(company.companyStatus) && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        You may still be able to register "{company.name}" — this company is {prettyStatus(company.companyStatus).toLowerCase()}.
                      </span>
                    </div>
                  )}

                  <div className="mt-4">
                    <a
                      href={chUrl(company.companyNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Check on Companies House
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
