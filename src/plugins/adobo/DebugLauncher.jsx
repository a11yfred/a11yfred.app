import { useState, useRef, useEffect } from 'react'

function useEscapeKey(isActive, onEscape) {
  useEffect(() => {
    if (!isActive) return
    const handler = (e) => { if (e.key === 'Escape') onEscape() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isActive, onEscape])
}

const IS_DEV = import.meta.env.DEV

const ENABLED = false

const POSITION = 'bottom-right'

const POSITION_STYLES = {
  'bottom-right':  { bottom: '1.25rem', right: '1.25rem' },
  'bottom-left':   { bottom: '1.25rem', left:  '1.25rem' },
  'bottom-center': { bottom: '1.25rem', left:  '50%', transform: 'translateX(-50%)' },
  'top-right':     { top:    '1.25rem', right: '1.25rem' },
  'top-left':      { top:    '1.25rem', left:  '1.25rem' },
  'top-center':    { top:    '1.25rem', left:  '50%', transform: 'translateX(-50%)' },
  'middle-right':  { top:    '50%',     right: '1.25rem', transform: 'translateY(-50%)' },
  'middle-left':   { top:    '50%',     left:  '1.25rem', transform: 'translateY(-50%)' },
}

const STANDARD_SECTIONS = [
  {
    heading: 'A11y Testing',
    rows: [
      { cmd: 'debug all',       desc: 'All debug tools on' },
      { cmd: 'debug all off',   desc: 'All debug tools off' },
      { cmd: 'debug names',     desc: 'Name tooltips on' },
      { cmd: 'debug names off', desc: 'Name tooltips off' },
    ],
  },
  {
    heading: 'Deploy Banner',
    rows: [
      { cmd: 'debug deploy off',     desc: 'Off' },
      { cmd: 'debug deploy netlify', desc: 'Netlify' },
      { cmd: 'debug deploy pages',   desc: 'GitHub Pages' },
      { cmd: 'debug deploy vercel',  desc: 'Vercel' },
    ],
  },
]

/**
 * Floating debug launcher — pill FAB with two modes:
 *
 *   Menu mode   (default) — clickable command list, same as before.
 *   Input mode  — a spotlight-style text field that fires onCommand on Enter.
 *                 Activated by clicking the ⌨ icon in the menu header, or by
 *                 pressing "/" while the menu is open.
 *
 * The input mode is the self-contained path for projects that don't have a
 * dedicated search input to hook into. The onCommand prop works identically
 * in both modes.
 *
 * Props:
 *   enabled         boolean                              override ENABLED constant
 *   position        string                               override POSITION constant
 *   onCommand       fn(cmd) → boolean                   called for every fired command
 *   customSections  [{ heading, rows: [{cmd, desc}] }]  project-specific command groups
 */
export function DebugLauncher({ enabled = ENABLED, position = POSITION, onCommand, customSections = [] }) {
  const [open, setOpen]           = useState(false)
  const [inputMode, setInputMode] = useState(false)
  const [inputVal, setInputVal]   = useState('')
  const inputRef = useRef(null)

  useEscapeKey(open, () => close())

  // Auto-focus the input when switching to input mode
  useEffect(() => {
    if (inputMode && open) inputRef.current?.focus()
  }, [inputMode, open])

  // Press "/" while menu is open → jump to input mode
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === '/' && !inputMode) {
        e.preventDefault()
        setInputMode(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, inputMode])

  function close() {
    setOpen(false)
    setInputMode(false)
    setInputVal('')
  }

  function fire(cmd) {
    onCommand?.(cmd)
    close()
  }

  function handleInputKeyDown(e) {
    if (e.key === 'Enter') {
      const cmd = inputVal.trim()
      if (cmd) fire(cmd)
    }
    if (e.key === 'Escape') close()
  }

  if (!IS_DEV || !enabled) return null

  const posStyle  = POSITION_STYLES[position] ?? POSITION_STYLES['bottom-right']
  const allSections = [...STANDARD_SECTIONS, ...customSections]

  return (
    <>
      <button
        className="debug-launcher-fab"
        style={posStyle}
        onClick={() => setOpen(o => !o)}
        aria-label="Open debug menu"
        aria-expanded={open}
        title="Debug Menu"
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="10,1 17.66,5.5 17.66,14.5 10,19 2.34,14.5 2.34,5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
          <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <line x1="10" y1="1" x2="10" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="10" y1="12.5" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="17.66" y1="5.5" x2="12.17" y2="8.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="7.83" y1="11.25" x2="2.34" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="2.34" y1="5.5" x2="7.83" y2="8.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="12.17" y1="11.25" x2="17.66" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className="debug-launcher-fab__label">debug</span>
      </button>

      {open && (
        <>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div className="debug-fab-menu-backdrop" onClick={close} />

          {inputMode ? (
            /* ── Input / spotlight mode ── */
            <div className="debug-fab-menu debug-fab-menu--input" style={posStyle}>
              <div className="debug-fab-menu__header">
                <span className="debug-fab-menu__title">Command</span>
                <button
                  className="debug-fab-menu__close"
                  onClick={() => { setInputMode(false); setInputVal('') }}
                  aria-label="Back to menu"
                >←</button>
              </div>
              <input
                ref={inputRef}
                className="debug-spotlight-input debug-fab-input"
                type="text"
                placeholder="debug …"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={handleInputKeyDown}
                aria-label="Debug command input"
                autoComplete="off"
                spellCheck={false}
              />
              <p className="debug-spotlight-hint">
                Type a command and press <code>Enter</code> — <code>Esc</code> to close
              </p>
            </div>
          ) : (
            /* ── Menu mode ── */
            // eslint-disable-next-line @ulam/palaman/no-menu-role-on-nav -- true command-palette app menu, not site navigation
            <div className="debug-fab-menu" style={posStyle} role="menu">
              <div className="debug-fab-menu__header">
                <span className="debug-fab-menu__title">Debug</span>
                <div className="debug-fab-menu__header-actions">
                  <button
                    className="debug-fab-menu__icon-btn"
                    onClick={() => setInputMode(true)}
                    aria-label="Open command input"
                    title="Type a command  (/)"
                  >
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <rect x="1.5" y="1.5" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    className="debug-fab-menu__close"
                    onClick={close}
                    aria-label="Close debug menu"
                  >✕</button>
                </div>
              </div>
              <div className="debug-fab-menu__body">
                {allSections.map(section => (
                  <div key={section.heading} className="debug-fab-menu__section">
                    <div className="debug-fab-menu__section-title">{section.heading}</div>
                    {/* eslint-disable @ulam/palaman/no-menu-role-on-nav -- true command-palette app menu */}
                    {section.rows.map(row => (
                      <button
                        key={row.cmd}
                        className="debug-fab-menu__row"
                        onClick={() => fire(row.cmd)}
                        role="menuitem"
                      >
                        <code className="debug-fab-menu__cmd">{row.cmd}</code>
                        <span className="debug-fab-menu__desc">{row.desc}</span>
                      </button>
                    ))}
                    {/* eslint-enable @ulam/palaman/no-menu-role-on-nav */}
                  </div>
                ))}
                <div className="debug-fab-menu__input-hint">
                  Press <kbd>/</kbd> to type a command
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
