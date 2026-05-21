import { useEffect } from 'react'

/**
 * Sets document.title to "pageTitle | A11yFred" format.
 */
export function usePageTitle(pageTitle) {
  useEffect(() => {
    const appName = 'A11yFred'
    document.title = pageTitle && appName ? `${pageTitle} | ${appName}` : pageTitle || appName
    return () => {
      document.title = appName
    }
  }, [pageTitle])
}
