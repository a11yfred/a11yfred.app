import { useState, useCallback } from 'react'
import {
  loadAllOverrides,
  saveOverride as _saveOverride,
  deleteOverride as _deleteOverride,
  deleteAllOverridesForFinding as _deleteAllForFinding,
  clearAllOverrides as _clearAll,
} from '../services/userOverridesService.js'

/**
 * useUserOverrides
 *
 * Reactive wrapper around userOverridesService. Exposes the full overrides
 * map as reactive state so useFindingSearch can re-run its useMemo when
 * overrides change without re-fetching corpus data.
 *
 * Returns:
 *   overrides            — { [findingId]: { [locale]: { desc, rem, editedAt } } }
 *   saveOverride         — (findingId, locale, { desc, rem }) → void
 *   deleteOverride       — (findingId, locale) → void
 *   deleteAllForFinding  — (findingId) → void
 *   clearAllOverrides    — () → void
 *   hasOverride          — (findingId, locale) → boolean
 */
export default function useUserOverrides() {
  const [overrides, setOverrides] = useState(() => loadAllOverrides())

  const refresh = () => setOverrides(loadAllOverrides())

  const saveOverride = useCallback((findingId, locale, fields) => {
    _saveOverride(findingId, locale, fields)
    refresh()
  }, [])

  const deleteOverride = useCallback((findingId, locale) => {
    _deleteOverride(findingId, locale)
    refresh()
  }, [])

  const deleteAllForFinding = useCallback((findingId) => {
    _deleteAllForFinding(findingId)
    refresh()
  }, [])

  const clearAllOverrides = useCallback(() => {
    _clearAll()
    refresh()
  }, [])

  const hasOverride = useCallback((findingId, locale) => {
    return Boolean(overrides[findingId]?.[locale])
  }, [overrides])

  return { overrides, saveOverride, deleteOverride, deleteAllForFinding, clearAllOverrides, hasOverride }
}
