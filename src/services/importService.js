/**
 * importService.js
 *
 * Parses user-supplied files (CSV, Excel, JSON) or a remote JSON URL into the
 * corpus finding schema, then returns normalized findings ready for
 * userFindingsService.saveUserFinding().
 *
 * Supported input formats:
 *   File upload: .csv, .xlsx, .xls, .json
 *   URL:         any publicly accessible JSON endpoint (no auth)
 *                Phase 2 auth-gated sources (Supabase) are handled in dataService.js
 *
 * Return shape (both importFromFile and importFromUrl):
 *   { findings: [...NormalizedFinding], skipped: [...{ row, reason }], total: n }
 *
 * SheetJS (xlsx) is lazy-loaded on first spreadsheet import so it does not
 * affect initial bundle size.
 */

import { loadUserFindings } from './userFindingsService.js'

// ---------------------------------------------------------------------------
// Column name aliases — matched case-insensitively with spaces/underscores/
// hyphens stripped. First match wins.
// ---------------------------------------------------------------------------

const FIELD_ALIASES = {
  id:       ['id', 'findingid', 'issueid', 'defectid', 'entryid'],
  title:    ['title', 'name', 'finding', 'issue', 'issuename', 'findingname', 'summary', 'subject'],
  sc:       ['sc', 'wcagsc', 'successcriterion', 'successcriteria', 'criterion', 'wcagnumber'],
  scLabel:  ['sclabel', 'criterionlabel', 'wcaglabel', 'wcag', 'successcriterionlabel', 'wcagcriterion'],
  priority: ['priority', 'severity', 'impact', 'level', 'risk', 'criticality'],
  platform: ['platform', 'device', 'environment', 'target'],
  desc:     ['desc', 'description', 'observation', 'issuedescription', 'details', 'body', 'problemstatement'],
  rem:      ['rem', 'remediation', 'recommendation', 'fix', 'solution', 'howtofix', 'suggestion', 'corrective'],
  keywords: ['keywords', 'tags', 'searchterms', 'labels'],
  related:  ['related', 'relatedsc', 'relatedcriteria', 'alsofails', 'additionalsc'],
  source:   ['source', 'origin', 'credit', 'datasource'],
}

const PRIORITY_MAP = {
  critical: 'Critical', blocker: 'Critical', p0: 'Critical', showstopper: 'Critical',
  high: 'High', major: 'High', p1: 'High', serious: 'High',
  medium: 'Medium', moderate: 'Medium', p2: 'Medium', significant: 'Medium', normal: 'Medium',
  low: 'Low', minor: 'Low', p3: 'Low',
  bestpractice: 'Best Practice', advisory: 'Best Practice', enhancement: 'Best Practice',
  info: 'Best Practice', informational: 'Best Practice', suggestion: 'Best Practice',
}

