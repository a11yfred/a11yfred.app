/**
 * contributionService.js
 *
 * Phase 1: localStorage-backed queue for user-submitted corpus edits.
 * When a user edits a finding and chooses "Contribute to the shared corpus",
 * the change is queued here and held for maintainer review before being
 * merged into corpus.json or the locale translation overlays.
 *
 * Approval workflow (Phase 1):
 *   1. User submits → stored in localStorage as status: "pending"
 *   2. Maintainer exports via exportContributionsJson()
 *   3. Maintainer runs: node scripts/apply-contributions.mjs <file.json>
 *   4. Script patches corpus.json and/or src/data/translations/{locale}.json
 *   5. Commit the patched files; the contribution is now part of the corpus
 *
 * Phase 2 (Supabase): swap load/persist to a contributions table with RLS.
 * Add a maintainer review UI that calls updateContributionStatus() via API.
 *
 * Edit flow constants (EDIT_TARGET, EDIT_SCOPE) live here so the UI, services,
 * and the apply script share one source of truth.
 */

/** Where the edit should be saved. */
export const EDIT_TARGET = Object.freeze({
  PERSONAL:   'personal',   // stored in userOverrides, never shared
  CONTRIBUTE: 'contribute', // queued for maintainer review
})

/**
 * Which languages the edit applies to.
 *
 * lang_only     → update only the non-English locale that was being edited
 * lang_and_en   → update that locale AND the English base fields; UI will
 *                 prompt the user to also edit the English version before saving
 * all_langs     → update only the English source; all other locales will pick
 *                 up the change the next time the translation script runs
 */
export const EDIT_SCOPE = Object.freeze({
  LANG_ONLY:   'lang_only',
  LANG_AND_EN: 'lang_and_en',
  ALL_LANGS:   'all_langs',
})

export const CONTRIBUTION_STATUS = Object.freeze({
  PENDING:  'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
})

import { makeIdGenerator } from '../sawsawan/makeIdGenerator.js'
import { LS_CONTRIBUTIONS } from '../utils/constants.js'
import { getStorageJson, setStorageJson } from '../utils/storage.js'
const nextId = makeIdGenerator('CTB')

function load() { return getStorageJson(LS_CONTRIBUTIONS, []) }
function persist(contributions) { setStorageJson(LS_CONTRIBUTIONS, contributions) }

export function loadContributions() {
  return load()
}

function loadPendingContributions() {
  return load().filter(c => c.status === CONTRIBUTION_STATUS.PENDING)
}

/**
 * Submit a new contribution to the local queue.
 *
 * @param {string} entryId     - corpus entry ID, e.g. "ACC-001"
 * @param {string} locale      - BCP-47 locale being edited, e.g. "es"
 * @param {'lang_only'|'lang_and_en'|'all_langs'} scope
 * @param {{ desc?: string, rem?: string }} localeFields  - edited locale copy
 * @param {{ desc?: string, rem?: string }} [enFields]    - edited English copy
 *                                                          (required when scope is lang_and_en)
 */
export function submitContribution(entryId, locale, scope, localeFields, enFields = null) {
  const all = load()
  const contribution = {
    id:          nextId(all),
    entryId,
    locale,
    scope,
    localeFields,
    enFields:    scope === EDIT_SCOPE.LANG_AND_EN ? (enFields || null) : null,
    status:      CONTRIBUTION_STATUS.PENDING,
    submittedAt: new Date().toISOString(),
  }
  all.push(contribution)
  persist(all)
  return contribution
}

/**
 * Update the status of a contribution (approve or reject).
 * In Phase 1 this is only used locally for record-keeping after the maintainer
 * runs the apply script. In Phase 2 this becomes an API call.
 */
export function updateContributionStatus(contributionId, status) {
  const all = load()
  const idx = all.findIndex(c => c.id === contributionId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], status, reviewedAt: new Date().toISOString() }
  persist(all)
  return all[idx]
}

export function deleteContribution(contributionId) {
  persist(load().filter(c => c.id !== contributionId))
}

export function clearContributions() {
  persist([])
}

/**
 * Export all pending contributions as a formatted JSON string.
 * Copy the output and pass it to scripts/apply-contributions.mjs for review.
 */
export function exportContributionsJson() {
  return JSON.stringify(loadPendingContributions(), null, 2)
}

/** Count pending contributions (used in Settings badge / privacy disclosure). */
export function pendingContributionCount() {
  return loadPendingContributions().length
}
