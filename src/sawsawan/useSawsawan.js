import { useEffect } from 'react'
import { announce } from '../taho-bayabas/index.js'

// RTL locales — duplicated here so sawsawan has no dependency on app constants.
// The authoritative list lives in calamansi when the fork happens.
const RTL_LOCALES = new Set(['ar-PS', 'ug'])

/**
 * Wires locale changes across ube, calamansi, and adobo:
 *   - sets html[lang] when locale switches
 *   - sets html[dir] for RTL locales
 *   - announces the locale change via ube's announce channel
 *
 * Call once at app root, inside I18nProvider, after announce is mounted.
 *
 * @param {string} locale - current locale code (e.g. 'en', 'ar-PS')
 * @param {Function} t - translation function from useT()
 * @param {string} announceKey - i18n key for the locale-changed message (optional)
 */
export function useSawsawan(locale, t, announceKey = null) {
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
    if (announceKey && t) {
      announce(t(announceKey))
    }
  }, [locale, t, announceKey])
}
