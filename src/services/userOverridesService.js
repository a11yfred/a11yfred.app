/**
 * userOverridesService.js
 *
 * Phase 1: localStorage-backed personal locale overrides for corpus findings.
 * When a user edits a finding's desc/fix while in a non-English locale and
 * chooses "Save to personal", the override is stored here and applied at
 * runtime on top of the corpus + translation overlay.
 *
 * Schema:
 *   { [findingId]: { [locale]: { desc, fix, editedAt } } }
 *
 * Phase 2 (Supabase): swap load/persist to a user_overrides table keyed by
 * (user_id, finding_id, locale). The hook (useUserOverrides.js) and all
 * callers remain unchanged.
 */

import { LS_USER_OVERRIDES } from '../utils/constants.js'
import { getStorageJson, setStorageJson } from '../utils/storage.js'

function load() { return getStorageJson(LS_USER_OVERRIDES, {}) }
function persist(overrides) { setStorageJson(LS_USER_OVERRIDES, overrides) }

export function loadAllOverrides() {
  return load()
}

export function loadOverridesForFinding(findingId) {
  return load()[findingId] || {}
}

export function loadOverride(findingId, locale) {
  return load()[findingId]?.[locale] ?? null
}

export function saveOverride(findingId, locale, fields) {
  const all = load()
  if (!all[findingId]) all[findingId] = {}
  const entry = {
    desc:     fields.desc ?? null,
    fix:      fields.fix  ?? null,
    editedAt: new Date().toISOString(),
  }
  all[findingId][locale] = entry
  persist(all)
  return entry
}

export function deleteOverride(findingId, locale) {
  const all = load()
  if (all[findingId]) {
    delete all[findingId][locale]
    if (Object.keys(all[findingId]).length === 0) delete all[findingId]
  }
  persist(all)
}

export function deleteAllOverridesForFinding(findingId) {
  const all = load()
  delete all[findingId]
  persist(all)
}

export function clearAllOverrides() {
  persist({})
}

/**
 * Pure function, applies a personal override to a finding for the given locale.
 * Takes the overrides map from useUserOverrides (avoids re-reading localStorage
 * on every call from a useMemo). Returns original finding unchanged if no
 * override exists.
 *
 * Sets _hasOverride: true and _overrideLocale on the result so components can
 * show an indicator without re-querying the service.
 */
export function applyOverride(finding, locale, overrides = {}) {
  const override = overrides[finding.id]?.[locale]
  if (!override) return finding
  return {
    ...finding,
    desc: override.desc ?? finding.desc,
    fix:  override.fix  ?? finding.fix,
    _hasOverride:    true,
    _overrideLocale: locale,
    _overrideEditedAt: override.editedAt,
  }
}

/** How many individual locale overrides exist (for privacy disclosures). */
export function countOverrides() {
  const all = load()
  return Object.values(all).reduce((sum, locales) => sum + Object.keys(locales).length, 0)
}

/** Returns all finding IDs that have at least one override. */
export function overriddenFindingIds() {
  return Object.keys(load())
}
