import { useState, useCallback } from 'react'
import { getStorageJson, setStorageJson } from '../utils/storage.js'
import { LS_AUDIT_REPORT } from '../utils/constants.js'

/**
 * Manages the state of the audit report builder.
 * Persists the selected defects and their metadata to local storage.
 */
export default function useAppReport() {
  const [reportDefects, setReportDefects] = useState(() => getStorageJson(LS_AUDIT_REPORT, {}))

  const persist = (nextState) => {
    setReportDefects(nextState)
    setStorageJson(LS_AUDIT_REPORT, nextState)
  }

  const addDefect = useCallback((id) => {
    setReportDefects((prev) => {
      if (prev[id]) return prev
      const next = { ...prev, [id]: { count: 1, overrideSeverity: null, note: '' } }
      setStorageJson(LS_AUDIT_REPORT, next)
      return next
    })
  }, [])

  const removeDefect = useCallback((id) => {
    setReportDefects((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      setStorageJson(LS_AUDIT_REPORT, next)
      return next
    })
  }, [])

  const updateDefect = useCallback((id, updates) => {
    setReportDefects((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev, [id]: { ...prev[id], ...updates } }
      setStorageJson(LS_AUDIT_REPORT, next)
      return next
    })
  }, [])

  const clearReport = useCallback(() => {
    persist({})
  }, [])

  return {
    reportDefects,
    addDefect,
    removeDefect,
    updateDefect,
    clearReport,
  }
}
