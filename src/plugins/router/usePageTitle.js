import { useEffect } from 'react'
import { useRouter } from './Router.jsx'

/**
 * Sets document.title to "AppName | pageTitle" while the calling component
 * is mounted, then resets to "AppName" on unmount.
 *
 * The app name comes from the `appName` prop on <Router>, set it once
 * there and every page automatically uses the same base title.
 *
 * Usage:
 *   function SettingsPanel() {
 *     usePageTitle('Settings')   // → "A11yHelper | Settings"
 *   }
 *
 * Home / index pages that should show only the app name need no call —
 * the unmount cleanup of the previous page restores the base title.
 */
export function usePageTitle(pageTitle) {
  const { appName } = useRouter()

  useEffect(() => {
    document.title = appName ? `${appName} | ${pageTitle}` : pageTitle
    return () => {
      if (appName) document.title = appName
    }
  }, [pageTitle, appName])
}
