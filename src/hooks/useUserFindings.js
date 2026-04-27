import { useState, useCallback } from 'react'
import {
  loadUserFindings,
  saveUserFinding,
  deleteUserFinding,
  createUserFinding,
  copyUserFinding,
} from '../services/userFindingsService.js'
import {
  importFromFile as _importFromFile,
  importFromUrl  as _importFromUrl,
} from '../services/importService.js'

/**
 * useUserFindings
 *
 * Reactive wrapper around the userFindingsService localStorage layer.
 * Exposes state + four CRUD actions. In Phase 2, swap the service
 * functions to Supabase calls — this hook and all callers stay the same.
 *
 * Returns:
 *   userFindings  — current array (kept in sync with localStorage)
 *   addFinding    — create a new blank finding (or pass field overrides)
 *   editFinding   — update an existing finding by id
 *   deleteFinding — remove a finding by id
 *   copyFinding   — derive a new USR-NNN finding from any existing finding
 */
export default function useUserFindings() {
  const [userFindings, setUserFindings] = useState(() => loadUserFindings())

  const refresh = () => setUserFindings(loadUserFindings())

  const addFinding = useCallback((fields = {}) => {
    const finding = createUserFinding(fields)
    const stored = saveUserFinding(finding)
    refresh()
    return stored
  }, [])

  const editFinding = useCallback((finding) => {
    const stored = saveUserFinding(finding)
    refresh()
    return stored
  }, [])

  const deleteFinding = useCallback((findingId) => {
    deleteUserFinding(findingId)
    refresh()
  }, [])

  const copyFinding = useCallback((sourceFinding) => {
    const copy = copyUserFinding(sourceFinding)
    const stored = saveUserFinding(copy)
    refresh()
    return stored
  }, [])

  /**
   * Parse and import a user-uploaded file (.csv, .xlsx, .xls, .json).
   * Each successfully normalized finding is saved as a user finding.
   * Returns { findings, skipped, total } — caller can surface a summary.
   */
  const importFromFile = useCallback(async (file, options = {}) => {
    const result = await _importFromFile(file, options)
    result.findings.forEach(f => saveUserFinding(f))
    refresh()
    return result
  }, [])

  /**
   * Fetch a public JSON URL and import its findings.
   * For auth-gated Supabase sources use dataService.getUserFindings() (Phase 2).
   */
  const importFromUrl = useCallback(async (url, options = {}) => {
    const result = await _importFromUrl(url, options)
    result.findings.forEach(f => saveUserFinding(f))
    refresh()
    return result
  }, [])

  return { userFindings, addFinding, editFinding, deleteFinding, copyFinding, importFromFile, importFromUrl }
}
