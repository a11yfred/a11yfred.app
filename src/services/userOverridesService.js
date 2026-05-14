/**
 * userOverridesService.js
 *
 * Phase 1: localStorage-backed personal locale overrides for corpus entries.
 * When a user edits an entry's desc/fix while in a non-English locale and
 * chooses "Save to personal", the override is stored here and applied at
 * runtime on top of the corpus + translation overlay.
 *
 * Schema:
 *   { [entryId]: { [locale]: { desc, fix, editedAt } } }
 *
 * Phase 2 (Supabase): swap load/persist to a user_overrides table keyed by
 * (user_id, entry_id, locale). The hook (useUserOverrides.js) and all
 * callers remain unchanged.
 */

import { LS_USER_OVERRIDES } from '../utils/constants.js'
import { getStorageJson, setStorageJson } from '../utils/storage.js'

function load() { return getStorageJson(LS_USER_OVERRIDES, {}) }
function persist(overrides) { setStorageJson(LS_USER_OVERRIDES, overrides) }

export function loadAllOverrides() {
  return load()
}

export function saveOverride(entryId, locale, fields) {
  const all = load()
  if (!all[entryId]) all[entryId] = {}
  const record = {
    desc:     fields.desc ?? null,
    fix:      fields.fix  ?? null,
    editedAt: new Date().toISOString(),
  }
  all[entryId][locale] = record
  persist(all)
  return record
}

export function deleteOverride(entryId, locale) {
  const all = load()
  if (all[entryId]) {
    delete all[entryId][locale]
    if (Object.keys(all[entryId]).length === 0) delete all[entryId]
  }
  persist(all)
}

export function deleteAllOverridesForEntry(entryId) {
  const all = load()
  delete all[entryId]
  persist(all)
}

export function clearAllOverrides() {
  persist({})
}

/**
 * Pure function, applies a personal override to an entry for the given locale.
 * Takes the overrides map from useUserOverrides (avoids re-reading localStorage
 * on every call from a useMemo). Returns original finding unchanged if no
 * override exists.
 *
 * Sets _hasOverride: true and _overrideLocale on the result so components can
 * show an indicator without re-querying the service.
 */
export function applyOverride(entry, locale, overrides = {}) {
  const override = overrides[entry.id]?.[locale]
  if (!override) return entry
  return {
    ...entry,
    desc: override.desc ?? entry.desc,
    fix:  override.fix  ?? entry.fix,
    _hasOverride:    true,
    _overrideLocale: locale,
    _overrideEditedAt: override.editedAt,
  }
}

