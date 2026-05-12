import { useEffect, useRef } from 'react'
import { useNavigation, useLocation } from 'react-router'
import { announce } from '../taho/announce.js'

/**
 * Announces route transitions to screen readers.
 * Mount once in your Remix root layout.
 *
 * Remix does not manage focus or announcements on client-side navigations.
 * This hook fills that gap by announcing when a navigation completes,
 * giving screen reader users the same awareness sighted users get from
 * visual page changes.
 *
 * @param {(pathname: string) => string} [getLabel]
 *   Override the announcement text. Defaults to announcing the new pathname.
 *   In practice, wire this to your page title:
 *     useRouteAnnouncer(pathname => document.title)
 */
export function useRouteAnnouncer(getLabel) {
  const navigation = useNavigation()
  const location = useLocation()
  const prevPathname = useRef(location.pathname)
  const wasNavigating = useRef(false)

  useEffect(() => {
    if (navigation.state === 'loading') {
      wasNavigating.current = true
    }

    if (navigation.state === 'idle' && wasNavigating.current) {
      wasNavigating.current = false
      if (location.pathname !== prevPathname.current) {
        prevPathname.current = location.pathname
        const label = getLabel
          ? getLabel(location.pathname)
          : location.pathname
        announce(label, { priority: 'polite' })
      }
    }
  }, [navigation.state, location.pathname, getLabel])
}
