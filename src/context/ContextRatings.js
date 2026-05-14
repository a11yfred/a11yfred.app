import { createContext, useContext } from 'react'

export const ContextRatings = createContext(null)

export function useRatings() {
  const ctx = useContext(ContextRatings)
  if (!ctx) throw new Error('useRatings must be used within ContextRatings.Provider')
  return ctx
}
