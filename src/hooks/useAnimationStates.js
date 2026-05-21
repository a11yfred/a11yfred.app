import { useState } from 'react'

export default function useAnimationStates() {
  const [animatingUp, setAnimatingUp] = useState(() => new Set())
  const [animatingDown, setAnimatingDown] = useState(() => new Set())
  const [pinningIds, setPinningIds] = useState(() => new Set())
  const [unpinningIds, setUnpinningIds] = useState(() => new Set())
  const [archivingIds, setArchivingIds] = useState(() => new Set())
  const [unarchivingIds, setUnarchivingIds] = useState(() => new Set())

  return {
    animatingUp, setAnimatingUp,
    animatingDown, setAnimatingDown,
    pinningIds, setPinningIds,
    unpinningIds, setUnpinningIds,
    archivingIds, setArchivingIds,
    unarchivingIds, setUnarchivingIds,
  }
}
