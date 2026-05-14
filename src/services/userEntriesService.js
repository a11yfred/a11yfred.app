/**
 * userEntriesService.js
 *
 * Phase 1: localStorage-backed CRUD for user-created entries.
 * IDs use the "USR-NNN" prefix to distinguish them from corpus entries ("ACC-NNN").
 *
 * Phase 2 (Supabase): swap the body of each function to call the Supabase
 * `user_entries` table. The hook (useUserEntries.js) and all callers remain
 * unchanged, only this file needs updating.
 */

import { makeIdGenerator } from '../sawsawan/makeIdGenerator.js'
import { LS_USER_ENTRIES } from '../utils/constants.js'
import { getStorageJson, setStorageJson } from '../utils/storage.js'
const nextId = makeIdGenerator('USR')

function load() { return getStorageJson(LS_USER_ENTRIES, []) }
function persist(entries) { setStorageJson(LS_USER_ENTRIES, entries) }

export function loadUserEntries() {
  return load()
}

/**
 * Upsert an entry. If an entry with the same id already exists it is
 * replaced; otherwise the entry is appended. Returns the stored entry.
 */
export function saveUserEntry(entry) {
  const all = load()
  const now = new Date().toISOString()
  const stored = {
    ...entry,
    updatedAt: now,
    createdAt: entry.createdAt ?? now,
    source: 'user',
  }
  const idx = all.findIndex(f => f.id === stored.id)
  if (idx >= 0) all[idx] = stored
  else all.push(stored)
  persist(all)
  return stored
}

/**
 * Remove an entry by id. No-op if the id is not found.
 */
export function deleteUserEntry(entryId) {
  persist(load().filter(f => f.id !== entryId))
}

/**
 * Build a blank user entry with sensible defaults.
 * Pass any overrides in `fields`.
 */
export function createUserEntry(fields = {}) {
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
    relatedSC: [],
    keywords:  [],
    source:    'user',
    createdAt: now,
    updatedAt: now,
    ...fields,
  }
}

/**
 * Derive a new user entry from an existing corpus or user entry.
 * The copy gets a new USR-NNN id and a `copiedFrom` pointer to the original.
 */
export function copyUserEntry(sourceEntry) {
  const existing = load()
  const now = new Date().toISOString()
  return {
    id:         nextId(existing),
    title:      `${sourceEntry.title} (copy)`,
    sc:         sourceEntry.sc        ?? '',
    primarySC:    sourceEntry.primarySC   ?? '',
    severity:   sourceEntry.severity  ?? 'Medium',
    platform:   sourceEntry.platform  ?? 'both',
    desc:       sourceEntry.desc      ?? '',
    fix:        sourceEntry.fix       ?? '',
    relatedSC:  [...(sourceEntry.relatedSC  || [])],
    keywords:   [...(sourceEntry.keywords  || [])],
    copiedFrom: sourceEntry.id,
    source:     'user',
    createdAt:  now,
    updatedAt:  now,
  }
}
