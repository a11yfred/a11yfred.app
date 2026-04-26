#!/usr/bin/env node
/**
 * translate-missing.mjs
 *
 * Translates any i18n keys that still have English fallback values into the
 * target language using the Anthropic API.
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

// Load English reference
const en = JSON.parse(fs.readFileSync(path.join(I18N_DIR, 'en.json'), 'utf8'))

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

  // Find keys where value is identical to English (English fallback)
  const needsTranslation = {}
  for (const [key, enVal] of Object.entries(en)) {
    if (key in data && data[key] === enVal) {
      needsTranslation[key] = enVal
    }
  }

  const count = Object.keys(needsTranslation).length
  if (count === 0) {
    console.log(`✓ ${locale}: no untranslated keys`)
    continue
  }

  const langName = LOCALE_NAMES[locale] || locale
  console.log(`→ ${locale} (${langName}): translating ${count} keys…`)

  try {
    const translations = await translateBatch(locale, needsTranslation)

    let updated = 0
    for (const [key, translated] of Object.entries(translations)) {
      if (key in data && translated && translated !== en[key]) {
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

console.log(`\nDone. ${totalTranslated} keys translated across ${localeFiles.length} locales.`)
if (totalErrors > 0) console.log(`${totalErrors} locales had errors — re-run to retry.`)
