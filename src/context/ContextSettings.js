import { createContext, useContext } from 'react'

export const ContextSettings = createContext(null)

export function useSettings() {
  const ctx = useContext(ContextSettings)
  if (!ctx) throw new Error('useSettings must be used within ContextSettings.Provider')
  return ctx
}
