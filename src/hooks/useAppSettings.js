import { useState } from 'react'
import { getStorage, getStorageJson } from '../utils/storage.js'
import { LS_THEME, LS_LANGUAGE, LS_LIVE_SEARCH, LS_SHOW_RANKING, LS_SHOW_PERSONAL_CORPUS, LS_PLATFORM, LS_WCAG_FILTER, LS_SAVE_COUNT, DEFAULT_WCAG_FILTER } from '../utils/constants.js'
import LANGUAGES from '../data/languages.js'

const SUPPORTED_LOCALES = LANGUAGES.map(l => l.value)

export default function useAppSettings() {
  const [theme, setTheme] = useState(() => getStorage(LS_THEME, 'auto'))
  const [language, setLanguage] = useState(() => {
    const saved = getStorage(LS_LANGUAGE)
    if (saved) return saved
    const lang = navigator.language || 'en'
    return SUPPORTED_LOCALES.includes(lang)
      ? lang
      : (SUPPORTED_LOCALES.find(s => s === lang.split('-')[0]) || 'en')
  })
  const [aiEnabled, setAiEnabled] = useState(false)
  const [saveCount, setSaveCount] = useState(() => parseInt(getStorage(LS_SAVE_COUNT, '0'), 10))
  const fiestaUnlocked = saveCount >= 2 || theme === 'fiesta'
  const [liveSearch, setLiveSearch] = useState(() => getStorage(LS_LIVE_SEARCH) !== 'false')
  const [showVoting, setShowVoting] = useState(() => getStorage(LS_SHOW_RANKING) !== 'false')
  const [showPersonalCorpus, setShowPersonalCorpus] = useState(() => getStorage(LS_SHOW_PERSONAL_CORPUS) !== 'false')
  const [platform, setPlatform] = useState(() => {
    const hashSearch = window.location.hash.includes('?') ? window.location.hash.slice(window.location.hash.indexOf('?') + 1) : ''
    const initParams = new URLSearchParams(window.location.search || hashSearch)
    return initParams.get('platform') || getStorage(LS_PLATFORM, 'all')
  })
  const [wcagFilter, setWcagFilter] = useState(() => {
    const hashSearch = window.location.hash.includes('?') ? window.location.hash.slice(window.location.hash.indexOf('?') + 1) : ''
    const initParams = new URLSearchParams(window.location.search || hashSearch)
    const urlWcag = initParams.get('wcag')
    if (urlWcag) {
      const [version, level] = urlWcag.split('|')
      if (version && level) return { maxVersion: version, maxLevel: level }
    }
    const saved = getStorageJson(LS_WCAG_FILTER, null)
    if (!saved || 'show20' in saved) return DEFAULT_WCAG_FILTER
    return saved
  })

  return {
    theme, setTheme,
    language, setLanguage,
    aiEnabled, setAiEnabled,
    liveSearch, setLiveSearch,
    showVoting, setShowVoting,
    showPersonalCorpus, setShowPersonalCorpus,
    fiestaUnlocked, setSaveCount,
    platform, setPlatform,
    wcagFilter, setWcagFilter,
  }
}
