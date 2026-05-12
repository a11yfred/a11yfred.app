/**
 * @ulam/calamansi/react — React adapter
 *
 * Thin React wrappers around the vanilla calamansi module API.
 * Use these in React apps during transition; vanilla consumers import
 * directly from '@ulam/calamansi'.
 *
 * REMIX 3 MIGRATION — I18nProvider:
 *   In Remix 3, locale comes from a loader, not a React provider.
 *   Replace <I18nProvider locale={locale}> in root.jsx with:
 *
 *     // app/root.jsx
 *     export async function loader({ request }) {
 *       const locale = detectLocale(request)   // your locale detection logic
 *       return { locale }
 *     }
 *     export default function Root() {
 *       const { locale } = useLoaderData()
 *       setLocale(locale)                      // vanilla call — no provider needed
 *       return <Outlet />
 *     }
 *
 *   I18nProvider can then be deleted. All useT() calls continue to work
 *   because setLocale() notifies the same subscriber set.
 */
import { useState, useEffect, useCallback } from 'react'
import { setLocale, getT, _subscribe, getPref, setPref } from './index.js'

/**
 * Sets the active locale for the app. Mount once at the root.
 * Children can call useT() anywhere in the tree without prop drilling.
 *
 * @param {{ locale: string, children: React.ReactNode }} props
 *
 * @deprecated Replace with a direct setLocale() call in the Remix 3 root loader.
 *   See REMIX 3 MIGRATION note at the top of this file.
 */
export function I18nProvider({ locale, children }) {
  useEffect(() => {
    setLocale(locale)
  }, [locale])

  return children
}

/**
 * Returns the current translate function.
 * Re-renders the component when the locale changes.
 *
 * @returns {(key: string, vars?: Record<string, string>) => string}
 */
export function useT() {
  const [t, setT] = useState(getT)
  useEffect(() => _subscribe(setT), [])
  return t
}

/**
 * Persisted user preference backed by localStorage.
 * Wraps getPref/setPref with React state so the component re-renders on change.
 *
 * @param {string} key
 * @param {*} defaultValue
 * @returns {[value, setValue]}
 */
export function usePref(key, defaultValue) {
  const [value, setValueState] = useState(() => getPref(key, defaultValue))

  const setValue = useCallback((next) => {
    const resolved = typeof next === 'function' ? next(value) : next
    setValueState(resolved)
    setPref(key, resolved)
  }, [key, value])

  return [value, setValue]
}
