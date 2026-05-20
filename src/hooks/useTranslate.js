import { useState, useEffect } from 'react'
import { getT as getCalamansiT, _subscribe } from '@ulam/calamansi'

export function useT() {
  const [t, setT] = useState(() => getCalamansiT())

  useEffect(() => {
    return _subscribe(setT)
  }, [])

  return t
}
