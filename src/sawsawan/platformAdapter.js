// ─── Platform Adapter ─────────────────────────────────────────────────────────
// A single seam where the runtime environment plugs in. All ulam packages
// (calamansi, halohalo) call getAdapter() instead of touching localStorage,
// sessionStorage, or window.electronAPI directly.
//
// Web apps: zero configuration — the default adapter uses localStorage/sessionStorage.
// Electron: call setPlatformAdapter({ getKey, setKey, ... }) once at startup.
// Extensions: swap chrome.storage in via the same call.
// React Native: provide AsyncStorage-backed implementations.
//
// Key/Pref distinction:
//   getKey/setKey/removeKey — async, for secrets (API keys). Electron routes
//     these through keytar/safeStorage; web falls back to localStorage.
//   readPref/writePref/removePref — sync, for user preferences (provider, model,
//     toggles). Always returns a value immediately.
//   readSession/writeSession/removeSession — sync, scoped to the current session.

const defaultAdapter = {
  // Secrets — async because Electron IPC is async
  getKey: async (key) => {
    try { return localStorage.getItem(key) ?? null } catch { return null }
  },
  setKey: async (key, value) => {
    try { localStorage.setItem(key, value) } catch { /* storage unavailable */ }
  },
  removeKey: async (key) => {
    try { localStorage.removeItem(key) } catch { /* storage unavailable */ }
  },

  // Preferences — sync
  readPref: (key, fallback = null) => {
    try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
  },
  writePref: (key, value) => {
    try { localStorage.setItem(key, String(value)) } catch { /* storage unavailable */ }
  },
  removePref: (key) => {
    try { localStorage.removeItem(key) } catch { /* storage unavailable */ }
  },
  readPrefJson: (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
  },
  writePrefJson: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
  },

  // Session — sync, cleared when tab closes
  readSession: (key, fallback = null) => {
    try { return sessionStorage.getItem(key) ?? fallback } catch { return fallback }
  },
  writeSession: (key, value) => {
    try { sessionStorage.setItem(key, String(value)) } catch { /* storage unavailable */ }
  },
  removeSession: (key) => {
    try { sessionStorage.removeItem(key) } catch { /* storage unavailable */ }
  },
  readSessionJson: (key, fallback) => {
    try { return JSON.parse(sessionStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
  },
  writeSessionJson: (key, value) => {
    try { sessionStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
  },
}

let _adapter = defaultAdapter

/**
 * Override the platform adapter. Call once at app startup for non-web runtimes.
 *
 * @param {Partial<typeof defaultAdapter>} impl
 */
export function setPlatformAdapter(impl) {
  _adapter = { ...defaultAdapter, ...impl }
}

/** @returns {typeof defaultAdapter} */
export function getAdapter() {
  return _adapter
}

// Convenience — Electron adapter factory.
// Pass window.electronAPI and it produces a ready-to-use adapter object.
export function makeElectronAdapter(electronAPI) {
  return {
    getKey:    async (key) => (await electronAPI.keys.get(key)) ?? null,
    setKey:    async (key, value) => electronAPI.keys.set(key, value),
    removeKey: async (key) => electronAPI.keys.remove(key),
  }
}
