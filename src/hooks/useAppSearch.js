import { useState } from 'react'
import { getInitUrlParams } from '../utils/storage.js'

/**
 * Manages search state: query, submission, narrow mode, sorting, selection, and focus.
 * Initializes from URL parameters (hash or search query).
 *
 * @returns {{
 *   query: string,
 *   setQuery: (q: string) => void,
 *   submittedQuery: string,
 *   setSubmittedQuery: (q: string) => void,
 *   searchKey: number,
 *   setSearchKey: (key: number | (prev: number) => number) => void,
 *   selected: Object | null,
 *   setSelected: (entry: Object | null) => void,
 *   sheetCollapsed: boolean,
 *   setSheetCollapsed: (collapsed: boolean) => void,
 *   pendingEntry: Object | null,
 *   setPendingEntry: (entry: Object | null) => void,
 *   pendingPrivacy: boolean,
 *   setPendingPrivacy: (pending: boolean) => void,
 *   panelFocusTrigger: number,
 *   setPanelFocusTrigger: (trigger: number | (prev: number) => number) => void,
 *   narrowMode: boolean,
 *   setNarrowMode: (narrow: boolean) => void,
 *   narrowQuery: string,
 *   setNarrowQuery: (q: string) => void,
 *   submittedNarrowQuery: string,
 *   setSubmittedNarrowQuery: (q: string) => void,
 *   sortBy: string,
 *   setSortBy: (sort: string) => void,
 * }}
 */
export default function useAppSearch() {
  const initParams = getInitUrlParams()
  const initQ = initParams.get('q') || ''
  const initNarrow = initParams.get('narrow') || ''
  const initSort = initParams.get('sort') || 'smart'

  const [query, setQuery] = useState(initQ)
  const [submittedQuery, setSubmittedQuery] = useState(initQ)
  const [searchKey, setSearchKey] = useState(0)
  const [selected, setSelected] = useState(null)
  const [sheetCollapsed, setSheetCollapsed] = useState(false)
  const [pendingEntry, setPendingEntry] = useState(null)
  const [pendingPrivacy, setPendingPrivacy] = useState(false)
  const [panelFocusTrigger, setPanelFocusTrigger] = useState(0)
  const [narrowMode, setNarrowMode] = useState(!!initNarrow)
  const [narrowQuery, setNarrowQuery] = useState(initNarrow)
  const [submittedNarrowQuery, setSubmittedNarrowQuery] = useState(initNarrow)
  const [sortBy, setSortBy] = useState(initSort)

  return {
    query, setQuery,
    submittedQuery, setSubmittedQuery,
    searchKey, setSearchKey,
    selected, setSelected,
    sheetCollapsed, setSheetCollapsed,
    pendingEntry, setPendingEntry,
    pendingPrivacy, setPendingPrivacy,
    panelFocusTrigger, setPanelFocusTrigger,
    narrowMode, setNarrowMode,
    narrowQuery, setNarrowQuery,
    submittedNarrowQuery, setSubmittedNarrowQuery,
    sortBy, setSortBy,
  }
}
