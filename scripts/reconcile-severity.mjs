// Reconciles severity changes across corpus.json and personal-corpus.json
// Changes:
//   ACC-058: Best Practice → Medium  (2.4.4 is a real SC, merged scope)
//   ACC-051: Medium → High           (SC 2.2.2 Level A, combined scope justifies bump)
//   ACC-034: Medium → High           (controls invisible for forced-colors users = non-functional)
//   ACC-076: clear sc field          (new-tab link is not a 3.2.2 violation)
//   A11Y-093: Best Practice → Medium (reconcile with ACC-058)
//   A11Y-073: Medium → High          (reconcile with ACC-051)
//   A11Y-050: Medium → High          (reconcile with ACC-034)

import { readFileSync, writeFileSync } from 'fs';

const accPath = 'src/data/corpus.json';
const acc = JSON.parse(readFileSync(accPath, 'utf8'));

const accChanges = [
  { id: 'ACC-058', field: 'severity', from: 'Best Practice', to: 'Medium' },
  { id: 'ACC-051', field: 'severity', from: 'Medium',        to: 'High'   },
  { id: 'ACC-034', field: 'severity', from: 'Medium',        to: 'High'   },
  { id: 'ACC-076', field: 'sc',       from: '3.2.2',         to: ''       },
];

accChanges.forEach(({ id, field, from, to }) => {
  const e = acc.find(x => x.id === id);
  if (!e) { console.warn('NOT FOUND:', id); return; }
  if (e[field] !== from) { console.warn('UNEXPECTED VALUE in', id, field + ':', e[field], '(expected', from + ')'); return; }
  e[field] = to;
  console.log('ACC', id, field + ':', from, '→', to);
});

writeFileSync(accPath, JSON.stringify(acc, null, 2));

const personalPath = 'src/data/personal-corpus.json';
const personal = JSON.parse(readFileSync(personalPath, 'utf8'));

const personalChanges = [
  { id: 'A11Y-093', field: 'severity', from: 'Best Practice', to: 'Medium' },
  { id: 'A11Y-073', field: 'severity', from: 'Medium',        to: 'High'   },
  { id: 'A11Y-050', field: 'severity', from: 'Medium',        to: 'High'   },
];

personalChanges.forEach(({ id, field, from, to }) => {
  const e = personal.find(x => x.id === id);
  if (!e) { console.warn('NOT FOUND:', id); return; }
  if (e[field] !== from) { console.warn('UNEXPECTED VALUE in', id, field + ':', e[field], '(expected', from + ')'); return; }
  e[field] = to;
  console.log('PERSONAL', id, field + ':', from, '→', to);
});

writeFileSync(personalPath, JSON.stringify(personal, null, 2));
console.log('Done.');
