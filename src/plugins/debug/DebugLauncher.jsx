import { useState, useRef, useEffect } from 'react'

const IS_DEV = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

// ─── Configuration ────────────────────────────────────────────────────────────
// Set ENABLED to true to show the floating debug button in this project.
// A11yTextHelper leaves it off — commands go in the search bar instead.
const ENABLED = false

// Where the FAB appears. Options:
//   'bottom-right'  'bottom-left'  'bottom-center'
//   'top-right'     'top-left'     'top-center'
//   'middle-right'  'middle-left'
const POSITION = 'bottom-right'
// ─────────────────────────────────────────────────────────────────────────────

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

/**
 * Floating debug launcher — FAB + spotlight-style command input.
 *
 * A circular floating button that opens a spotlight input for typing debug
 * commands. Useful for projects that don't have a built-in search or command
 * field. Looks like an accessibility overlay button but is dev-only.
 *
 * Configure ENABLED and POSITION at the top of this file, or pass them as props
 * to override the file-level defaults at mount time.
 *
 * Props:
 *   enabled    boolean            — override ENABLED constant (default: ENABLED)
 *   position   string             — override POSITION constant (default: POSITION)
 *   onCommand  fn(cmd) → boolean  — called when the user submits a command
 */
export function DebugLauncher({ enabled = ENABLED, position = POSITION, onCommand }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setValue('') // eslint-disable-line react-hooks/set-state-in-effect
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  if (!IS_DEV || !enabled) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    onCommand?.(value.trim())
    setOpen(false)
  }

  const posStyle = POSITION_STYLES[position] ?? POSITION_STYLES['bottom-right']

  return (
    <>
      {/* FAB */}
      <button
        className="debug-launcher-fab"
        style={posStyle}
        onClick={() => setOpen(o => !o)}
        aria-label="Open debug tool"
        title="Debug Tool"
      >
        {/* Hex-bolt icon — distinct from production UI icons */}
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
        <span className="debug-launcher-fab__label">debug tool</span>
      </button>

      {/* Spotlight */}
      {open && (
        <>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div className="debug-spotlight-overlay" onClick={() => setOpen(false)}>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className="debug-spotlight" onClick={e => e.stopPropagation()}>
            <div className="debug-spotlight-chrome">
              <span className="debug-spotlight-badge">
                <svg aria-hidden="true" width="11" height="11" viewBox="0 0 20 20" fill="none">
                  <polygon points="10,1 17.66,5.5 17.66,14.5 10,19 2.34,14.5 2.34,5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                  <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                Debug Tool
              </span>
              <button
                className="debug-spotlight-close"
                onClick={() => setOpen(false)}
                aria-label="Close debug tool"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                className="debug-spotlight-input"
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="debug help"
                autoComplete="off"
                spellCheck={false}
              />
            </form>
            <p className="debug-spotlight-hint">Type <code>help</code> to get started…</p>
          </div>
          </div>
        </>
      )}
    </>
  )
}
