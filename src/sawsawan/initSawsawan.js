import { announce } from '../taho/index.js'

/**
 * Announces a locale change via the taho announcer.
 * html[lang] and html[dir] are handled by calamansi's setLocale.
 *
 * @param {string} locale
 * @param {Function} [t] - translation function
 * @param {string} [announceKey] - i18n key for the locale-changed message
 */
export function initSawsawan(locale, t = null, announceKey = null) {
  if (announceKey && t) announce(t(announceKey))
}
