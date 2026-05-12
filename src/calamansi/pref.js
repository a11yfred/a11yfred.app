/**
 * Plain get/set user preference backed by localStorage.
 * No React dependency — use from services, event handlers, or any framework.
 *
 * @example
 * import { getPref, setPref } from '@ulam/calamansi'
 * const theme = getPref('theme', 'auto')
 * setPref('theme', 'dark')
 */

export function getPref(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return defaultValue
    if (typeof defaultValue === 'boolean') return raw === 'true'
    if (typeof defaultValue === 'number') return Number(raw)
    return raw
  } catch {
    return defaultValue
  }
}

export function setPref(key, value) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // storage unavailable — no-op
  }
}
