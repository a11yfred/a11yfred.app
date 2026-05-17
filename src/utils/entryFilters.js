export function getPinnedEntries(entries, pinnedIds) {
  return entries.filter(e => pinnedIds.has(e.id))
}

export function getUnpinnedEntries(entries, pinnedIds) {
  return entries.filter(e => !pinnedIds.has(e.id))
}

export function countRatingsByField(ratings, field) {
  return Object.values(ratings).filter(r => r[field]).length
}
