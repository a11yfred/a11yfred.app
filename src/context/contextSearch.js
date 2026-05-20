import { createContext, useContext } from 'react'

/**
 * @typedef {Object} SearchContextValue
 * @property {string} query
 * @property {(q: string) => void} setQuery
 * @property {string} submittedQuery
 * @property {(q: string) => void} setSubmittedQuery
 * @property {number} searchKey
 * @property {(key: number | (prev: number) => number) => void} setSearchKey
 * @property {Object | null} selected
 * @property {(entry: Object | null) => void} setSelected
 * @property {boolean} sheetCollapsed
 * @property {(collapsed: boolean) => void} setSheetCollapsed
 * @property {Object | null} pendingEntry
 * @property {(entry: Object | null) => void} setPendingEntry
 * @property {boolean} pendingPrivacy
 * @property {(pending: boolean) => void} setPendingPrivacy
 * @property {number} panelFocusTrigger
 * @property {(trigger: number | (prev: number) => number) => void} setPanelFocusTrigger
 * @property {boolean} narrowMode
 * @property {(narrow: boolean) => void} setNarrowMode
 * @property {string} narrowQuery
 * @property {(q: string) => void} setNarrowQuery
 * @property {string} submittedNarrowQuery
 * @property {(q: string) => void} setSubmittedNarrowQuery
 * @property {string} sortBy
 * @property {(sort: string) => void} setSortBy
 */

/**
 * Search context for managing search state across the app.
 *
 * @type {React.Context<SearchContextValue>}
 */
export const ContextSearch = createContext(null)

/**
 * Hook to access the search context.
 *
 * @returns {SearchContextValue}
 * @throws {Error} if not used within ContextSearch.Provider
 */
export function useSearch() {
  const ctx = useContext(ContextSearch)
  if (!ctx) throw new Error('useSearch must be used within ContextSearch.Provider')
  return ctx
}
