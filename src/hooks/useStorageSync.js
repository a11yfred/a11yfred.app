import { useEffect } from 'react'
import { setStorage } from '../utils/storage.js'

/**
 * Synchronizes a React state value to localStorage on every change.
 * @param {*} value - The value to persist
 * @param {string} key - localStorage key
 * @param {Function} serialize - Optional serializer (default: String)
 */
export default function useStorageSync(value, key, serialize = String) {
  useEffect(() => {
    setStorage(key, serialize(value))
  }, [value, key, serialize])
}
