# Community Translations Guide

A11yFred supports over 50 languages. We welcome contributions to expand our translations, correct machine translation errors, and keep the UI accessible in all locales.

---

## 1. How the i18n System Works

Our translation engine is powered by `@ulam/calamansi`.

- **Source File**: `src/calamansi/en.json` is the single source of truth for all UI strings.
- **Locale Files**: Translation files are located in `src/calamansi/{locale}.json` (e.g., `es.json` for Spanish, `fr.json` for French).
- **RTL Support**: Right-to-Left scripts (Arabic, Uyghur) are handled automatically by setting `dir="rtl"` on `<html>` when selected.

---

## 2. Contributing Translations

There are two primary ways you can help:

### Option A: Direct JSON Contributions

If you want to manually update or fix translation keys for your language:

1. Open the target JSON file in `src/calamansi/{locale}.json`.
2. Locate the key that needs fixing.
3. Edit the translation, keeping variables like `{count}` or `{result}` intact.
4. Capitalization rules:
   - **Sentence Case**: Spanish, French, Italian, German, Portuguese, etc.
   - **NYT Title Case**: English keys.
   - **No Change**: CJK (Chinese, Japanese, Korean) or caseless scripts (Arabic, Tamil).
5. Submit a Pull Request with your translation fix.

### Option B: Crowdsourcing New Locales

To add support for a completely new language:

1. Create a copy of `src/calamansi/en.json` named with your language's ISO 639-1 code (e.g., `it.json` for Italian, if not already present).
2. Translate all the values on the right side of the keys.
3. Register the new locale code in `src/locales-i18n.js` to expose it in the Settings Panel dropdown.
4. Verify the layout using your new language.

---

## 3. Translation Validation & Scripts

Before submitting your PR, you can check if your translation file is in sync:

```bash
# Check key parity between en.json and all other languages
node -e "
const fs=require('fs'),path=require('path');
const dir='src/calamansi';
const en=JSON.parse(fs.readFileSync(path.join(dir,'en.json'),'utf8'));
const keys=Object.keys(en);
fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&f!=='en.json').forEach(f=>{
  const loc=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
  const missing=keys.filter(k=>!(k in loc));
  if(missing.length) console.log(f, 'Missing keys:', missing);
});
"
```

If you have a machine translation API key set up, you can automatically translate missing keys using:

```bash
ANTHROPIC_API_KEY=your_key_here npm run translate
```

This runs the translation script located in `scripts/translate-missing.mjs` which translates all English placeholders into the target languages.
