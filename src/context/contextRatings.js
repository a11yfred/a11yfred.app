import { createContext, useContext } from 'react'

/**
 * @typedef {Object} RatingsContextValue
 * @property {Object<string, { score: number, starred: boolean, archived: boolean, archivedAt?: number, starredAt?: number, popularity?: number }>} ratings
 * @property {(id: string) => void} rankUp
 * @property {(id: string) => void} rankDown
 * @property {(id: string) => void} toggleStar
 * @property {(id: string) => void} toggleArchive
 * @property {() => void} resetRankings
 * @property {() => void} clearAllRatings
 * @property {Set<string>} pinnedIds
 * @property {(id: string) => void} togglePin
 * @property {() => void} clearPins
 * @property {(id: string) => Array<{id: string, count: number}>} getPairsFor
 * @property {(id: string, type: 'title' | 'primarySc' | 'relatedSc' | 'desc' | 'fix' | 'all') => void} recordCopy
 * @property {(id: string) => void} recordOpen
 * @property {(id: string) => void} recordPin
 */

/**
 * Ratings context for managing entry ratings across the app.
 *
 * @type {React.Context<RatingsContextValue>}
 */
export const ContextRatings = createContext(null)

/**
 * Hook to access the ratings context.
 *
 * @returns {RatingsContextValue}
 * @throws {Error} if not used within ContextRatings.Provider
 */
export function useRatings() {
  const ctx = useContext(ContextRatings)
  if (!ctx) throw new Error('useRatings must be used within ContextRatings.Provider')
  return ctx
}
