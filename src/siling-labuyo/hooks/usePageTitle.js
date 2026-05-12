import { useEffect } from 'react'
import { useRouter } from '../router/Router.jsx' // hash router — swap for useRouteContext in siling-mahaba

/**
 * Sets document.title to "AppName | pageTitle" while mounted, then resets to
 * "AppName" on unmount. App name comes from the `appName` prop on <Router>.
 *
 * Usage:
 *   function SettingsPanel() {
 *     usePageTitle('Settings')   // → "A11yHelper | Settings"
 *   }
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
