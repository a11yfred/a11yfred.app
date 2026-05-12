/**
 * localStorage / sessionStorage helpers.
 *
 * All functions swallow storage errors silently — storage may be unavailable
 * in private browsing, sandboxed iframes, or SSR environments.
 *
 * In-memory fallback is not provided here — callers should treat a null/false
 * return as "storage unavailable" and handle state locally if needed.
 */

// ─── localStorage ────────────────────────────────────────────────────────────

export function getStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key)
    return value !== null ? value : fallback
  } catch {
    return fallback
  }
}

export function setStorage(key, value) {
  try { localStorage.setItem(key, value); return true } catch { return false }
}

export function removeStorage(key) {
  try { localStorage.removeItem(key) } catch { /* unavailable */ }
}

export function clearAllStorage() {
  try { localStorage.clear() } catch { /* unavailable */ }
}

export function getStorageJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

export function setStorageJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* unavailable */ }
}

// ─── sessionStorage ───────────────────────────────────────────────────────────

export function getSession(key, fallback = null) {
  try {
    const value = sessionStorage.getItem(key)
    return value !== null ? value : fallback
  } catch {
    return fallback
  }
}

export function setSession(key, value) {
  try { sessionStorage.setItem(key, value) } catch { /* unavailable */ }
}

export function removeSession(key) {
  try { sessionStorage.removeItem(key) } catch { /* unavailable */ }
}

export function getSessionJson(key, fallback) {
  try { return JSON.parse(sessionStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

export function setSessionJson(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)) } catch { /* unavailable */ }
}
