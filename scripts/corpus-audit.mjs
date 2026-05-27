/* eslint-env node */
/* jshint node: true, esversion: 11 */
/* globals console */

/**
 * Corpus maintenance script that performs three audit tasks:
 * 1. Platform coverage audit — verifies native entries are correctly flagged
 * 2. Related SC links — fills in missing relatedSC arrays
 * 3. Corpus provenance field — adds `source` field based on creditNames
 *
 * Usage: node scripts/corpus-audit.mjs
 * Output: Overwrites src/data/personal-corpus.json in place
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CORPUS_PATH = path.resolve(__dirname, '../src/data/personal-corpus.json')

// --- Related SC mappings for entries that are missing them ---
const RELATED_SC_FILL = {
  'A11Y-031': [
    '1.3.1 Info and Relationships (Level A)',
  ],
  'A11Y-032': [
    '1.3.1 Info and Relationships (Level A)',
    '3.3.2 Labels or Instructions (Level A)',
  ],
  'A11Y-033': [
    '1.3.1 Info and Relationships (Level A)',
    '3.3.2 Labels or Instructions (Level A)',
  ],
  'A11Y-068': [
    '2.1.2 No Keyboard Trap (Level A)',
    '4.1.2 Name, Role, Value (Level A)',
  ],
  'A11Y-077': [
    '2.3.2 Three Flashes (Level AAA)',
  ],
  'A11Y-169': [
    '1.3.1 Info and Relationships (Level A)',
    '4.1.1 Parsing (Level A)',
  ],
  'A11Y-175': [
    '4.1.2 Name, Role, Value (Level A)',
    '1.3.1 Info and Relationships (Level A)',
  ],
}

// --- Source derivation logic ---
// Maps creditNames patterns to source categories
function deriveSource(creditNames) {
  if (!creditNames || creditNames.length === 0) return 'personal'

  const names = creditNames.map(n => n.toLowerCase())

  // If WCAG or W3C WAI is among the credits, it's WAI-sourced
  if (names.some(n => n === 'wcag' || n === 'w3c wai' || n === 'wai-aria apg')) {
    // But if axe is also present, mark as axe (since axe references are more specific)
    if (names.some(n => n.includes('axe') || n.includes('deque'))) return 'axe'
    return 'WAI'
  }

  if (names.some(n => n.includes('axe') || n.includes('deque'))) return 'axe'
  if (names.some(n => n.includes('webai'))) return 'WebAIM'
  if (names.some(n => n === 'tpgi')) return 'TPGi'
  if (names.some(n => n === 'apple' || n === 'google' || n === 'android developers' || n === 'appt')) return 'vendor'

  return 'personal'
}

async function run() {
  const raw = await fs.readFile(CORPUS_PATH, 'utf8')
  const corpus = JSON.parse(raw)

  let relatedFilled = 0
  let sourcesAdded = 0
  const platformIssues = []

  for (const entry of corpus) {
    // --- 1. Platform coverage audit ---
    // Check for entries that mention native-specific keywords but are marked as 'web'
    if (entry.platform === 'web') {
      const text = `${entry.title} ${entry.desc} ${entry.fix}`.toLowerCase()
      const nativeSignals = ['voiceover', 'talkback', 'contentdescription', 'accessibilityelement', 'uikit', 'swiftui', 'jetpack compose', 'android:importantforaccessibility']
      const hasNativeSignal = nativeSignals.some(s => text.includes(s))
      // Only flag if the title or desc strongly suggest it's native-specific
      if (hasNativeSignal && entry.title.includes('(Native App)')) {
        platformIssues.push({ id: entry.id, title: entry.title, current: entry.platform, suggestion: 'native' })
        entry.platform = 'native'
      }
    }

    // --- 2. Related SC links ---
    if ((!entry.relatedSC || entry.relatedSC.length === 0) && RELATED_SC_FILL[entry.id]) {
      entry.relatedSC = RELATED_SC_FILL[entry.id]
      relatedFilled++
    }

    // --- 3. Corpus provenance field ---
    if (!entry.source) {
      entry.source = deriveSource(entry.creditNames)
      sourcesAdded++
    }
  }

  // Write back
  await fs.writeFile(CORPUS_PATH, JSON.stringify(corpus, null, 2) + '\n', 'utf8')

  console.log(`\n=== Corpus Audit Complete ===`)
  console.log(`Total entries: ${corpus.length}`)
  console.log(`Related SC arrays filled: ${relatedFilled}`)
  console.log(`Source fields added: ${sourcesAdded}`)
  if (platformIssues.length > 0) {
    console.log(`Platform corrections:`)
    platformIssues.forEach(p => console.log(`  ${p.id}: ${p.current} → ${p.suggestion} (${p.title})`))
  } else {
    console.log(`Platform audit: all entries correctly flagged ✓`)
  }

  // Summary stats
  const platforms = {}
  const sources = {}
  corpus.forEach(e => {
    platforms[e.platform] = (platforms[e.platform] || 0) + 1
    sources[e.source] = (sources[e.source] || 0) + 1
  })
  console.log(`\nPlatform distribution:`, JSON.stringify(platforms))
  console.log(`Source distribution:`, JSON.stringify(sources))
  console.log(`Entries still missing relatedSC:`, corpus.filter(e => !e.relatedSC || e.relatedSC.length === 0).length)
}

run()
