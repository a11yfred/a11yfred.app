import { useState, useEffect } from 'react'

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
 * Floating debug launcher — pill FAB that opens a clickable command menu.
 *
 * Props:
 *   enabled         boolean                    — override ENABLED constant
 *   position        string                     — override POSITION constant
 *   onCommand       fn(cmd) → boolean          — called when a command button is clicked
 *   customSections  [{ heading, rows: [{cmd, desc}] }]  — project-specific command groups
 */
export function DebugLauncher({ enabled = ENABLED, position = POSITION, onCommand, customSections = [] }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  if (!IS_DEV || !enabled) return null

  const posStyle = POSITION_STYLES[position] ?? POSITION_STYLES['bottom-right']
  const allSections = [...STANDARD_SECTIONS, ...customSections]

  function fire(cmd) {
    onCommand?.(cmd)
    setOpen(false)
  }

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
          <div className="debug-fab-menu-backdrop" onClick={() => setOpen(false)} />
          <div className="debug-fab-menu" style={posStyle} role="menu">
            <div className="debug-fab-menu__header">
              <span className="debug-fab-menu__title">Debug</span>
              <button
                className="debug-fab-menu__close"
                onClick={() => setOpen(false)}
                aria-label="Close debug menu"
              >✕</button>
            </div>
            <div className="debug-fab-menu__body">
              {allSections.map(section => (
                <div key={section.heading} className="debug-fab-menu__section">
                  <div className="debug-fab-menu__section-title">{section.heading}</div>
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
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
