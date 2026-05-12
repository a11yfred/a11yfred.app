// Canonical location: @ulam/sawsawan
export { getStorage, setStorage, removeStorage, clearAllStorage, getStorageJson, setStorageJson, getSession, setSession, removeSession, getSessionJson, setSessionJson } from '../sawsawan/storage.js'

// App-specific key helper
import { LS_FINDING_NOTE_PREFIX } from './constants.js'
export function getFindingNoteKey(id) {
  return `${LS_FINDING_NOTE_PREFIX}${id}`
}
