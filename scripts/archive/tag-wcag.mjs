#!/usr/bin/env node
/**
 * tag-wcag.mjs
 * Adds wcagVersion and wcagLevel to every corpus entry based on its sc field.
 * Run once: node scripts/tag-wcag.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CORPUS = join(__dirname, '../src/data/corpus.json')

// SC number → [wcagVersion, wcagLevel]
const SC_MAP = {
  // ── WCAG 2.0 ────────────────────────────────────────────────
  // Level A
  '1.1.1': ['2.0','A'], '1.2.1': ['2.0','A'], '1.2.2': ['2.0','A'],
  '1.2.3': ['2.0','A'], '1.3.1': ['2.0','A'], '1.3.2': ['2.0','A'],
  '1.3.3': ['2.0','A'], '1.4.1': ['2.0','A'], '1.4.2': ['2.0','A'],
  '2.1.1': ['2.0','A'], '2.1.2': ['2.0','A'], '2.2.1': ['2.0','A'],
  '2.2.2': ['2.0','A'], '2.3.1': ['2.0','A'], '2.4.1': ['2.0','A'],
  '2.4.2': ['2.0','A'], '2.4.3': ['2.0','A'], '2.4.4': ['2.0','A'],
  '3.1.1': ['2.0','A'], '3.2.1': ['2.0','A'], '3.2.2': ['2.0','A'],
  '3.3.1': ['2.0','A'], '3.3.2': ['2.0','A'], '4.1.1': ['2.0','A'],
  '4.1.2': ['2.0','A'],
  // Level AA
  '1.2.4': ['2.0','AA'], '1.2.5': ['2.0','AA'], '1.4.3': ['2.0','AA'],
  '1.4.4': ['2.0','AA'], '1.4.5': ['2.0','AA'], '2.4.5': ['2.0','AA'],
  '2.4.6': ['2.0','AA'], '2.4.7': ['2.0','AA'], '3.1.2': ['2.0','AA'],
  '3.2.3': ['2.0','AA'], '3.2.4': ['2.0','AA'], '3.3.3': ['2.0','AA'],
  '3.3.4': ['2.0','AA'],
  // Level AAA
  '1.2.6': ['2.0','AAA'], '1.2.7': ['2.0','AAA'], '1.2.8': ['2.0','AAA'],
  '1.2.9': ['2.0','AAA'], '1.4.6': ['2.0','AAA'], '1.4.7': ['2.0','AAA'],
  '1.4.8': ['2.0','AAA'], '1.4.9': ['2.0','AAA'], '2.1.3': ['2.0','AAA'],
  '2.2.3': ['2.0','AAA'], '2.2.4': ['2.0','AAA'], '2.2.5': ['2.0','AAA'],
  '2.3.2': ['2.0','AAA'], '2.4.8': ['2.0','AAA'], '2.4.9': ['2.0','AAA'],
  '2.4.10': ['2.0','AAA'], '3.1.3': ['2.0','AAA'], '3.1.4': ['2.0','AAA'],
  '3.1.5': ['2.0','AAA'], '3.1.6': ['2.0','AAA'], '3.2.5': ['2.0','AAA'],
  '3.3.5': ['2.0','AAA'], '3.3.6': ['2.0','AAA'],
  // ── WCAG 2.1 (new SCs only) ────────────────────────────────
  // Level A
  '2.5.1': ['2.1','A'], '2.5.2': ['2.1','A'], '2.5.3': ['2.1','A'], '2.5.4': ['2.1','A'],
  // Level AA
  '1.3.4': ['2.1','AA'], '1.3.5': ['2.1','AA'], '1.4.10': ['2.1','AA'],
  '1.4.11': ['2.1','AA'], '1.4.12': ['2.1','AA'], '1.4.13': ['2.1','AA'],
  '4.1.3': ['2.1','AA'],
  // Level AAA
  '1.3.6': ['2.1','AAA'], '2.1.4': ['2.1','AAA'], '2.2.6': ['2.1','AAA'],
  '2.3.3': ['2.1','AAA'], '2.5.5': ['2.1','AAA'], '2.5.6': ['2.1','AAA'],
  // ── WCAG 2.2 (new SCs only) ────────────────────────────────
  // Level A
  '3.2.6': ['2.2','A'], '3.3.7': ['2.2','A'],
  // Level AA
  '2.4.11': ['2.2','AA'], '2.5.7': ['2.2','AA'], '2.5.8': ['2.2','AA'],
  '3.3.8': ['2.2','AA'],
  // Level AAA
  '2.4.13': ['2.2','AAA'], '3.2.7': ['2.2','AAA'], '3.3.9': ['2.2','AAA'],
}

const corpus = JSON.parse(readFileSync(CORPUS, 'utf8'))

const updated = corpus.map(entry => {
  const sc = entry.sc
  const hasRealSC = sc && sc !== 'N/A' && sc !== ''
  const info = hasRealSC ? SC_MAP[sc] : null

  if (hasRealSC && !info) console.warn(`  ⚠  Unknown SC: "${sc}" in ${entry.id}`)

  const wcagVersion = info ? info[0] : ''
  const wcagLevel   = info ? info[1] : ''

  // Explicit field order: insert wcagVersion + wcagLevel right after scLabel
  const { id, title, sc: sc_, scLabel, related, priority, platform, source, keywords, desc, rem, ...rest } = entry
  return { id, title, sc: sc_, scLabel, wcagVersion, wcagLevel, related, priority, platform, source, keywords, desc, rem, ...rest }
})

writeFileSync(CORPUS, JSON.stringify(updated, null, 2) + '\n', 'utf8')

const breakdown = updated.reduce((acc, e) => {
  const k = e.wcagVersion || '(none)'
  acc[k] = (acc[k] || 0) + 1
  return acc
}, {})
console.log(`Tagged ${updated.length} entries.`)
console.log('Version breakdown:', breakdown)
