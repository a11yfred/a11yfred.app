#!/usr/bin/env node
/**
 * Syncs the overlay vendor list in meryenda/core/overlays.js against
 * the published vendor list at overlayfactsheet.com.
 *
 * Reports new vendors not yet in our signatures and vendors in our
 * signatures that no longer appear on the factsheet.
 * Does not auto-write — human decides what to add/remove.
 *
 * Usage: npm run sync-overlays
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OVERLAYS_PATH = resolve(__dirname, '../meryenda/core/overlays.js')

// --- Parse our current signatures from the JS source ---
function parseOurVendors() {
  const src = readFileSync(OVERLAYS_PATH, 'utf8')
  const names = []
  for (const match of src.matchAll(/name:\s*['"](.+?)['"]/g)) {
    names.push(match[1].toLowerCase())
  }
  return names
}

// --- Fetch vendor list from overlayfactsheet.com ---
async function fetchFactsheetVendors() {
  const res = await fetch('https://overlayfactsheet.com/en/', {
    headers: { 'User-Agent': 'a11yhelper-overlay-sync/1.0' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()

  // Extract only the vendor list — it follows "Some examples of web accessibility overlays"
  const anchorPhrase = 'alphabetical order'
  const anchorIdx = html.indexOf(anchorPhrase)
  if (anchorIdx === -1) throw new Error('Could not find vendor list anchor in page')

  // Take the next <ul>...</ul> block after the anchor
  const ulStart = html.indexOf('<ul', anchorIdx)
  const ulEnd = html.indexOf('</ul>', ulStart) + 5
  const vendorBlock = html.slice(ulStart, ulEnd)

  const vendors = []
  for (const match of vendorBlock.matchAll(/<li>([^<]+)<\/li>/g)) {
    vendors.push(match[1].trim().toLowerCase())
  }
  return [...new Set(vendors)]
}

// --- Fuzzy name match (handles minor naming differences) ---
function normalize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function isMatch(factsheetName, ourNames) {
  const fn = normalize(factsheetName)
  return ourNames.some(n => {
    const on = normalize(n)
    return on.includes(fn) || fn.includes(on)
  })
}

// --- Main ---
const ourVendors = parseOurVendors()
console.log(`\nOur signatures: ${ourVendors.length} vendors`)

let factsheetVendors
try {
  factsheetVendors = await fetchFactsheetVendors()
  console.log(`Factsheet vendors: ${factsheetVendors.length} found\n`)
} catch (err) {
  console.error(`Failed to fetch factsheet: ${err.message}`)
  process.exit(1)
}

const newVendors = factsheetVendors.filter(fv => !isMatch(fv, ourVendors))
const removedVendors = ourVendors.filter(ov => !isMatch(ov, factsheetVendors))

const hasChanges = newVendors.length > 0 || removedVendors.length > 0

if (!hasChanges) {
  console.log('✓ Signatures are up to date — no new vendors detected.')
} else {
  if (newVendors.length > 0) {
    console.log('NEW vendors on factsheet not in our signatures:')
    for (const v of newVendors) console.log(`  + ${v}`)
    console.log('\nAdd these to tools/meryenda/core/overlays.js with their CDN domain and global.\n')
  }

  if (removedVendors.length > 0) {
    console.log('Vendors in our signatures no longer on factsheet:')
    for (const v of removedVendors) console.log(`  - ${v}`)
    console.log('\nConsider removing or marking these as deprecated.\n')
  }
}

setTimeout(() => process.exit(hasChanges ? 1 : 0), 100)
