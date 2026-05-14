import { useState } from 'react'

export default function useAppSearch() {
  const hashSearch = window.location.hash.includes('?') ? window.location.hash.slice(window.location.hash.indexOf('?') + 1) : ''
  const initParams = new URLSearchParams(window.location.search || hashSearch)
  const initQ = initParams.get('q') || ''
  const initNarrow = initParams.get('narrow') || ''

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
  }
}
