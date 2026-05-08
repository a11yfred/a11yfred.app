// Fixes remaining double-dash and em-dash occurrences in corpus.json and personal-corpus.json

import { readFileSync, writeFileSync } from 'fs';

function fixDashes(text) {
  // Replace " -- " used as em dash with appropriate punctuation based on context
  // We do targeted replacements per entry rather than a blind global replace
  return text;
}

// ── corpus.json ────────────────────────────────────────────────────────────

const accPath = 'src/data/corpus.json';
const acc = JSON.parse(readFileSync(accPath, 'utf8'));

{
  // ATH-151 desc: " -- for example" → ", for example"
  const e = acc.find(x => x.id === 'ATH-151');
  if (e) {
    e.desc = e.desc.replace(
      'without context -- for example, hearing the options without knowing whether the field is for country, l',
      'without context, for example hearing the options without knowing whether the field is for country, l'
    );
    // Re-read the full field to do the full replacement
    e.desc = e.desc.replace(/ -- for example,/g, ', for example');
    e.desc = e.desc.replace(/ -- /g, ', ');
  }
}

writeFileSync(accPath, JSON.stringify(acc, null, 2));

// ── personal-corpus.json ───────────────────────────────────────────────────

const personalPath = 'src/data/personal-corpus.json';
const personal = JSON.parse(readFileSync(personalPath, 'utf8'));

const fixes = {
  'A11Y-004': {
    field: 'desc',
    from: 'A document linked or embedded on the page -- PDF, Word, or PowerPoint -- is not accessible',
    to:   'A document linked or embedded on the page (PDF, Word, or PowerPoint) is not accessible',
  },
  'A11Y-053': {
    field: 'desc',
    // "overridden to those minimums. The..." - need to see full context
    search: true,
  },
  'A11Y-057': {
    field: 'fix',
    from: 'Ensure all banner controls -- accept, reject, manage preferences, and dismiss -- are keyboard',
    to:   'Ensure all banner controls (accept, reject, manage preferences, and dismiss) are keyboard',
  },
  'A11Y-071-desc': {
    id: 'A11Y-071',
    field: 'desc',
    from: 'A authenticated session expires',
    search: true,
  },
  'A11Y-071-fix': {
    id: 'A11Y-071',
    field: 'fix',
    from: 'a simple mechanism to extend the session -- for example, pressing a key',
    to:   'a simple mechanism to extend the session, for example pressing a key',
  },
  'A11Y-073': {
    field: 'fix',
    search: true,
  },
  'A11Y-078': {
    field: 'fix',
    search: true,
  },
  'A11Y-175': {
    field: 'desc',
    search: true,
  },
};

// Do targeted replacements for entries with clear from/to
const directFixes = [
  { id: 'A11Y-004', field: 'desc',
    from: 'A document linked or embedded on the page -- PDF, Word, or PowerPoint -- is not accessible',
    to:   'A document linked or embedded on the page (PDF, Word, or PowerPoint) is not accessible' },
  { id: 'A11Y-057', field: 'fix',
    from: 'Ensure all banner controls -- accept, reject, manage preferences, and dismiss -- are keyboard',
    to:   'Ensure all banner controls (accept, reject, manage preferences, and dismiss) are keyboard' },
  { id: 'A11Y-071', field: 'fix',
    from: 'a simple mechanism to extend the session -- for example, pressing a key or activ',
    to:   'a simple mechanism to extend the session, for example pressing a key or activ' },
];

directFixes.forEach(({ id, field, from, to }) => {
  const e = personal.find(x => x.id === id);
  if (e && e[field] && e[field].includes(from)) {
    e[field] = e[field].replace(from, to);
    console.log('Fixed', id, field);
  } else if (e && e[field]) {
    console.warn('WARN: from-string not found in', id, field);
    console.warn('Snippet:', e[field].substring(0, 300));
  }
});

// For A11Y-053, A11Y-071-desc, A11Y-073, A11Y-078, A11Y-175 — do blind global replace of " -- " on those entries
['A11Y-053', 'A11Y-071', 'A11Y-073', 'A11Y-078', 'A11Y-175'].forEach(id => {
  const e = personal.find(x => x.id === id);
  if (!e) return;
  ['desc', 'fix', 'note'].forEach(f => {
    if (!e[f]) return;
    const before = e[f];
    // Replace " -- word" patterns appropriately
    // " -- for example" → ", for example"
    e[f] = e[f].replace(/ -- for example/g, ', for example');
    // " -- e.g." → ", e.g."
    e[f] = e[f].replace(/ -- e\.g\./g, ', e.g.');
    // Remaining " -- " → ", "
    e[f] = e[f].replace(/ -- /g, ', ');
    // Em dash
    e[f] = e[f].replace(/—/g, ', ');
    if (e[f] !== before) console.log('Fixed', id, f);
  });
});

writeFileSync(personalPath, JSON.stringify(personal, null, 2));

// Verify
const accFinal = JSON.parse(readFileSync(accPath, 'utf8'));
const pFinal = JSON.parse(readFileSync(personalPath, 'utf8'));

function countDashes(entries) {
  let count = 0;
  entries.forEach(e => {
    ['desc','fix','note','title'].forEach(f => {
      if (!e[f]) return;
      count += (e[f].match(/ -- /g) || []).length;
      count += (e[f].match(/—/g) || []).length;
    });
  });
  return count;
}

console.log('Remaining dashes in corpus.json:', countDashes(accFinal));
console.log('Remaining dashes in personal-corpus.json:', countDashes(pFinal));
