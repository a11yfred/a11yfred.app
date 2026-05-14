import { useState, useCallback } from 'react'
import {
  loadUserEntries,
  saveUserEntry,
  deleteUserEntry,
  createUserEntry,
  copyUserEntry,
} from '../services/userEntriesService.js'
import {
  importFromFile as _importFromFile,
  importFromUrl  as _importFromUrl,
} from '../services/importService.js'

/**
 * useUserEntries
 *
 * Reactive wrapper around the userEntriesService localStorage layer.
 * Exposes state + four CRUD actions. In Phase 2, swap the service
 * functions to Supabase calls, this hook and all callers stay the same.
 *
 * Returns:
 *   userEntries  , current array (kept in sync with localStorage)
 *   addEntry     , create a new blank entry (or pass field overrides)
 *   editEntry    , update an existing entry by id
 *   deleteEntry  , remove an entry by id
 *   copyEntry    , derive a new USR-NNN entry from any existing entry
 */
export default function useUserEntries() {
  const [userEntries, setUserEntries] = useState(() => loadUserEntries())

  const refresh = () => setUserEntries(loadUserEntries())

  const addEntry = useCallback((fields = {}) => {
    const entry = createUserEntry(fields)
    const stored = saveUserEntry(entry)
    refresh()
    return stored
  }, [])

  const editEntry = useCallback((entry) => {
    const stored = saveUserEntry(entry)
    refresh()
    return stored
  }, [])

  const deleteEntry = useCallback((entryId) => {
    deleteUserEntry(entryId)
    refresh()
  }, [])

  const copyEntry = useCallback((sourceEntry) => {
    const copy = copyUserEntry(sourceEntry)
    const stored = saveUserEntry(copy)
    refresh()
    return stored
  }, [])

  /**
   * Parse and import a user-uploaded file (.csv, .xlsx, .xls, .json).
   * Each successfully normalized entry is saved as a user entry.
   * Returns { entries, skipped, total }, caller can surface a summary.
   */
  const importFromFile = useCallback(async (file, options = {}) => {
    const result = await _importFromFile(file, options)
    result.entries.forEach(f => saveUserEntry(f))
    refresh()
    return result
  }, [])

  /**
   * Fetch a public JSON URL and import its entries.
   * For auth-gated Supabase sources use dataService.getUserEntries() (Phase 2).
   */
  const importFromUrl = useCallback(async (url, options = {}) => {
    const result = await _importFromUrl(url, options)
    result.entries.forEach(f => saveUserEntry(f))
    refresh()
    return result
  }, [])

  return { userEntries, addEntry, editEntry, deleteEntry, copyEntry, importFromFile, importFromUrl }
}
