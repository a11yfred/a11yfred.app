import { useEffect, useRef, useState } from 'react'
import { entrySlug } from '../utils/entrySlug'
import { returnFocus } from '../utils/a11yUtils'
import { getSession, removeSession, setSession } from '../utils/storage'

const LS_LAST_SELECTED = 'lastSelectedId'

/**
 * Manages navigation, entry history, and focus restoration.
 * Handles route changes, entry selection, and back navigation.
 *
 * @param {Object} deps - Dependencies
 * @param {Object} deps.route - Current route
 * @param {Function} deps.navigate - Router navigate function
 * @param {boolean} deps.isDesktop - Whether device is desktop
 * @param {Object | null} deps.selected - Currently selected entry
 * @param {Function} deps.setSelected - Setter for selected entry
 * @param {boolean} deps.settingsOpen - Whether settings panel is open
 * @param {Function} deps.setSheetCollapsed - Setter for sheet collapsed state
 * @param {string} deps.entryIdFromRoute - Entry ID from URL
 * @param {Array} deps.allEntries - All available entries
 * @param {boolean} deps.dataLoading - Whether entry data is loading
 * @param {boolean} deps.sheetCollapsed - Whether sheet is collapsed
 * @param {boolean} deps.aboutOpen - Whether about panel is open
 * @param {boolean} deps.helpOpen - Whether help panel is open
 * @param {boolean} deps.onboardingOpen - Whether onboarding is open
 * @param {boolean} deps.adminOpen - Whether admin panel is open
 * @param {Function} deps.recordOpen - Record entry open event
 * @param {Function} deps.recordRecentEntry - Record entry as recent
 * @param {boolean} deps.viewAll - Whether showing all results
 * @param {Object | null} deps.appName - App name for title
 * @param {Function} deps.setPendingEntry - Set pending entry to select
 * @param {Function} deps.setPanelFocusTrigger - Trigger panel focus update
 *
 * @returns {{
 *   entryHistory: Array<Object>,
 *   setEntryHistory: Function,
 *   handleOpenSettings: () => void,
 *   handleCloseSettings: () => void,
 *   handleGuardedCloseSettings: () => void,
 *   handleOpenAbout: () => void,
 *   handleCloseOverlay: () => void,
 *   handleOpenHelp: () => void,
 *   handleOpenOnboarding: () => void,
 *   handleCloseOnboarding: () => void,
 *   handleSelectEntry: (entry: Object | null, triggerEl: HTMLElement) => void,
 *   applySelectEntry: (entry: Object | null, triggerEl: HTMLElement) => void,
 *   handleSelectRelated: (entry: Object) => void,
 *   handleBack: () => void,
 *   h1Ref: React.MutableRefObject,
 *   h1LinkRef: React.MutableRefObject,
 *   settingsTriggerRef: React.MutableRefObject,
 *   settingsPanelRef: React.MutableRefObject,
 *   aboutTriggerRef: React.MutableRefObject,
 *   helpTriggerRef: React.MutableRefObject,
 *   onboardingTriggerRef: React.MutableRefObject,
 *   returnToPanelRef: React.MutableRefObject<boolean>,
 *   entryTriggerRef: React.MutableRefObject,
 *   entryTriggerIdRef: React.MutableRefObject,
 *   returnViewAllRef: React.MutableRefObject<boolean>,
 *   returnHashRef: React.MutableRefObject<string | null>,
 *   pinnedHeadingRef: React.MutableRefObject,
 *   viewAllTriggerRef: React.MutableRefObject,
 *   wasNotFoundRef: React.MutableRefObject<boolean>,
 *   aboutWasOpenRef: React.MutableRefObject<boolean>,
 * }}
 */
