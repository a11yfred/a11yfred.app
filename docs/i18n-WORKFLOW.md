# i18n Workflow

Complete translation procedures for adding, updating, and maintaining 50+ locale files.

---

## Quick Reference

**New UI text?** Add key to `src/i18n/en.json`, then run:

```bash
ANTHROPIC_API_KEY=... npm run translate
```

**Modified `en.json`?** Run the full workflow below.

**Missing keys in locale files?** Run parity check below.

---

## 1. Adding New UI Strings

### Step 1: Add to `en.json`

Add your key and English value to `src/i18n/en.json`:

```json
{
  "existing_key": "value",
  "new_key_here": "Your English text here"
}
```

### Step 2: Run Translation Script

```bash
ANTHROPIC_API_KEY=... npm run translate
```

The script detects keys still holding English fallback values and translates them into all 49+ non-English locale files in one pass.

### Step 3: Track Changes

Log the change in `docs/UPDATES.md` under the current session's date heading. Note the key name and whether it was added or changed.

### Step 4: Verify Capitalization

After translation batch completes, apply capitalization conventions:

- **English**: NYT title case
- **Romance/Germanic languages** (French, Spanish, German, etc.): Sentence case
- **Caseless scripts** (CJK, Arabic, Uyghur, Tamil, Devanagari): No change

---

## 2. Modifying Existing Keys

If you edit an existing key's English value in `en.json`:

1. Update `docs/i18n-edits.md` with the old and new values
2. Run the full translate workflow (Section 4 below)

Do not update individual locale files manually. Let the translation script retranslate.

---

## 3. Checking Key Parity

Run this after every session that modified `en.json` to ensure all locale files have all keys:

```bash
node -e "
const fs=require('fs'),path=require('path');
const dir='src/i18n';
const en=JSON.parse(fs.readFileSync(path.join(dir,'en.json'),'utf8'));
const keys=Object.keys(en);
fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&f!=='en.json').forEach(f=>{
  const loc=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
  const missing=keys.filter(k=>!(k in loc));
  if(missing.length) console.log(f,missing);
});
console.log('parity check done');
"
```

If missing keys are found, go to Section 4, Step 1 (Parity).

---

## 4. Full Translation Workflow

Run this after major content changes or when the translate run was deferred from a previous session.

Use `src/i18n/es.json` (Spanish) as reference for what keys exist and what translated values look like.

### Step 1: Parity (No API Needed)

Compare `es.json` keys against all other locale files. For every key present in `es.json` that is missing from another locale file, add it with the English value from `en.json` as a placeholder:

```bash
# Manual process:
# 1. Open es.json and note all keys
# 2. For each non-Spanish locale file, check if each es.json key exists
# 3. If missing, add it with English value as placeholder
# 4. Save all files
```

Commit:

```bash
git add src/i18n/
git commit -m "i18n: add missing keys as English placeholders"
```

### Step 2: Retranslate Stale Keys

Find keys whose English source changed since `scripts/en-snapshot.json` was last written. The snapshot records the English value at translation time.

For each key where English differs from the snapshot, retranslate all locale files that still hold the old translation:

```bash
ANTHROPIC_API_KEY=... node scripts/translate-missing.mjs
```

The script auto-detects changed keys by comparing `en.json` against the snapshot.

Commit:

```bash
git add src/i18n/ scripts/en-snapshot.json
git commit -m "i18n: retranslate stale keys, English source changed"
```

### Step 3: Translate English Placeholders

Find all values in non-English locale files that are identical to their `en.json` counterpart (i.e., still an English placeholder):

```bash
ANTHROPIC_API_KEY=... node scripts/translate-missing.mjs
```

Same script, picks up any remaining placeholders.

Commit:

```bash
git add src/i18n/
git commit -m "i18n: translate remaining English placeholder values"
```

### Step 4: Verify and Resolve

After all three steps, verify parity is clean by running the parity check (Section 3 above). Log the translate run in `docs/UPDATES.md` under the current session date.

---

## 5. Hold-off Policy

**Do not run translate workflows during active content-editing periods.** Running `npm run translate` while English content is still changing wastes effort. Edits to existing keys require re-translation of all 49+ locales, not just additions.

Instead:

1. Keep noting changed keys in session notes or `docs/UPDATES.md`
2. Batch them up
3. Do one translate run when English content has stabilized

Do not prompt for a translate run unless:

- There is a clear content freeze
- The user explicitly asks

---

## 6. Corpus Translation

Defect descriptions (`desc`) and suggested fixes (`rem`) in `corpus.json` should have locale-specific overlays when translation adds value.

Run `npm run translate` whenever corpus entries are added or edited.

**Important:** WCAG SC names and codes (`1.1.1`, `aria-label`, etc.) should remain in English in all locales.

---

## 7. Announce String Audit

Verify all `announce()` call strings are pulled from `t()`:

```bash
grep -r "announce(" src/ | grep -v "t('"
```

Should return nothing. Every announce string must be translated, not hardcoded.

---

## 8. Technical Term Review

After machine translation batches, flag corpus entries using WCAG-specific terms for human review:

- accessible name
- focus trap
- landmark
- live region
- ARIA role
- content complement
- decorative

Machine translation of these terms is unreliable. Verify translations before publishing.

---

## 9. Capitalization Quick Reference

Apply these conventions when adding or updating keys:

| Script | Convention | Example |
| --- | --- | --- |
| English | NYT title case | "Copy Finding to Clipboard" |
| French | Sentence case | "Copier la découverte" |
| Spanish | Sentence case | "Copiar el hallazgo" |
| German | Sentence case | "Feststellung kopieren" |
| Japanese | No change | "検索結果をコピー" |
| Chinese | No change | "复制查找结果" |
| Arabic | No change | "نسخ البحث" |

---

## 10. RTL Support

RTL locales (`ar-PS`, `ug` for Uyghur) automatically set `dir="rtl"` on `<html>` when user selects them. No action needed in translation workflow.

Verify with screen reader after any changes to language selection logic in `App.jsx`.

---

## Locale File Count

Current: 50+ locale files

- 1 source: `en.json`
- 49+ translations: `ar-PS.json`, `bg.json`, `cs.json`, `da.json`, `de.json`, `el.json`, `es.json`, `et.json`, `fi.json`, `fr.json`, `hu.json`, `id.json`, `it.json`, `ja.json`, `ko.json`, `lt.json`, `lv.json`, `nb.json`, `nl.json`, `pl.json`, `pt-BR.json`, `pt-PT.json`, `ro.json`, `ru.json`, `sk.json`, `sl.json`, `sv.json`, `th.json`, `tr.json`, `ug.json`, `uk.json`, `zh-CN.json`, `zh-TW.json`, plus others

Check `src/i18n/` for current count.
