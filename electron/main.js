/**
 * electron/main.js — Main process stub
 *
 * To activate:
 *   npm install --save-dev electron electron-builder
 *   npm run electron:dev   (start dev server + Electron)
 *   npm run electron:build (Vite build + electron-builder package)
 *
 * The app works fully offline once installed:
 * - No server required (all data is bundled static JSON)
 * - API keys stored in safeStorage instead of localStorage (see preload.js)
 * - Corpus JSON bundled with the app; no internet needed for search
 * - AI provider calls go directly from Electron to the provider API
 */

const { app, BrowserWindow, ipcMain, safeStorage, nativeTheme } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development'
const DEV_SERVER_URL = 'http://localhost:5173'

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 480,
    minHeight: 600,
    titleBarStyle: 'hiddenInset', // macOS native traffic lights
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL(DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ── Secure key storage (replaces localStorage for API keys in Electron) ──────
// The renderer calls window.electronAPI.setKey / getKey via preload.js IPC.
// Keys are encrypted with the OS keychain via safeStorage.

const KEY_PREFIX = 'apikey_'

ipcMain.handle('keys:set', (_event, keyName, value) => {
  if (!safeStorage.isEncryptionAvailable()) return false
  const encrypted = safeStorage.encryptString(value)
  fs.writeFileSync(path.join(app.getPath('userData'), `${KEY_PREFIX}${keyName}`), encrypted)
  return true
})

ipcMain.handle('keys:get', (_event, keyName) => {
  if (!safeStorage.isEncryptionAvailable()) return null
  const filePath = path.join(app.getPath('userData'), `${KEY_PREFIX}${keyName}`)
  if (!fs.existsSync(filePath)) return null
  return safeStorage.decryptString(fs.readFileSync(filePath))
})

ipcMain.handle('keys:delete', (_event, keyName) => {
  const filePath = path.join(app.getPath('userData'), `${KEY_PREFIX}${keyName}`)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  return true
})

// ── System theme ─────────────────────────────────────────────────────────────
ipcMain.handle('theme:get', () => nativeTheme.shouldUseDarkColors ? 'dark' : 'light')

nativeTheme.on('updated', () => {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('theme:changed', nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
  })
})