export function useRouteHandler({
  route,
  navigate,
  isDesktop,
  selected,
  setSelected,
  settingsOpen,
  setSheetCollapsed,
  entryIdFromRoute,
  allEntries,
  dataLoading,
  sheetCollapsed,
  aboutOpen,
  helpOpen,
  onboardingOpen,
  adminOpen,
  recordOpen,
  recordRecentEntry,
  viewAll,
  appName,
  setPendingEntry,
  setPanelFocusTrigger,
}) {
  const h1Ref = useRef(null)
  const h1LinkRef = useRef(null)
  const settingsTriggerRef = useRef(null)
  const settingsPanelRef = useRef(null)
  const aboutTriggerRef = useRef(null)
  const helpTriggerRef = useRef(null)
  const onboardingTriggerRef = useRef(null)
  const entryTriggerRef = useRef(null)
  const entryTriggerIdRef = useRef(null)
  const returnViewAllRef = useRef(false)
  const returnHashRef = useRef(null)
  const pinnedHeadingRef = useRef(null)
  const viewAllTriggerRef = useRef(null)
  const wasNotFoundRef = useRef(false)
  const aboutWasOpenRef = useRef(false)
  const didMount = useRef(false)
  const sessionRestoredRef = useRef(false)
  const onboardingSeenCheckRef = useRef(false)

  const returnToPanelRef = useRef(false)
  const [entryHistory, setEntryHistory] = useState([])

  const handleCloseSettings = () => {
    if (returnViewAllRef.current && !returnToPanelRef.current) {
      returnViewAllRef.current = false
      navigate('/results/all')
    } else {
      navigate('/')
    }
  }

  const handleGuardedCloseSettings = (settingsPanelRef) => {
    if (settingsPanelRef.current) { settingsPanelRef.current.guardedClose() }
    else { handleCloseSettings() }
  }

  const handleOpenAbout = () => {
    aboutTriggerRef.current = document.activeElement
    if (viewAll) returnViewAllRef.current = true
    navigate('/about')
  }

  const handleCloseOverlay = () => {
    if (selected) {
      navigate(`/entry/${selected.id}/${entrySlug(selected.title)}`)
    } else if (returnViewAllRef.current) {
      returnViewAllRef.current = false
      navigate('/results/all')
    } else {
      navigate('/')
    }
  }

  const handleOpenHelp = () => {
    helpTriggerRef.current = document.activeElement
    if (viewAll) returnViewAllRef.current = true
    navigate('/help')
  }

  const handleOpenOnboarding = () => {
    onboardingTriggerRef.current = document.activeElement
    navigate('/onboarding')
  }

  const handleCloseOnboarding = () => {
    navigate('/')
    setTimeout(() => returnFocus(h1LinkRef.current ?? h1Ref.current), 0)
  }

  const handleSelectEntry = (entry, triggerEl) => {
    if (entry && entry.id !== selected?.id && sheetCollapsed) {
      setPendingEntry(entry)
      return
    }
    applySelectEntry(entry, triggerEl)
  }

  const applySelectEntry = (entry, triggerEl) => {
    if (entry) {
      if (!selected) {
        entryTriggerRef.current = triggerEl ?? document.activeElement
        entryTriggerIdRef.current = triggerEl?.dataset?.entryId ?? null
        returnHashRef.current = window.location.hash || '#/'
      }
      if (viewAll) returnViewAllRef.current = true
      setSession(LS_LAST_SELECTED, entry.id)
      recordOpen(entry.id)
      recordRecentEntry(entry.id)
    } else {
      removeSession(LS_LAST_SELECTED)
      setEntryHistory([])
      setSheetCollapsed(false)
      setSelected(null)
      const triggerId = entryTriggerIdRef.current
      if (isDesktop && (settingsOpen || aboutOpen || helpOpen || onboardingOpen)) return
      const shouldReturn = returnViewAllRef.current
      returnViewAllRef.current = false
      const returnHash = returnHashRef.current
      returnHashRef.current = null
      const focusCard = () => {
        const isTouch = !window.matchMedia('(hover: hover)').matches
        const focus = (el) => isTouch ? el.focus({ preventScroll: false }) : returnFocus(el)
        if (triggerId) {
          const el = document.querySelector(`[data-entry-id="${triggerId}"]`)
          if (el) { focus(el); return }
          requestAnimationFrame(() => {
            const el2 = document.querySelector(`[data-entry-id="${triggerId}"]`)
            if (el2) { focus(el2); return }
            returnFocus(h1LinkRef.current ?? h1Ref.current)
          })
          return
        }
        returnFocus(h1LinkRef.current ?? h1Ref.current)
      }
      if (shouldReturn) { navigate('/results/all'); setTimeout(focusCard, 0); return }
      if (returnHash && returnHash !== '#/' && !returnHash.startsWith('#/entry/')) {
        navigate(returnHash.slice(1)); setTimeout(focusCard, 0); return
      }
      navigate('/')
      setTimeout(focusCard, 0)
      return
    }
    setSheetCollapsed(false)
    setSelected(entry)
    navigate(`/entry/${entry.id}/${entrySlug(entry.title)}`) // eslint-disable-line react-hooks/immutability
  }

  const handleSelectRelated = (entry) => {
    if (!entry) return
    setEntryHistory(h => selected ? [...h, selected] : h)
    setSession(LS_LAST_SELECTED, entry.id)
    recordOpen(entry.id)
    recordRecentEntry(entry.id)
    setSheetCollapsed(false)
    setSelected(entry)
    navigate(`/entry/${entry.id}/${entrySlug(entry.title)}`)
    setPanelFocusTrigger(n => n + 1)
  }

  const handleBack = () => {
    const prev = entryHistory[entryHistory.length - 1]
    if (!prev) return
    setEntryHistory(h => h.slice(0, -1))
    setSelected(prev)
    navigate(`/entry/${prev.id}/${entrySlug(prev.title)}`)
    setPanelFocusTrigger(n => n + 1)
  }

  const handleOpenSettings = () => {
    settingsTriggerRef.current = document.activeElement
    aboutWasOpenRef.current = false
    // eslint-disable-next-line react-hooks/immutability
    returnToPanelRef.current = !!selected
    if (viewAll && !selected) returnViewAllRef.current = true
    navigate('/settings')
  }

  // Settings close focus restoration
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return }
    if (!settingsOpen) {
      if (returnToPanelRef.current) {
        setPanelFocusTrigger(n => n + 1)
        returnToPanelRef.current = false
      } else if (settingsTriggerRef.current) {
        returnFocus(settingsTriggerRef.current)
        settingsTriggerRef.current = null
      } else if (isDesktop) {
        returnFocus(h1Ref.current)
      }
    }
  }, [settingsOpen, isDesktop, setPanelFocusTrigger])

  // About close focus restoration
  useEffect(() => {
    if (aboutOpen) { aboutWasOpenRef.current = true; return }
    if (aboutWasOpenRef.current) {
      if (aboutTriggerRef.current) {
        returnFocus(aboutTriggerRef.current)
        aboutTriggerRef.current = null
      } else if (isDesktop) {
        returnFocus(h1Ref.current)
      }
      aboutWasOpenRef.current = false
    }
  }, [aboutOpen, isDesktop])

  // Not found focus restoration
  const isNotFound = route === '/notfound'
  useEffect(() => {
    if (isNotFound) { wasNotFoundRef.current = true; return }
    if (wasNotFoundRef.current) {
      wasNotFoundRef.current = false
      setTimeout(() => returnFocus(h1LinkRef.current ?? h1Ref.current), 0)
    }
  }, [isNotFound])

  // Sync entry ID from route
  useEffect(() => {
    if (!entryIdFromRoute || dataLoading || allEntries.length === 0) return
    if (sheetCollapsed) return
    if (selected?.id === entryIdFromRoute) return
    const found = allEntries.find(d => d.id === entryIdFromRoute)
    if (found) setSelected(found)
  }, [entryIdFromRoute, dataLoading, sheetCollapsed, selected, allEntries, setSelected])

  // Restore last-selected entry from session storage
  useEffect(() => {
    if (sessionRestoredRef.current || dataLoading || allEntries.length === 0) return
    sessionRestoredRef.current = true
    if (entryIdFromRoute) return
    const lastId = getSession(LS_LAST_SELECTED)
    if (!lastId) return
    const found = allEntries.find(d => d.id === lastId)
    if (found) {
      setSelected(found)
      navigate(`/entry/${found.id}/${entrySlug(found.title)}`)
    }
  }, [dataLoading, allEntries, entryIdFromRoute, setSelected, navigate])

  // Update document title
  useEffect(() => {
    if (!selected || settingsOpen || aboutOpen || adminOpen) return
    document.title = appName ? `${appName} | ${selected.title}` : selected.title
  }, [selected, settingsOpen, aboutOpen, adminOpen, appName])

  // Show onboarding on first visit
  useEffect(() => {
    if (onboardingSeenCheckRef.current) return
    onboardingSeenCheckRef.current = true
    const LS_ONBOARDING_SEEN = 'onboardingSeen'
    if (!window.localStorage.getItem(LS_ONBOARDING_SEEN) && route === '/') {
      navigate('/onboarding')
    }
  }, [route, navigate])

  return {
    entryHistory,
    setEntryHistory,
    handleOpenSettings,
    handleCloseSettings,
    handleGuardedCloseSettings: () => handleGuardedCloseSettings(settingsPanelRef),
    handleOpenAbout,
    handleCloseOverlay,
    handleOpenHelp,
    handleOpenOnboarding,
    handleCloseOnboarding,
    handleSelectEntry,
    applySelectEntry,
    handleSelectRelated,
    handleBack,
    h1Ref,
    h1LinkRef,
    settingsTriggerRef,
    settingsPanelRef,
    aboutTriggerRef,
    helpTriggerRef,
    onboardingTriggerRef,
    returnToPanelRef,
    entryTriggerRef,
    entryTriggerIdRef,
    returnViewAllRef,
    returnHashRef,
    pinnedHeadingRef,
    viewAllTriggerRef,
    wasNotFoundRef,
    aboutWasOpenRef,
  }
}
