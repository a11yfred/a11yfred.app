import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Settings, X } from 'lucide-react'
import SearchBar from './components/SearchBar.jsx'
import ResultList from './components/ResultList.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import Confetti from './components/Confetti.jsx'
import useDefectSearch from './hooks/useDefectSearch.js'
import {
  Router,
  useRouter,
  Drawer,
  BottomSheet,
  useMediaQuery,
} from './plugins/router/index.js'
import { Announcer, announce } from './plugins/announce/index.js'

const SettingsPanel = lazy(() => import('./components/SettingsPanel.jsx'))

// CSS custom properties overridden when party mode is active.
// Cleaned up when switching to any other theme.
const PARTY_KEYS = [
  '--bg', '--bg-subtle', '--border', '--border-control',
  '--text', '--text-muted', '--text-faint', '--text-disabled',
  '--accent', '--accent-bg', '--accent-text', '--focus', '--success', '--overlay-bg',
  '--priority-critical-text', '--priority-critical-bg',
  '--priority-high-text', '--priority-high-bg',
  '--priority-medium-text', '--priority-medium-bg',
  '--priority-low-text', '--priority-low-bg',
]

function generatePartyPalette() {
  const h = Math.floor(Math.random() * 360)
  const comp = (h + 180) % 360
  const tri = (h + 120) % 360
  return {
    '--bg':              `hsl(${h},    85%, 88%)`,
    '--bg-subtle':       `hsl(${h},    75%, 80%)`,
    '--border':          `hsl(${h},    50%, 68%)`,
    '--border-control':  `hsl(${comp}, 55%, 30%)`,
    '--text':            `hsl(${comp}, 70%,  8%)`,
    '--text-muted':      `hsl(${comp}, 45%, 22%)`,
    '--text-faint':      `hsl(${comp}, 35%, 32%)`,
    '--text-disabled':   `hsl(${comp}, 20%, 58%)`,
    '--accent':          `hsl(${tri},  85%, 38%)`,
    '--accent-bg':       `hsl(${tri},  75%, 88%)`,
    '--accent-text':     `hsl(${tri},  80%, 22%)`,
    '--focus':           `hsl(${tri},  85%, 38%)`,
    '--success':         'hsl(140, 60%, 30%)',
    '--overlay-bg':      `hsla(${h}, 40%, 15%, 0.55)`,
    // Priority badge colors stay fixed so they remain accessible
    '--priority-critical-text': '#a32d2d',
    '--priority-critical-bg':   '#fcebeb',
    '--priority-high-text':     '#854f0b',
    '--priority-high-bg':       '#faeeda',
    '--priority-medium-text':   '#185fa5',
    '--priority-medium-bg':     '#e6f1fb',
    '--priority-low-text':      '#3b6d11',
    '--priority-low-bg':        '#eaf3de',
  }
}

// Provider display names for the search hint
const PROVIDER_NAMES = {
  anthropic: 'Claude',
  openai: 'GPT',
  google: 'Gemini',
  microsoft: 'Copilot',
}

export default function App() {
  return (
    <Router appName="A11yTextHelper">
      <AppShell />
      <KofiWidget />
    </Router>
  )
}

function KofiWidget() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js'
    script.async = true
    script.onload = () => {
      window.kofiWidgetOverlay?.draw('mikeyil', {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Support me',
        'floating-chat.donateButton.background-color': '#434190',
        'floating-chat.donateButton.text-color': '#ffffff',
      })
    }
    document.body.appendChild(script)
    const cleanupA11y = patchKofiA11y()
    return () => {
      document.body.removeChild(script)
      cleanupA11y()
    }
  }, [])
  return null
}

