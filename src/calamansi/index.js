// ─── Module singleton ─────────────────────────────────────────────────────────

let _messages = {}
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
 * Register the app's message catalogue. Call once before setLocale.
 * The messages object is a map of BCP 47 locale codes to key→string dicts.
 *
 * @param {Record<string, Record<string, string>>} messages
 */
export function initI18n(messages) {
  _messages = messages
}

/**
 * Set the active locale. All subscribers are notified.
 * Call once at app init and again when the user changes language.
 *
 * @param {string} locale - BCP 47 locale code (e.g. 'en', 'fr', 'tl')
 */
export function setLocale(locale) {
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
