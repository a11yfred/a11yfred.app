import { useEffect, useRef } from 'react'
import { mountAnnouncer } from './mountAnnouncer.js'
import './announcer.css'

export function Announcer({ devEnabled = true }) {
  const instanceRef = useRef(null)

  useEffect(() => {
    instanceRef.current = mountAnnouncer({ enabled: devEnabled })
    return () => instanceRef.current?.destroy()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- mount-once; devEnabled changes handled by the effect below

  useEffect(() => {
    instanceRef.current?.setEnabled(devEnabled)
  }, [devEnabled])

  return null
}
