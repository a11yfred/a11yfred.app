import { useState, useCallback } from 'react'
import { NOTIFICATION_TIMEOUT } from '../utils/constants.js'

/**
 * Manages transient toast/notification state with auto-dismiss.
 * @param {number} duration - Milliseconds before auto-dismiss (default: 2000ms)
 * @returns {[boolean, Function]} - [isActive, trigger] to show/hide toast
 */
export default function useToastState(duration = NOTIFICATION_TIMEOUT) {
  const [isActive, setIsActive] = useState(false)

  const trigger = useCallback(() => {
    setIsActive(true)
    setTimeout(() => setIsActive(false), duration)
  }, [duration])

  return [isActive, trigger]
}
