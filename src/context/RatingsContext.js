import { createContext, useContext } from 'react'

export const RatingsContext = createContext(null)

export function useRatings() {
  const ctx = useContext(RatingsContext)
  if (!ctx) throw new Error('useRatings must be used within RatingsContext.Provider')
  return ctx
}
