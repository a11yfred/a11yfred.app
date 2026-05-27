import { useState, useEffect } from 'react'

export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  if (delay === 0 && debouncedValue !== value) {
    setDebouncedValue(value)
  }

  useEffect(() => {
    if (delay === 0) return

    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
