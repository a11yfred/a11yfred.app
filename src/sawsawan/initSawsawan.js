import { announce } from '../taho-bayabas/index.js'

const RTL_LOCALES = new Set(['ar-PS', 'ug'])

/**
 * Vanilla locale wiring — no React required.
 * Sets html[lang], html[dir], and optionally announces the locale change.
 *
 * @param {string} locale
 * @param {Function} [t] - translation function
 * @param {string} [announceKey] - i18n key for the locale-changed message
 */
export function initSawsawan(locale, t = null, announceKey = null) {
  document.documentElement.lang = locale
  document.documentElement.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
  if (announceKey && t) announce(t(announceKey))
}