function patchKofiA11y() {
  let triggerButton = null
  let cleanupFocusTrap = null

  function trapFocus(element) {
    const sel = [
      'a[href]', 'button:not([disabled])', 'input:not([disabled])',
      'select:not([disabled])', 'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',')
    const handler = (e) => {
      if (e.key !== 'Tab') return
      const focusable = [...element.querySelectorAll(sel)]
        .filter(el => el.offsetParent !== null)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }

  const observer = new MutationObserver(() => {
    if (!triggerButton) {
      triggerButton = document.querySelector('.floatingchat-container-wrap button, [class*="kofi"] button')
      if (!triggerButton) {
        triggerButton = document.querySelector('.floatingchat-container-wrap [class*="trigger"], .floatingchat-container-wrap [class*="chat"]')
      }
      if (triggerButton && !triggerButton.dataset.a11yPatched) {
        triggerButton.dataset.a11yPatched = 'true'
        if (!triggerButton.getAttribute('aria-label')) {
          triggerButton.setAttribute('aria-label', 'Support Mikey on Ko-fi (opens panel)')
        }
        const tag = triggerButton.tagName.toLowerCase()
        const isNativeButton = tag === 'button' || tag === 'a'
        if (!isNativeButton) {
          triggerButton.setAttribute('tabindex', '0')
          if (!triggerButton.getAttribute('role')) triggerButton.setAttribute('role', 'button')
          triggerButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerButton.click() }
          })
        } else if (triggerButton.getAttribute('tabindex') === '-1') {
          triggerButton.setAttribute('tabindex', '0')
        }
      }
    }

    const overlay = document.querySelector(
      '.kofi-overlay-widget-overlay, [id*="kofi"][class*="overlay"], [class*="kofi"][class*="iframe"]'
    )
    if (overlay && !overlay.dataset.a11yPatched) {
      overlay.dataset.a11yPatched = 'true'
      overlay.setAttribute('role', 'dialog')
      overlay.setAttribute('aria-modal', 'true')
      overlay.setAttribute('aria-label', 'Support on Ko-fi')
      cleanupFocusTrap = trapFocus(overlay)
    }

    if (!overlay && cleanupFocusTrap) {
      cleanupFocusTrap()
      cleanupFocusTrap = null
    }

    document.querySelectorAll('iframe[src*="ko-fi.com"]:not([title])').forEach(iframe => {
      iframe.setAttribute('title', 'Ko-fi donation widget')
    })

    document.querySelectorAll('i[rel="tooltip"]:not([data-a11y-patched])').forEach(tip => {
      tip.dataset.a11yPatched = 'true'
      tip.setAttribute('tabindex', '0')
      if (!tip.getAttribute('role')) tip.setAttribute('role', 'button')
      if (!tip.getAttribute('aria-label')) tip.setAttribute('aria-label', 'More information')
      tip.addEventListener('focus', () => tip.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true })))
      tip.addEventListener('blur', () => tip.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true })))
      tip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tip.click() }
      })
    })

    document.querySelectorAll(
      '.kofi-overlay-widget-overlay input[placeholder]:not([data-a11y-label-patched]),' +
      '.kofi-overlay-widget-overlay textarea[placeholder]:not([data-a11y-label-patched])'
    ).forEach(input => {
      input.dataset.a11yLabelPatched = 'true'
      const placeholder = input.getAttribute('placeholder')
      if (!placeholder) return
      if (!input.id) input.id = `kofi-input-${Math.random().toString(36).slice(2, 8)}`
      const lbl = document.createElement('label')
      lbl.setAttribute('for', input.id)
      lbl.textContent = placeholder
      lbl.style.cssText = 'display:block;font-size:0.85em;font-weight:500;margin-bottom:4px;'
      input.parentNode.insertBefore(lbl, input)
    })

    if (!document.getElementById('kofi-a11y-styles')) {
      const style = document.createElement('style')
      style.id = 'kofi-a11y-styles'
      style.textContent = [
        '.floatingchat-container-wrap { color: #1a1a1a !important; }',
        '.floatingchat-container-wrap * { color: inherit; }',
        '.floatingchat-container-wrap a { color: #1a1a1a !important; }',
        '.kofi-overlay-widget-overlay { color: #1a1a1a !important; }',
        '.kofi-overlay-widget-overlay p, .kofi-overlay-widget-overlay span,',
        '.kofi-overlay-widget-overlay label, .kofi-overlay-widget-overlay a { color: #1a1a1a !important; }',
      ].join('\n')
      document.head.appendChild(style)
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  const handleEsc = (e) => {
    if (e.key !== 'Escape') return
    const closeBtn = document.querySelector(
      '[class*="kofi-close"], [id*="kofi-close"], .floatingchat-container-wrap .close'
    )
    if (closeBtn) {
      closeBtn.click()
      triggerButton?.focus()
    }
  }
  document.addEventListener('keydown', handleEsc)

  return () => {
    observer.disconnect()
    cleanupFocusTrap?.()
    document.removeEventListener('keydown', handleEsc)
    document.getElementById('kofi-a11y-styles')?.remove()
  }
}

