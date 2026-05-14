import { useState, useCallback } from 'react'
import {
  loadAllOverrides,
  saveOverride as _saveOverride,
  deleteOverride as _deleteOverride,
  deleteAllOverridesForEntry as _deleteAllForEntry,
  clearAllOverrides as _clearAll,
} from '../services/userOverridesService.js'

/**
 * useUserOverrides
 *
 * Reactive wrapper around userOverridesService. Exposes the full overrides
 * map as reactive state so useEntrySearch can re-run its useMemo when
 * overrides change without re-fetching corpus data.
 *
 * Returns:
 *   overrides           , { [entryId]: { [locale]: { desc, fix, editedAt } } }
 *   saveOverride        , (entryId, locale, { desc, fix }) → void
 *   deleteOverride      , (entryId, locale) → void
 *   deleteAllForEntry   , (entryId) → void
 *   clearAllOverrides   , () → void
 *   hasOverride         , (entryId, locale) → boolean
 */
export default function useUserOverrides() {
  const [overrides, setOverrides] = useState(() => loadAllOverrides())

  const refresh = () => setOverrides(loadAllOverrides())

  const saveOverride = useCallback((entryId, locale, fields) => {
    _saveOverride(entryId, locale, fields)
    refresh()
  }, [])

  const deleteOverride = useCallback((entryId, locale) => {
    _deleteOverride(entryId, locale)
    refresh()
  }, [])

  const deleteAllForEntry = useCallback((entryId) => {
    _deleteAllForEntry(entryId)
    refresh()
  }, [])

  const clearAllOverrides = useCallback(() => {
    _clearAll()
    refresh()
  }, [])

  const hasOverride = useCallback((entryId, locale) => {
    return Boolean(overrides[entryId]?.[locale])
  }, [overrides])

  return { overrides, saveOverride, deleteOverride, deleteAllForEntry, clearAllOverrides, hasOverride }
}
