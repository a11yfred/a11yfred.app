import { createContext, useContext } from 'react'

export const SettingsContext = createContext(null)

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsContext.Provider')
  return ctx
}
