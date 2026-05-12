/**
 * Creates a nextId function for a given ID prefix (e.g. 'USR', 'CTB').
 * IDs have the form PREFIX-NNN (zero-padded to 3 digits).
 *
 * @param {string} prefix - e.g. 'USR' or 'CTB'
 * @returns {(existing: object[]) => string}
 */
export function makeIdGenerator(prefix) {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`)
  return function nextId(existing) {
    const nums = existing
      .map(item => { const m = item.id?.match(pattern); return m ? parseInt(m[1], 10) : 0 })
      .filter(n => n > 0)
    const max = nums.length ? Math.max(...nums) : 0
    return `${prefix}-${String(max + 1).padStart(3, '0')}`
  }
}
