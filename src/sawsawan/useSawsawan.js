import { useEffect } from 'react'
import { initSawsawan } from './initSawsawan.js'

export { getStorage, setStorage, removeStorage, clearAllStorage, getStorageJson, setStorageJson, getSession, setSession, removeSession, getSessionJson, setSessionJson } from './storage.js'

export function useSawsawan(locale, t, announceKey = null) {
  useEffect(() => {
    initSawsawan(locale, t, announceKey)
  }, [locale, t, announceKey])
}
