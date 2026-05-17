import { useEffect } from 'react'
import { setStorage } from '../utils/storage.js'

export default function useStorageSync(value, key, serialize = String) {
  useEffect(() => {
    setStorage(key, serialize(value))
  }, [value, key, serialize])
}