function AppShell() {
  const { route, navigate } = useRouter()
  const isDesktop = useMediaQuery('(width >= 768px)')
  const settingsOpen = route === '/settings'
  const h1Ref = useRef(null)
  const didMount = useRef(false)
  // Tracks whether settings was opened while a defect panel was selected,
  // so the panel is restored (with edits) when settings closes.
  const returnToPanelRef = useRef(false)

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto')
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    if (saved) return saved
    // Default to the browser/OS language, falling back to English
    return navigator.language?.split('-')[0] || 'en'
  })
  const [aiEnabled, setAiEnabled] = useState(false)
  const [liveSearch, setLiveSearch] = useState(() => localStorage.getItem('liveSearch') !== 'false')
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [searchKey, setSearchKey] = useState(0)
  const [selected, setSelected] = useState(null)
  const [platform, setPlatform] = useState(() => localStorage.getItem('platform') || 'web')
  const [panelFocusTrigger, setPanelFocusTrigger] = useState(0)

  const activeQuery = liveSearch ? query : submittedQuery
  const results = useDefectSearch(activeQuery, platform, searchKey)

  // Background is inert when an overlay panel is active.
  // When selected AND settings is open (mobile), the background is inert due
  // to the settings drawer — exclude the panel from triggering it separately.
  const backgroundInert = (!isDesktop && settingsOpen) || (!!selected && !settingsOpen)

  useEffect(() => {
    // Clean up any palette inline styles from a previous party activation
    PARTY_KEYS.forEach(k => document.documentElement.style.removeProperty(k))

    if (theme === 'party') {
      document.documentElement.setAttribute('data-theme', 'party')
      const palette = generatePartyPalette()
      Object.entries(palette).forEach(([k, v]) =>
        document.documentElement.style.setProperty(k, v)
      )
      localStorage.setItem('theme', theme)
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      announce(
        prefersReduced
          ? 'Party mode activated! The font has changed to Comic Sans. The colors have changed to a random bright color palette. The mouse cursor is now a magic wand. Confetti was skipped because reduced motion is turned on.'
          : 'Party mode activated! The font has changed to Comic Sans. The colors have changed to a random bright color palette. Colorful confetti is now falling from the top of the screen in an assortment of colors and shapes. The mouse cursor is now a magic wand.',
        { priority: 'assertive' }
      )
      return
    }

    const apply = () => {
      const resolved = theme === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme
      document.documentElement.setAttribute('data-theme', resolved)
    }
    apply()
    localStorage.setItem('theme', theme)
    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = language
    localStorage.setItem('language', language)
  }, [language])

  useEffect(() => { localStorage.setItem('liveSearch', liveSearch) }, [liveSearch])
  useEffect(() => { localStorage.setItem('platform', platform) }, [platform])

  // WCAG 2.4.3: focus h1 when returning from settings on desktop (page swap).
  // On mobile or when returning to a defect panel, restore panel focus instead.
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return }
    if (!settingsOpen) {
      if (returnToPanelRef.current) {
        setPanelFocusTrigger(t => t + 1)
        returnToPanelRef.current = false
      } else if (isDesktop) {
        h1Ref.current?.focus()
      }
    }
  }, [settingsOpen, isDesktop])

  const handleQueryChange = (q) => {
    setQuery(q)
    if (q === '') {
      setSelected(null)
      returnToPanelRef.current = false
      setSubmittedQuery('')
    }
  }

  const handleOpenSettings = () => {
    // Track whether a panel was open when settings launched so we can restore it
    returnToPanelRef.current = !!selected
    navigate('/settings')
    // Do NOT clear selected here — keepMounted preserves the panel state
  }

  const settingsProps = {
    aiEnabled,
    onToggleAi: () => setAiEnabled(a => !a),
    liveSearch,
    onToggleLiveSearch: () => setLiveSearch(s => !s),
    theme,
    onThemeChange: setTheme,
    language,
    onLanguageChange: setLanguage,
    platform,
    onPlatformChange: setPlatform,
    onClose: () => navigate('/'),
  }

  // Provider name for the search hint (read from localStorage; updates on next render after save)
  const providerName = aiEnabled
    ? (PROVIDER_NAMES[localStorage.getItem('ai_provider')] || 'AI')
    : null

  const searchView = (
    <>
      <SearchBar
        query={query}
        onChange={handleQueryChange}
        onSearch={() => { setSubmittedQuery(query); setSearchKey(k => k + 1); setSelected(null) }}
        liveSearch={liveSearch}
        platform={platform}
        aiEnabled={aiEnabled}
        providerName={providerName}
      />
      {activeQuery.length >= 2 && (
        <ResultList
          results={results}
          selected={selected}
          onSelect={setSelected}
          query={activeQuery}
        />
      )}
    </>
  )

  return (
    <div className="app-container">
      <Announcer />
      <Confetti active={theme === 'party'} />

      {/* eslint-disable-next-line react/no-unknown-property */}
      <div className="app-background" inert={backgroundInert ? '' : undefined}>
        <Header
          h1Ref={h1Ref}
          settingsOpen={settingsOpen}
          onOpenSettings={handleOpenSettings}
          onCloseSettings={() => navigate('/')}
          isDesktop={isDesktop}
        />
        <main className="app-main">
          <Suspense fallback={null}>
            {isDesktop && settingsOpen ? <SettingsPanel {...settingsProps} /> : searchView}
          </Suspense>
        </main>
        <Footer />
      </div>

      {!isDesktop && (
        <Drawer open={settingsOpen} onClose={() => navigate('/')} label="Settings">
          <Suspense fallback={null}>
            <SettingsPanel {...settingsProps} />
          </Suspense>
        </Drawer>
      )}

      <BottomSheet
        open={!!selected && !settingsOpen}
        onClose={() => { setSelected(null); returnToPanelRef.current = false }}
        keepMounted={settingsOpen && !!selected}
        label={selected ? `${selected.title} — defect detail` : 'Defect detail'}
      >
        {selected && (
          <DetailPanel
            key={selected.id}
            defect={selected}
            aiEnabled={aiEnabled}
            focusTrigger={panelFocusTrigger}
          />
        )}
      </BottomSheet>
    </div>
  )
}