const PLATFORM_MAP = {
  web: 'web', browser: 'web', website: 'web', desktop: 'web',
  native: 'native', app: 'native', mobile: 'native', ios: 'native', android: 'native',
  both: 'both', all: 'both', any: 'both', crossplatform: 'both', universal: 'both',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeKey(k) {
  return String(k).toLowerCase().replace(/[\s_\-./]/g, '')
}

function pickField(row, field) {
  const aliases = FIELD_ALIASES[field] || [field]
  const normalizedRow = {}
  for (const [k, v] of Object.entries(row)) {
    normalizedRow[normalizeKey(k)] = v
  }
  for (const alias of aliases) {
    const val = normalizedRow[alias]
    if (val !== undefined && val !== null && val !== '') return String(val).trim()
  }
  return null
}

function normalizePriority(raw) {
  if (!raw) return 'Medium'
  const key = normalizeKey(raw)
  return PRIORITY_MAP[key] || 'Medium'
}

function normalizePlatform(raw) {
  if (!raw) return 'both'
  const key = normalizeKey(raw)
  return PLATFORM_MAP[key] || 'both'
}

function splitList(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map(s => String(s).trim()).filter(Boolean)
  return String(raw).split(/[,;|]/).map(s => s.trim()).filter(Boolean)
}

// Stateful ID generator — call make() for each new finding in a batch
function makeIdGenerator(existingFindings) {
  const nums = existingFindings
    .map(f => { const m = f.id?.match(/^USR-(\d+)$/); return m ? parseInt(m[1], 10) : 0 })
    .filter(n => n > 0)
  let counter = nums.length ? Math.max(...nums) : 0
  return () => `USR-${String(++counter).padStart(3, '0')}`
}

// ---------------------------------------------------------------------------
// Row normalizer
// ---------------------------------------------------------------------------

function normalizeRow(row, genId, defaultSource) {
  const title = pickField(row, 'title')
  if (!title) return { ok: false, reason: 'Missing required field: title' }

  const rawId = pickField(row, 'id')
  // Reject ATH-* IDs — those belong to the public corpus namespace
  const id = (rawId && !rawId.match(/^ATH-/i)) ? rawId : genId()

  const now = new Date().toISOString()
  return {
    ok: true,
    finding: {
      id,
      title,
      sc:        pickField(row, 'sc')        || '',
      scLabel:   pickField(row, 'scLabel')   || '',
      priority:  normalizePriority(pickField(row, 'priority')),
      platform:  normalizePlatform(pickField(row, 'platform')),
      source:    pickField(row, 'source')    || defaultSource,
      keywords:  splitList(pickField(row, 'keywords')),
      related:   splitList(pickField(row, 'related')),
      desc:      pickField(row, 'desc')      || '',
      rem:       pickField(row, 'rem')       || '',
      createdAt: now,
      updatedAt: now,
    },
  }
}

// ---------------------------------------------------------------------------
// Batch processor
// ---------------------------------------------------------------------------

function processRows(rows, options = {}) {
  const { source = 'import' } = options
  const existing = loadUserFindings()
  const genId = makeIdGenerator(existing)

  const findings = []
  const skipped = []

  for (const row of rows) {
    const result = normalizeRow(row, genId, source)
    if (result.ok) findings.push(result.finding)
    else skipped.push({ row, reason: result.reason })
  }

  return { findings, skipped, total: rows.length }
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

async function parseSpreadsheet(file) {
  const XLSX = await import('xlsx')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        resolve(XLSX.utils.sheet_to_json(ws, { defval: '' }))
      } catch (err) {
        reject(new Error(`Failed to parse spreadsheet: ${err.message}`))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

async function parseJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result)
        resolve(Array.isArray(parsed) ? parsed : [parsed])
      } catch (err) {
        reject(new Error(`Invalid JSON: ${err.message}`))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse and normalize a user-uploaded file.
 * Accepts .csv, .xlsx, .xls, .json
 *
 * @param {File} file
 * @param {{ source?: string }} options
 * @returns {Promise<{ findings, skipped, total }>}
 */
export async function importFromFile(file, options = {}) {
  const ext = file.name.split('.').pop().toLowerCase()
  let rows

  if (ext === 'json') {
    rows = await parseJsonFile(file)
  } else if (['csv', 'xlsx', 'xls', 'ods'].includes(ext)) {
    rows = await parseSpreadsheet(file)
  } else {
    throw new Error(`Unsupported file type: .${ext}. Use .csv, .xlsx, .xls, or .json`)
  }

  return processRows(rows, options)
}

/**
 * Fetch a public JSON URL and normalize its contents.
 * For auth-gated Supabase sources use dataService.getUserFindings() instead.
 *
 * @param {string} url
 * @param {{ source?: string }} options
 * @returns {Promise<{ findings, skipped, total }>}
 */
export async function importFromUrl(url, options = {}) {
  let res
  try {
    res = await fetch(url)
  } catch {
    throw new Error('Network error — could not reach the URL')
  }
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`)

  let parsed
  try {
    parsed = await res.json()
  } catch {
    throw new Error('URL did not return valid JSON')
  }

  const rows = Array.isArray(parsed) ? parsed : [parsed]
  return processRows(rows, options)
}

/**
 * Accepted file extensions for use in <input accept="..."> attributes.
 */
export const ACCEPTED_EXTENSIONS = '.csv,.xlsx,.xls,.json'
