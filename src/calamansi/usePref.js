import { useState, useCallback } from 'react'

/**
 * Persisted boolean or string user preference backed by localStorage.
 *
 * @param {string} key - localStorage key
 * @param {*} defaultValue - value when key is absent or storage is unavailable
 * @returns {[value, setValue]} - current value and stable setter
 *
 * @example
 * const [liveSearch, setLiveSearch] = usePref('liveSearch', true)
 * const [theme, setTheme] = usePref('theme', 'auto')
 */
export function usePref(key, defaultValue) {
  const [value, setValueState] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return defaultValue
      if (typeof defaultValue === 'boolean') return raw === 'true'
      if (typeof defaultValue === 'number') return Number(raw)
      return raw
    } catch {
      return defaultValue
    }
  })

  const setValue = useCallback((next) => {
    const resolved = typeof next === 'function' ? next(value) : next
    setValueState(resolved)
    try {
      localStorage.setItem(key, String(resolved))
    } catch {
      // storage unavailable — state still updates in memory
    }
  }, [key, value])

  return [value, setValue]
}
