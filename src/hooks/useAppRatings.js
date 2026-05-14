import { useCallback } from 'react'
import { useItemSignals, usePinnedItems, useCoSelection } from './relevance.js'

const COPY_FIELD = { title: 'lifetimeCopiedTitle', primarySc: 'lifetimeCopiedPrimarySc', relatedSc: 'lifetimeCopiedRelatedSc', desc: 'lifetimeCopiedDesc', fix: 'lifetimeCopiedFix', all: 'lifetimeCopiedAll' }

export default function useAppRatings() {
  const { signals: ratings, rankUp, rankDown, toggleStar, toggleArchive, resetScores: resetRankings, clearAll: clearAllRatings, recordPin, recordOpen, recordCopy: _recordCopy } = useItemSignals('defect_ratings', { starBonus: 2, unstarPenalty: 1, archivePenalty: 1, openBoost: 0.5, copyBoost: 0.25 })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- COPY_FIELD is module-stable
  const recordCopy = useCallback((id, type) => _recordCopy(id, COPY_FIELD[type]), [_recordCopy])
  const { pinnedIds, togglePin: _togglePin, clearPins } = usePinnedItems('pinnedEntries')
  const togglePin = useCallback((id) => {
    const isPinning = !pinnedIds.has(id)
    if (isPinning && ratings[id]?.archived) toggleArchive(id)
    if (isPinning) recordPin(id)
    _togglePin(id)
  }, [pinnedIds, ratings, toggleArchive, recordPin, _togglePin])
  const { getPairsFor } = useCoSelection('coSelectionPairs', 'sessionCopiedIds')

  return {
    ratings, rankUp, rankDown, toggleStar, toggleArchive, resetRankings, clearAllRatings,
    pinnedIds, togglePin, clearPins,
    getPairsFor, recordCopy, recordOpen, recordPin,
  }
}
