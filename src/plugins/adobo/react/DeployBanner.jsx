import { useEffect, useRef } from 'react'
import { mountDeployBanner } from '../overlay/banner.js'

const IS_DEV = import.meta.env.DEV

export function DeployBanner({ target }) {
  const bannerRef = useRef(null)

  useEffect(() => {
    if (!IS_DEV) return
    const banner = mountDeployBanner(target)
    bannerRef.current = banner
    return () => { banner.destroy(); bannerRef.current = null }
  }, [])

  useEffect(() => {
    bannerRef.current?.setTarget(target)
  }, [target])

  return null
}
