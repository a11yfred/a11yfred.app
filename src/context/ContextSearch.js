import { createContext, useContext } from 'react'

export const ContextSearch = createContext(null)

export function useSearch() {
  const ctx = useContext(ContextSearch)
  if (!ctx) throw new Error('useSearch must be used within ContextSearch.Provider')
  return ctx
}
