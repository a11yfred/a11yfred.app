export function getPinnedEntries(entries, pinnedIds) {
  return entries.filter(e => pinnedIds.has(e.id))
}

export function getUnpinnedEntries(entries, pinnedIds) {
  return entries.filter(e => !pinnedIds.has(e.id))
}
