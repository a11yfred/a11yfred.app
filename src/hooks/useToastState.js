import { useState, useCallback } from 'react'
import { NOTIFICATION_TIMEOUT } from '../utils/constants.js'

export default function useToastState(duration = NOTIFICATION_TIMEOUT) {
  const [isActive, setIsActive] = useState(false)

  const trigger = useCallback(() => {
    setIsActive(true)
    setTimeout(() => setIsActive(false), duration)
  }, [duration])

  return [isActive, trigger]
}
