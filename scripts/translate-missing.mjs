#!/usr/bin/env node
/**
 * translate-missing.mjs
 *
 * Translates i18n keys that are either:
 *   (a) still holding their English placeholder value, or
 *   (b) previously translated from an English source that has since changed
 *       (detected by comparing en.json against scripts/en-snapshot.json).
 *
 * After a successful run the snapshot is updated so future runs only
 * re-translate keys whose English source has changed again.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/translate-missing.mjs
 *   ANTHROPIC_API_KEY=... node scripts/translate-missing.mjs --locale fr
 *   ANTHROPIC_API_KEY=... node scripts/translate-missing.mjs --locale fr,de,ja
 *
 * Requires Node 18+ (native fetch).
 * Skips English variant locales (en-AU, en-GB, en-IN, en-ZA).
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const I18N_DIR = path.join(__dirname, '..', 'src', 'i18n')
const SNAPSHOT_PATH = path.join(__dirname, 'en-snapshot.json')

const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is not set.')
  console.error('Usage: ANTHROPIC_API_KEY=sk-ant-... node scripts/translate-missing.mjs')
  process.exit(1)
}

// Locale → human-readable name for the translation prompt
const LOCALE_NAMES = {
  af:     'Afrikaans',
  'ar-PS':'Arabic (Palestinian dialect)',
  bo:     'Tibetan (Standard)',
  cbk:    'Chabacano (Zamboangueño)',
  ceb:    'Cebuano',
  cr:     'Cree (Plains)',
  crh:    'Crimean Tatar',
  de:     'German',
  eo:     'Esperanto',
  es:     'Spanish (Latin America)',
  'es-ES':'Spanish (Spain)',
  'es-PH':'Spanish (Philippines)',
  eu:     'Basque',
  fr:     'French',
  'fr-CA':'French (Canadian)',
  gn:     'Guaraní (Paraguayan)',
  haw:    'Hawaiian',
  hi:     'Hindi',
  ht:     'Haitian Creole',
  ilo:    'Ilokano',
  iu:     'Inuktitut',
  ja:     'Japanese',
  ko:     'Korean',
  mi:     'Māori',
  nah:    'Nahuatl (Classical)',
  nl:     'Dutch',
  nv:     'Navajo (Diné bizaad)',
  oj:     'Ojibwe (Anishinaabemowin)',
  pig:    'Pig Latin',
  pir:    'Pirate speak (playful)',
  pjt:    'Palawa kani',
  pt:     'Portuguese (European)',
  'pt-BR':'Portuguese (Brazilian)',
  qu:     'Quechua',
  rhg:    'Rohingya (Ruáingga)',
  sv:     'Swedish',
  ta:     'Tamil',
  tl:     'Filipino (Tagalog)',
  tlh:    'Klingon',
  ug:     'Uyghur',
  val:    'Valencian',
  vi:     'Vietnamese',
  yue:    'Cantonese (Traditional Chinese)',
  zgh:    'Tamazight (Standard Moroccan)',
  zh:     'Chinese (Simplified)',
}

// English variant locales — skip translation, they're already English
const ENGLISH_VARIANTS = new Set(['en', 'en-AU', 'en-GB', 'en-IN', 'en-ZA'])

// Delay between API calls (ms) to avoid rate limiting
const DELAY_MS = 500

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function translateBatch(locale, keysToValues) {
  const langName = LOCALE_NAMES[locale] || locale
  const keyCount = Object.keys(keysToValues).length

  const prompt = `You are translating UI strings for an accessibility audit tool used by web and mobile app developers.

Translate the following JSON object from English into ${langName}.

Rules:
- Keep placeholder tokens like {count}, {query}, {label}, {platform}, {provider} exactly as written
- Keep HTML entities unchanged
- Keep decorative markers like ~*~ unchanged
- Keep technical terms like "WCAG", "API", "localStorage", "Ko-fi" unchanged
- Preserve the same register (professional, direct)
- Return only valid JSON with the same keys, no extra text or markdown

Strings to translate (${keyCount} keys):
${JSON.stringify(keysToValues, null, 2)}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text || '{}'

  // Extract JSON block from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`No JSON object in response`)

  return JSON.parse(jsonMatch[0])
}

// Parse --locale flag
const localeArg = process.argv.find((a, i) => process.argv[i - 1] === '--locale')
const targetLocales = localeArg ? localeArg.split(',').map(s => s.trim()) : null

// Load English reference and snapshot of English values at last translation time
const en = JSON.parse(fs.readFileSync(path.join(I18N_DIR, 'en.json'), 'utf8'))
const snapshot = fs.existsSync(SNAPSHOT_PATH)
  ? JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'))
  : {}

// Keys whose English source changed since the last translation run
const sourceChanged = new Set(
  Object.keys(en).filter(k => k in snapshot && snapshot[k] !== en[k])
)

if (sourceChanged.size > 0) {
  console.log(`\nDetected ${sourceChanged.size} key(s) whose English source changed since last run:`)
  for (const k of sourceChanged) {
    console.log(`  ${k}`)
    console.log(`    was: ${snapshot[k]}`)
    console.log(`    now: ${en[k]}`)
  }
  console.log()
}

const localeFiles = fs.readdirSync(I18N_DIR)
  .filter(f => f.endsWith('.json') && f !== 'en.json')
  .map(f => f.replace('.json', ''))
  .filter(locale => !ENGLISH_VARIANTS.has(locale))
  .filter(locale => !targetLocales || targetLocales.includes(locale))

let totalTranslated = 0
let totalErrors = 0

for (const locale of localeFiles) {
  const filePath = path.join(I18N_DIR, `${locale}.json`)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  const needsTranslation = {}
  for (const [key, enVal] of Object.entries(en)) {
    const isMissing = !(key in data)
    const hasEnglishPlaceholder = !isMissing && data[key] === enVal
    const isStaleTranslation = sourceChanged.has(key) && !isMissing && data[key] !== enVal

    if (isMissing || hasEnglishPlaceholder || isStaleTranslation) {
      needsTranslation[key] = enVal
    }
  }

  const count = Object.keys(needsTranslation).length
  if (count === 0) {
    console.log(`✓ ${locale}: up to date`)
    continue
  }

  const staleCount = Object.keys(needsTranslation).filter(k => sourceChanged.has(k)).length
  const newCount = count - staleCount
  const langName = LOCALE_NAMES[locale] || locale
  const detail = [newCount && `${newCount} new`, staleCount && `${staleCount} updated`].filter(Boolean).join(', ')
  console.log(`→ ${locale} (${langName}): translating ${count} keys (${detail})…`)

  try {
    const translations = await translateBatch(locale, needsTranslation)

    let updated = 0
    for (const [key, translated] of Object.entries(translations)) {
      if (translated && translated !== en[key]) {
        data[key] = translated
        updated++
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
    console.log(`  ✓ ${updated} keys written`)
    totalTranslated += updated
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`)
    totalErrors++
  }

  await sleep(DELAY_MS)
}

// Update snapshot to reflect current English source so the next run
// only re-translates keys that change after this point.
if (totalErrors === 0 || totalTranslated > 0) {
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(en, null, 2) + '\n', 'utf8')
  console.log('\nSnapshot updated.')
}

console.log(`\nDone. ${totalTranslated} keys translated across ${localeFiles.length} locales.`)
if (totalErrors > 0) console.log(`${totalErrors} locales had errors — re-run to retry.`)
