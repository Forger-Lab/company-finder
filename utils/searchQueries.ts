import { END_DISREGARDS, START_DISREGARDS } from './companyNameRules';

// Build the set of literal forms the Companies House Advanced Search
// might need to see in order to surface a "same as" registration.
//
// The CH `company_name_includes` parameter is a phrase-level, whole-word
// match (no stemming, no symbol/word equivalence). So when the user types
// "Pandas", we still need to send "Panda" too, because a registered
// "Panda Ltd" is same-as "Pandas" but does not contain the literal
// substring "pandas".
//
// Strategy:
//   1. Tokenise the input.
//   2. Drop disregarded tokens (LTD, UK, THE, ...).
//   3. For each surviving token, build an alias set (singular, plural,
//      apostrophe-s, accent-folded, symbol↔word).
//   4. Emit at most 6 queries: 4 multi-token phrases that cover the
//      common alternations, plus up to 2 single-token fallbacks built
//      from the longest token's alias set.

const SUFFIX_TOKENS: Set<string> = (() => {
  const set = new Set<string>();
  for (const phrase of END_DISREGARDS) {
    for (const w of phrase.split(/\s+/)) set.add(w);
  }
  for (const p of START_DISREGARDS) set.add(p);
  // Single-letter junk we don't want as a search term.
  set.add('AND');
  set.add('PLUS');
  set.add('AT');
  return set;
})();

const accentFold = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '');

function tokenise(raw: string): string[] {
  // Keep apostrophes and & inside tokens; split on whitespace and most
  // other punctuation.
  return accentFold(raw)
    .toUpperCase()
    .split(/[\s,.()\[\]{}<>!"?\/\\]+/)
    .filter(Boolean);
}

function aliasSet(token: string): string[] {
  const out = new Set<string>();
  const add = (v: string) => { if (v) out.add(v); };

  add(token);

  // Plural / possessive alternations — only for tokens that look like
  // real words (letters, length >= 3). Skip for digits, symbols,
  // and very short tokens like "AB" or "&".
  const isWord = /^[A-Z]{3,}$/.test(token) || /^[A-Z]+'S$/.test(token);
  if (isWord) {
    if (token.endsWith("'S")) {
      add(token.slice(0, -2));         // SMITH'S -> SMITH
      add(token.slice(0, -2) + 'S');   // SMITH'S -> SMITHS
    } else if (token.endsWith('S') && token.length > 3) {
      add(token.slice(0, -1));         // SMITHS -> SMITH
      add(token.slice(0, -1) + "'S");  // SMITHS -> SMITH'S
    } else {
      add(token + 'S');                // SMITH  -> SMITHS
      add(token + "'S");               // SMITH  -> SMITH'S
    }
  }

  // Symbol ↔ word.
  const swap: Record<string, string[]> = {
    '&': ['AND'],
    'AND': ['&'],
    '+': ['PLUS'],
    'PLUS': ['+'],
    '@': ['AT'],
    'AT': ['@'],
    '%': ['PERCENT'],
    'PERCENT': ['%'],
    '£': ['POUND'],
    'POUND': ['£'],
    '€': ['EURO'],
    'EURO': ['€'],
    '$': ['DOLLAR'],
    'DOLLAR': ['$'],
    '0': ['O', 'ZERO'],
    'O': ['0'],
    'ZERO': ['0', 'O'],
    '1': ['ONE'],
    'ONE': ['1'],
    '2': ['TWO', 'TO', 'TOO'],
    'TWO': ['2'],
    'TO': ['2'],
    'TOO': ['2'],
    '3': ['THREE'],
    'THREE': ['3'],
    '4': ['FOUR', 'FOR'],
    'FOUR': ['4'],
    'FOR': ['4'],
    '5': ['FIVE'],
    'FIVE': ['5'],
  };
  const swaps = swap[token];
  if (swaps) for (const s of swaps) add(s);

  return [...out];
}

export default function generateSearchVariants(rawInput: string): string[] {
  const tokens = tokenise(rawInput);
  const distinctive = tokens.filter(t => !SUFFIX_TOKENS.has(t));

  // Nothing distinctive — fall back to whatever non-legal-form tokens
  // we have so the API still returns something to compare against.
  if (distinctive.length === 0) {
    const legalForms = new Set(['LTD', 'LIMITED', 'PLC', 'LLP', 'CIC', 'CIO']);
    const fallback = tokens.filter(t => !legalForms.has(t));
    return [...new Set(fallback)].slice(0, 6);
  }

  const aliases = distinctive.map(aliasSet);

  const queries = new Set<string>();
  const push = (q: string) => {
    if (q && queries.size < 6) queries.add(q);
  };

  // Multi-token queries. We don't expand the full cartesian product —
  // we pick a handful of "shapes" that cover the common alternations.
  // Shape: pick alias index per token.
  const shapes: number[][] = [];
  const n = distinctive.length;

  // Shape 0: as typed (every token's alias[0], which is the token itself).
  shapes.push(new Array(n).fill(0));

  // Shape 1: all singular (alias index that drops trailing S where applicable).
  shapes.push(distinctive.map((tok, i) => {
    const hadS = tok.endsWith('S') && !tok.endsWith("'S") && tok.length > 3;
    return hadS ? indexOf(aliases[i], tok.slice(0, -1)) : 0;
  }));

  // Shape 2: all plural.
  shapes.push(distinctive.map((tok, i) => {
    const hadS = tok.endsWith('S') && !tok.endsWith("'S") && tok.length > 3;
    return hadS ? 0 : indexOf(aliases[i], tok + 'S');
  }));

  // Shape 3: symbol↔word swap on any swappable tokens.
  shapes.push(distinctive.map((tok, i) => {
    const alt = aliases[i].findIndex((a, k) => k > 0 && /^[A-Z]+$|^[&+@%£€$]$/.test(a) && a !== tok);
    return alt >= 0 ? alt : 0;
  }));

  for (const shape of shapes) {
    const phrase = shape.map((idx, i) => aliases[i][idx] ?? aliases[i][0]).join(' ');
    push(phrase);
  }

  // Single-token fallbacks from the longest token's alias set.
  const longestIdx = distinctive
    .map((t, i) => [t.length, i] as const)
    .sort((a, b) => b[0] - a[0])[0][1];
  for (const a of aliases[longestIdx]) push(a);

  return [...queries];
}

function indexOf<T>(arr: T[], v: T): number {
  const i = arr.indexOf(v);
  return i >= 0 ? i : 0;
}
