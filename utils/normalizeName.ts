import {
  END_DISREGARDS,
  START_DISREGARDS,
  CHAR_SUBS,
  WORD_SUBS,
  PUNCT_RE,
  FIRST_THREE_STRIP_RE,
  MAX_COMPARE_LEN,
} from './companyNameRules';

// Normalise a UK company name into its Schedule-3 comparison key.
// Two names that compare equal under "same as" rules will produce the
// same output here.
export default function normalizeUKCompanyName(name: string): string {
  if (!name) return '';

  // 1. Accent fold (NFKD + strip combining marks U+0300..U+036F).
  let s = name.normalize('NFKD').replace(/[̀-ͯ]/g, '');

  // 2. Uppercase.
  s = s.toUpperCase();

  // 3. Drop *, =, #, %, + when in the first 3 characters.
  if (s.length > 0) {
    const head = s.slice(0, 3).replace(FIRST_THREE_STRIP_RE, '');
    s = head + s.slice(3);
  }

  // 4. Char-level symbol/digit canonicalisation. Pad with spaces so the
  // replacement is treated as its own token.
  for (const [from, to] of CHAR_SUBS) {
    if (from instanceof RegExp) {
      s = s.replace(from, to);
    } else {
      s = s.split(from).join(to);
    }
  }

  // 5. Whole-word canonicalisation (PERCENT, ZERO, TWO, TO, FOUR, ...).
  for (const [re, to] of WORD_SUBS) {
    s = s.replace(re, to);
  }

  // 6. Collapse whitespace to single spaces so boundary checks work.
  s = s.replace(/\s+/g, ' ').trim();

  // 7. Strip leading "THE" / "WWW" (iterated, in case both appear).
  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of START_DISREGARDS) {
      if (s === prefix) {
        s = '';
        changed = true;
        break;
      }
      if (s.startsWith(prefix + ' ')) {
        s = s.slice(prefix.length + 1);
        changed = true;
        break;
      }
    }
  }

  // 8. Iteratively strip end-of-name disregarded tokens.
  // First collapse dotted abbreviations like "L.P.", "L.L.P.", "P.L.C."
  // into the bare form so they match suffix entries "LP"/"LLP"/"PLC".
  // We only collapse runs of 2+ single-letter-then-dot to avoid touching
  // things like "CO.UK" (only one letter-dot in a row).
  s = s.replace(/(?:[A-Z]\.){2,}/g, m => m.replace(/\./g, ''));
  // Trim trailing punctuation/whitespace before each pass so things
  // like "LJ VENTURES LTD." still strip cleanly.
  const trimEnd = (x: string) => x.replace(/[\s'`,.()\[\]{}<>!"?\/\\]+$/, '');
  s = trimEnd(s);
  changed = true;
  while (changed) {
    changed = false;
    for (const suffix of END_DISREGARDS) {
      if (s === suffix) {
        s = '';
        changed = true;
        break;
      }
      if (s.endsWith(' ' + suffix)) {
        s = trimEnd(s.slice(0, -(suffix.length + 1)));
        changed = true;
        break;
      }
    }
  }

  // 9. Remove punctuation (apostrophes, dots, parens, etc.).
  s = s.replace(PUNCT_RE, '');

  // 10. Strip trailing 'S' per word (length > 3), so plural/possessive
  // variants collapse to the same key (PANDAS == PANDA, METALS SHOPS ==
  // METAL SHOP). The strict Schedule 3 wording only mentions a single
  // trailing 'S' on the whole name, but Companies House applies this
  // word-by-word in practice — and users expect it.
  s = s.split(/\s+/).map(w => {
    if (w.length > 3 && w.endsWith('S') && !w.endsWith('SS')) {
      return w.slice(0, -1);
    }
    return w;
  }).join(' ');

  // 11. Collapse all whitespace (spaces are disregarded entirely).
  s = s.replace(/\s+/g, '');

  // 12. Truncate to 60 characters.
  if (s.length > MAX_COMPARE_LEN) {
    s = s.slice(0, MAX_COMPARE_LEN);
  }

  return s;
}
