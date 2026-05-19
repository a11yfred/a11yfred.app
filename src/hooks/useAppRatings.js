import { useCallback } from 'react'
import { useItemSignals, usePinnedItems, useCoSelection } from './useRelevance.js'
import { LS_DEFECT_RATINGS, LS_PINNED_ENTRIES, LS_CO_SELECTION, SS_COPIED_IDS, POP_STAR_BONUS, POP_UNSTAR_PENALTY, POP_ARCHIVE_PENALTY, POP_OPEN_BOOST, POP_COPY_BOOST } from '../utils/constants.js'

const COPY_FIELD = { title: 'lifetimeCopiedTitle', primarySc: 'lifetimeCopiedPrimarySc', relatedSc: 'lifetimeCopiedRelatedSc', desc: 'lifetimeCopiedDesc', fix: 'lifetimeCopiedFix', all: 'lifetimeCopiedAll' }

/**
 * Manages entry ratings: scores, stars, archives, pins, and popularity tracking.
 * Persists ratings and pin state to localStorage.
 *
 * @returns {{
 *   ratings: Object<string, { score: number, starred: boolean, archived: boolean, archivedAt?: number, starredAt?: number, popularity?: number }>,
 *   rankUp: (id: string) => void,
 *   rankDown: (id: string) => void,
 *   toggleStar: (id: string) => void,
 *   toggleArchive: (id: string) => void,
 *   resetRankings: () => void,
 *   clearAllRatings: () => void,
 *   pinnedIds: Set<string>,
 *   togglePin: (id: string) => void,
 *   clearPins: () => void,
 *   getPairsFor: (id: string) => Array<{id: string, count: number}>,
 *   recordCopy: (id: string, type: 'title' | 'primarySc' | 'relatedSc' | 'desc' | 'fix' | 'all') => void,
 *   recordOpen: (id: string) => void,
 *   recordPin: (id: string) => void,
 * }}
 */
export default function useAppRatings() {
  const { signals: ratings, rankUp, rankDown, toggleStar, toggleArchive, resetScores: resetRankings, clearAll: clearAllRatings, recordPin, recordOpen, recordCopy: _recordCopy } = useItemSignals(LS_DEFECT_RATINGS, { starBonus: POP_STAR_BONUS, unstarPenalty: POP_UNSTAR_PENALTY, archivePenalty: POP_ARCHIVE_PENALTY, openBoost: POP_OPEN_BOOST, copyBoost: POP_COPY_BOOST })
  const recordCopy = useCallback((id, type) => _recordCopy(id, COPY_FIELD[type]), [_recordCopy])
  const { pinnedIds, togglePin: _togglePin, clearPins } = usePinnedItems(LS_PINNED_ENTRIES)
  const togglePin = useCallback((id) => {
    const isPinning = !pinnedIds.has(id)
    if (isPinning && ratings[id]?.archived) toggleArchive(id)
    if (isPinning) recordPin(id)
    _togglePin(id)
  }, [pinnedIds, ratings, toggleArchive, recordPin, _togglePin])
  const { getPairsFor } = useCoSelection(LS_CO_SELECTION, SS_COPIED_IDS)

  return {
    ratings, rankUp, rankDown, toggleStar, toggleArchive, resetRankings, clearAllRatings,
    pinnedIds, togglePin, clearPins,
    getPairsFor, recordCopy, recordOpen, recordPin,
  }
}
