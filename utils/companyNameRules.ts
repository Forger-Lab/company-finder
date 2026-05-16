// Constants for UK Companies House "same as" name comparison.
// Source: The Company, Limited Liability Partnership and Business
// (Names and Trading Disclosures) Regulations 2015, Schedule 3.

// End-of-name disregards. Applied iteratively with a space/start boundary,
// in the order listed (longest first to avoid partial matches).
// All entries are UPPERCASE single-space-separated. Multi-word entries match
// as consecutive words. Symbol forms (e.g. "& CO") are NOT included here
// because by the time we reach the suffix step, '&' has been replaced with
// the canonical word "AND".
export const END_DISREGARDS: string[] = [
  // Multi-word legal forms first
  'COMMUNITY INTEREST PUBLIC LIMITED COMPANY',
  'INDUSTRIAL AND PROVIDENT SOCIETY',
  'CHARITABLE INCORPORATED ORGANISATION',
  'INVESTMENT COMPANY WITH VARIABLE CAPITAL',
  'OPEN ENDED INVESTMENT COMPANY',
  'OPEN-ENDED INVESTMENT COMPANY',
  'COMMUNITY BENEFIT SOCIETY',
  'CO OPERATIVE SOCIETY',
  'CO-OPERATIVE SOCIETY',
  'COMMUNITY INTEREST COMPANY',
  'LIMITED LIABILITY PARTNERSHIP',
  'LIMITED PARTNERSHIP',
  'PUBLIC LIMITED COMPANY',
  'RIGHT TO ENFRANCHISEMENT',
  'RIGHT TO MANAGE',

  // Welsh legal forms
  'CWMNI BUDDIANT CYMUNEDOL CYHOEDDUS CYFYNGEDIG',
  'PARTNERIAETH ATEBOLRWYDDCYFYNGEDIG',
  'PARTNERIAETH ATEBOLRWYDD CYFYNGEDIG',
  'CWMNI BUDDIANT CYMUNEDOL',
  'CWMNI BUDDSODDI A CHYFALAF NEWIDIOL',
  'CWMNI BUDDSODDIAD PENAGORED',
  'SEFYDLIAD ELUSENNOL CORFFOREDIG',
  'CWMNI CYFYNGEDIG CYHOEDDUS',
  'PARTNERIAETH CYFYNGEDIG',
  'HAWL I RYDDFREINIAD',
  'CWMNI RTM CYFYNGEDIG',

  // Single-word legal-form abbreviations
  'UNLIMITED', 'LIMITED', 'LTD', 'LLP', 'LP', 'PLC', 'CIC', 'CIO',
  'RTE', 'RTM', 'PC', 'PAC', 'SEC',

  // Welsh single-word legal-form abbreviations
  'CYFYNGEDIG', 'ANGHYFYNGEDIG', 'CYF', 'CCC', 'CBC',

  // Connector words / location modifiers
  // (English)
  'AND COMPANY', 'AND CO',
  'GREAT BRITAIN', 'UNITED KINGDOM', 'NORTHERN IRELAND',
  'CO.UK', 'CO UK', 'ORG.UK', 'ORG UK',
  'COMPANY', 'BIZ', 'COM', 'NET', 'ORG', 'EU', 'CO',
  'UK', 'GB', 'NI', 'WALES',
  // (Welsh)
  'A\'R CWMNI',
  'PRYDAIN FAWR', 'Y DEYRNAS UNEDIG',
  'CWMNI', 'CYM', 'CYMRU', 'DU', 'PF',
];

// Beginning-of-name disregards (only at start, with following space boundary)
export const START_DISREGARDS: string[] = ['THE', 'WWW'];

// Char-level canonicalisation: applied to the raw uppercase string with
// space padding around the replacement so subsequent collapse handles spacing.
// We canonicalise toward the "right-hand side" of Schedule 3.
export const CHAR_SUBS: Array<[string | RegExp, string]> = [
  ['&', ' AND '],
  ['+', ' PLUS '],
  ['@', ' AT '],
  ['%', ' PERCENTUM '],
  ['£', ' POUND '],
  ['€', ' EURO '],
  ['$', ' DOLLAR '],
  ['¥', ' YEN '],
  ['¢', ' CENT '],
  ['0', ' O '],
  ['1', ' ONE '],
  ['2', ' TOO '],
  ['3', ' THREE '],
  ['4', ' FOR '],
  ['5', ' FIVE '],
];

// Whole-word canonicalisation: applied after char-level subs with \b
// boundaries. Order matters: multi-word phrases first.
export const WORD_SUBS: Array<[RegExp, string]> = [
  [/\bPER\s+CENTUM\b/g, 'PERCENTUM'],
  [/\bPER\s+CENT\b/g, 'PERCENTUM'],
  [/\bPERCENT\b/g, 'PERCENTUM'],
  [/\bZERO\b/g, 'O'],
  [/\bTWO\b/g, 'TOO'],
  [/\bTO\b/g, 'TOO'],
  [/\bFOUR\b/g, 'FOR'],
];

// Punctuation that is disregarded anywhere in the name.
// Note: dots are removed here too, so suffix stripping must run before
// punctuation removal (CO.UK relies on the dot).
export const PUNCT_RE = /['`,.()\[\]{}<>!"?\/\\]/g;

// Symbols disregarded only when in the first 3 characters.
// (`%` and `+` are already replaced at the char level, so they won't
// reach this check; we still strip them defensively.)
export const FIRST_THREE_STRIP_RE = /[*=#%+]/g;

// Length cap for comparison (Schedule 3).
export const MAX_COMPARE_LEN = 60;
