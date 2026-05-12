// ─── Module singleton ─────────────────────────────────────────────────────────

let _messages = {}
let _rtlLocales = new Set()
let _t = _makeT('en')
const _listeners = new Set()

function _makeT(locale) {
  const msgs = _messages[locale] ?? _messages[locale?.split('-')[0]] ?? _messages.en ?? {}
  return (key, vars) => {
    let str = (msgs[key] != null && msgs[key] !== '') ? msgs[key] : (_messages.en?.[key] ?? key)
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => { str = str.replaceAll(`{${k}}`, String(v)) })
    }
    return str
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Register the app's message catalogue and RTL locale set. Call once before setLocale.
 *
 * @param {Record<string, Record<string, string>>} messages - BCP 47 locale code → key→string dict
 * @param {Set<string>} [rtlLocales] - locale codes that use RTL direction
 */
export function initI18n(messages, rtlLocales = new Set()) {
  _messages = messages
  _rtlLocales = rtlLocales
}

/**
 * Set the active locale. Updates html[lang] and html[dir], then notifies all subscribers.
 * Call once at app init and again when the user changes language.
 *
 * @param {string} locale - BCP 47 locale code (e.g. 'en', 'fr', 'ar-PS')
 */
export function setLocale(locale) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale
    document.documentElement.dir = _rtlLocales.has(locale) ? 'rtl' : 'ltr'
  }
  _t = _makeT(locale)
  _listeners.forEach(fn => fn(_t))
}

/**
 * Returns the current translate function synchronously.
 * Use outside React — in services, event handlers, vanilla JS.
 *
 * @returns {(key: string, vars?: Record<string, string>) => string}
 */
export function getT() {
  return _t
}

/**
 * Subscribe to locale changes. Returns an unsubscribe function.
 * Used internally by the React shim to re-render on locale change.
 *
 * @internal
 * @param {(t: Function) => void} fn
 * @returns {() => void} unsubscribe
 */
export function _subscribe(fn) {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}

export { getPref, setPref } from './pref.js'
export { isSignificantlyChanged } from './textComparison.js'
