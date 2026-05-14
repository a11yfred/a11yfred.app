// Canonical location: @ulam/sawsawan
export { getStorage, setStorage, removeStorage, clearAllStorage, getStorageJson, setStorageJson, getSession, setSession, removeSession, getSessionJson, setSessionJson } from '../sawsawan/storage.js'

// App-specific key helper
import { LS_ENTRY_NOTE_PREFIX } from './constants.js'
export function getEntryNoteKey(id) {
  return `${LS_ENTRY_NOTE_PREFIX}${id}`
}