function Header({ h1Ref, settingsOpen, onOpenSettings, onCloseSettings, isDesktop }) {
  const compact = isDesktop && settingsOpen
  return (
    <header className={`page-header${compact ? ' page-header--compact' : ''}`}>
      {!compact && (
        <a
          href="https://github.com/mikeyil/a11ytexthelper"
          target="_blank"
          rel="noreferrer"
          className="header-github-link"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            className="inline-icon"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z" />
          </svg>
          Fork on GitHub
        </a>
      )}

      <button
        onClick={settingsOpen ? onCloseSettings : onOpenSettings}
        aria-label={settingsOpen ? 'Close settings' : 'Open settings'}
        title={settingsOpen ? 'Close settings' : 'Open settings'}
        className="btn-icon btn-icon-accent page-header__settings-btn"
      >
        {settingsOpen
          ? <X size={20} strokeWidth={2.5} aria-hidden="true" />
          : <Settings size={20} strokeWidth={2} aria-hidden="true" />
        }
      </button>

      <h1
        ref={h1Ref}
        tabIndex={-1}
        className={compact ? 'sr-only' : 'page-title'}
      >
        A11yTextHelper
      </h1>

      {!compact && (
        <p className="page-tagline">Audit defect descriptions, fast</p>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="page-footer">
      <p className="footer-credit">
        A project by <strong>Mikey Ilagan</strong>
        {' · '}
        <a
          href="https://www.linkedin.com/in/mikeyil"
          target="_blank"
          rel="noreferrer"
          className="footer-link"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            className="inline-icon"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </a>
      </p>
    </footer>
  )
}
