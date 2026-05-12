import { announce } from '../taho-bayabas/index.js'

/**
 * Vanilla locale wiring — no React required.
 * Sets html[lang], html[dir], and optionally announces the locale change.
 *
 * @param {string} locale
 * @param {Function} [t] - translation function
 * @param {string} [announceKey] - i18n key for the locale-changed message
 * @param {Set<string>} [rtlLocales] - set of RTL locale codes; defaults to empty
 */
export function initSawsawan(locale, t = null, announceKey = null, rtlLocales = new Set()) {
  document.documentElement.lang = locale
  document.documentElement.dir = rtlLocales.has(locale) ? 'rtl' : 'ltr'
  if (announceKey && t) announce(t(announceKey))
}
