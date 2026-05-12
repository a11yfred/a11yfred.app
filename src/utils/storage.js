import { LS_FINDING_NOTE_PREFIX } from './constants.js'

export function getStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key)
    return value !== null ? value : fallback
  } catch {
    return fallback
  }
}

export function setStorage(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function removeStorage(key) {
  try { localStorage.removeItem(key) } catch { /* storage unavailable */ }
}

export function clearAllStorage() {
  try { localStorage.clear() } catch { /* storage unavailable */ }
}

export function getStorageJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

export function setStorageJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
}

export function getSession(key, fallback = null) {
  try {
    const value = sessionStorage.getItem(key)
    return value !== null ? value : fallback
  } catch {
    return fallback
  }
}

export function setSession(key, value) {
  try { sessionStorage.setItem(key, value) } catch { /* storage unavailable */ }
}

export function removeSession(key) {
  try { sessionStorage.removeItem(key) } catch { /* storage unavailable */ }
}

export function getSessionJson(key, fallback) {
  try { return JSON.parse(sessionStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

export function setSessionJson(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
}

export function getFindingNoteKey(id) {
  return `${LS_FINDING_NOTE_PREFIX}${id}`
}

