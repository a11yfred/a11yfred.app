/**
 * userFindingsService.js
 *
 * Phase 1: localStorage-backed CRUD for user-created findings.
 * IDs use the "USR-NNN" prefix to distinguish them from corpus entries ("ATH-NNN").
 *
 * Phase 2 (Supabase): swap the body of each function to call the Supabase
 * `user_findings` table. The hook (useUserFindings.js) and all callers remain
 * unchanged, only this file needs updating.
 */

const STORAGE_KEY = 'userFindings'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function persist(findings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(findings)) } catch { /* storage unavailable */ }
}

function nextId(existing) {
  const nums = existing
    .map(f => { const m = f.id?.match(/^USR-(\d+)$/); return m ? parseInt(m[1], 10) : 0 })
    .filter(n => n > 0)
  const max = nums.length ? Math.max(...nums) : 0
  return `USR-${String(max + 1).padStart(3, '0')}`
}

export function loadUserFindings() {
  return load()
}

/**
 * Upsert a finding. If a finding with the same id already exists it is
 * replaced; otherwise the finding is appended. Returns the stored finding.
 */
export function saveUserFinding(finding) {
  const all = load()
  const now = new Date().toISOString()
  const stored = {
    ...finding,
    updatedAt: now,
    createdAt: finding.createdAt ?? now,
    source: 'user',
  }
  const idx = all.findIndex(f => f.id === stored.id)
  if (idx >= 0) all[idx] = stored
  else all.push(stored)
  persist(all)
  return stored
}

/**
 * Remove a finding by id. No-op if the id is not found.
 */
export function deleteUserFinding(findingId) {
  persist(load().filter(f => f.id !== findingId))
}

/**
 * Build a blank user finding with sensible defaults.
 * Pass any overrides in `fields`.
 */
export function createUserFinding(fields = {}) {
  const existing = load()
  const now = new Date().toISOString()
  return {
    id:        nextId(existing),
    title:     '',
    sc:        '',
    primarySC:   '',
    priority:  'Medium',
    platform:  'both',
    desc:      '',
    fix:       '',
    related:   [],
    keywords:  [],
    source:    'user',
    createdAt: now,
    updatedAt: now,
    ...fields,
  }
}

/**
 * Derive a new user finding from an existing corpus or user finding.
 * The copy gets a new USR-NNN id and a `copiedFrom` pointer to the original.
 */
export function copyUserFinding(sourceFinding) {
  const existing = load()
  const now = new Date().toISOString()
  return {
    id:         nextId(existing),
    title:      `${sourceFinding.title} (copy)`,
    sc:         sourceFinding.sc        ?? '',
    primarySC:    sourceFinding.primarySC   ?? '',
    severity:   sourceFinding.severity  ?? 'Medium',
    platform:   sourceFinding.platform  ?? 'both',
    desc:       sourceFinding.desc      ?? '',
    fix:        sourceFinding.fix       ?? '',
    relatedSC:  [...(sourceFinding.relatedSC  || [])],
    keywords:   [...(sourceFinding.keywords  || [])],
    copiedFrom: sourceFinding.id,
    source:     'user',
    createdAt:  now,
    updatedAt:  now,
  }
}
