import { createContext, useContext } from 'react'

/**
 * @typedef {Object} SettingsContextValue
 * @property {'auto' | 'light' | 'dark' | 'fiesta'} theme
 * @property {(theme: string) => void} setTheme
 * @property {string} language
 * @property {(lang: string) => void} setLanguage
 * @property {boolean} aiEnabled
 * @property {(enabled: boolean) => void} setAiEnabled
 * @property {boolean} liveSearch
 * @property {(live: boolean) => void} setLiveSearch
 * @property {boolean} showVoting
 * @property {(show: boolean) => void} setShowVoting
 * @property {boolean} showPersonalCorpus
 * @property {(show: boolean) => void} setShowPersonalCorpus
 * @property {boolean} fiestaUnlocked
 * @property {(count: number | (prev: number) => number) => void} setSaveCount
 * @property {'all' | 'web' | 'native' | 'document'} platform
 * @property {(platform: string) => void} setPlatform
 * @property {{ maxVersion: string, maxLevel: string }} wcagFilter
 * @property {(filter: { maxVersion: string, maxLevel: string }) => void} setWcagFilter
 */

/**
 * Settings context for managing user settings across the app.
 *
 * @type {React.Context<SettingsContextValue>}
 */
export const ContextSettings = createContext(null)

/**
 * Hook to access the settings context.
 *
 * @returns {SettingsContextValue}
 * @throws {Error} if not used within ContextSettings.Provider
 */
export function useSettings() {
  const ctx = useContext(ContextSettings)
  if (!ctx) throw new Error('useSettings must be used within ContextSettings.Provider')
  return ctx
}
