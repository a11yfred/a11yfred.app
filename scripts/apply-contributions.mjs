/**
 * apply-contributions.mjs
 *
 * Maintainer approval script. Reads a JSON file of exported contributions
 * (from contributionService.exportContributionsJson()) and patches:
 *   - src/data/corpus.json         for all_langs and lang_and_en (English fields)
 *   - src/data/translations/{locale}.json  for lang_only and lang_and_en (locale fields)
 *
 * Usage:
 *   node scripts/apply-contributions.mjs <contributions.json>
 *
 * Workflow:
 *   1. In the app: Settings → Contributions → Export as JSON → save file
 *   2. Review each entry in the exported file; delete any you want to reject
 *   3. Run this script with the edited file
 *   4. Review the git diff (corpus.json and/or translation files)
 *   5. Commit: "corpus: apply approved contributions from {date}"
 *
 * The script is idempotent — running it twice with the same input produces
 * the same result.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dir, '..')

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function translationPath(locale) {
  return resolve(ROOT, 'src/data/translations', `${locale}.json`)
}

// ─── Validation ──────────────────────────────────────────────────────────────

const VALID_SCOPES = new Set(['lang_only', 'lang_and_en', 'all_langs'])

function validateContribution(c, idx) {
  const errors = []
  if (!c.id)        errors.push('missing id')
  if (!c.findingId) errors.push('missing findingId')
  if (!c.locale)    errors.push('missing locale')
  if (!VALID_SCOPES.has(c.scope)) errors.push(`invalid scope "${c.scope}"`)
  if (!c.localeFields || typeof c.localeFields !== 'object') errors.push('missing localeFields')
  if (c.scope === 'lang_and_en' && (!c.enFields || typeof c.enFields !== 'object')) {
    errors.push('scope=lang_and_en requires enFields')
  }
  if (errors.length) {
    console.error(`  [SKIP] entry ${idx} (${c.id || 'no id'}): ${errors.join(', ')}`)
    return false
  }
  return true
}

// ─── Main ────────────────────────────────────────────────────────────────────

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Usage: node scripts/apply-contributions.mjs <contributions.json>')
  process.exit(1)
}

const contributions = readJson(resolve(inputPath))
if (!Array.isArray(contributions)) {
  console.error('Input must be a JSON array of contribution objects.')
  process.exit(1)
}

console.log(`\nApplying ${contributions.length} contribution(s)...\n`)

const corpusPath = resolve(ROOT, 'src/data/corpus.json')
const corpus = readJson(corpusPath)
const corpusById = Object.fromEntries(corpus.map((e, i) => [e.id, { entry: e, idx: i }]))

let corpusModified = false
const translationPatches = {}  // { locale: { findingId: { title?, desc?, rem? } } }

for (let i = 0; i < contributions.length; i++) {
  const c = contributions[i]
  if (!validateContribution(c, i)) continue

  const corpusEntry = corpusById[c.findingId]
  if (!corpusEntry) {
    console.warn(`  [WARN] findingId "${c.findingId}" not found in corpus — skipping`)
    continue
  }

  const { scope, locale, localeFields, enFields, findingId } = c

  // ── Apply English field updates (all_langs or lang_and_en) ─────────────────

  if (scope === 'all_langs' || scope === 'lang_and_en') {
    const fields = scope === 'all_langs' ? localeFields : (enFields || {})
    if (fields.desc !== undefined && fields.desc !== null) {
      corpus[corpusEntry.idx].desc = fields.desc
      corpusModified = true
    }
    if (fields.fix !== undefined && fields.fix !== null) {
      corpus[corpusEntry.idx].fix = fields.fix
      corpusModified = true
    }
    const changed = Object.entries(fields).filter(([k]) => k === 'desc' || k === 'fix').map(([k]) => k)
    if (changed.length) {
      console.log(`  [EN]   ${findingId} (${scope}) — updated: ${changed.join(', ')}`)
    }
  }

  // ── Apply locale-specific field updates (lang_only or lang_and_en) ─────────

  if (scope === 'lang_only' || scope === 'lang_and_en') {
    const tPath = translationPath(locale)
    if (!existsSync(tPath)) {
      console.warn(`  [WARN] No translation file for locale "${locale}" — creating one`)
    }

    if (!translationPatches[locale]) {
      translationPatches[locale] = existsSync(tPath) ? readJson(tPath) : {}
    }

    const existing = translationPatches[locale][findingId] || {}
    const updated = { ...existing }

    // Preserve existing title if not being replaced
    if (!updated.title && corpusById[findingId]) {
      // Title isn't editable in the current UI flow — carry through from existing overlay
    }

    if (localeFields.desc !== undefined && localeFields.desc !== null) {
      updated.desc = localeFields.desc
    }
    if (localeFields.fix !== undefined && localeFields.fix !== null) {
      updated.fix = localeFields.fix
    }

    translationPatches[locale][findingId] = updated

    const changed = Object.entries(localeFields).filter(([k]) => k === 'desc' || k === 'fix').map(([k]) => k)
    if (changed.length) {
      console.log(`  [${locale.toUpperCase()}] ${findingId} (${scope}) — updated: ${changed.join(', ')}`)
    }
  }
}

// ─── Write outputs ───────────────────────────────────────────────────────────

if (corpusModified) {
  writeJson(corpusPath, corpus)
  console.log('\n✓ corpus.json updated')
} else {
  console.log('\n  corpus.json — no changes')
}

for (const [locale, overlay] of Object.entries(translationPatches)) {
  writeJson(translationPath(locale), overlay)
  console.log(`✓ translations/${locale}.json updated`)
}

const totalLocales = Object.keys(translationPatches).length
console.log(`\nDone. Corpus: ${corpusModified ? 'modified' : 'unchanged'}, locale files: ${totalLocales} modified.\n`)
console.log('Next steps:')
console.log('  git diff src/data/')
console.log('  git add src/data/corpus.json src/data/translations/')
console.log('  git commit -m "corpus: apply approved contributions from $(date +%Y-%m-%d)"\n')
