/**
 * electron/preload.js — Context bridge
 *
 * Exposes a safe `window.electronAPI` surface to the renderer.
 * The renderer can call these methods to use Electron features without
 * having direct access to Node.js or Electron internals.
 *
 * In the web build these APIs don't exist — the renderer uses localStorage
 * directly. Add `if (window.electronAPI)` guards before calling these.
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Secure API key storage (replaces localStorage in Electron)
  keys: {
    set: (keyName, value) => ipcRenderer.invoke('keys:set', keyName, value),
    get: (keyName) => ipcRenderer.invoke('keys:get', keyName),
    delete: (keyName) => ipcRenderer.invoke('keys:delete', keyName),
  },

  // System theme (supplements CSS prefers-color-scheme)
  theme: {
    get: () => ipcRenderer.invoke('theme:get'),
    onChange: (callback) => {
      ipcRenderer.on('theme:changed', (_event, theme) => callback(theme))
      return () => ipcRenderer.removeAllListeners('theme:changed')
    },
  },

  // App version (for About panel)
  version: process.env.npm_package_version || '0.1.0',
})
