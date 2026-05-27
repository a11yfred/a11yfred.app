import { createContext, useContext } from 'react'

/**
 * @typedef {Object} ReportDefect
 * @property {number} count
 * @property {string|null} overrideSeverity
 * @property {string} note
 */

/**
 * @typedef {Object} ReportContextValue
 * @property {Record<string, ReportDefect>} reportDefects
 * @property {(id: string) => void} addDefect
 * @property {(id: string) => void} removeDefect
 * @property {(id: string, updates: Partial<ReportDefect>) => void} updateDefect
 * @property {() => void} clearReport
 */

/**
 * Report context for managing the audit report builder state.
 *
 * @type {React.Context<ReportContextValue>}
 */
export const ContextReport = createContext(null)

/**
 * Hook to access the report context.
 *
 * @returns {ReportContextValue}
 * @throws {Error} if not used within ContextReport.Provider
 */
export function useReport() {
  const ctx = useContext(ContextReport)
  if (!ctx) throw new Error('useReport must be used within ContextReport.Provider')
  return ctx
}
