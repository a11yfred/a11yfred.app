/**
 * Vanilla DOM live region announcer.
 *
 * announce() can be called from anywhere — event handlers, async callbacks,
 * service files, outside the React tree — with no setup required. The live
 * region DOM nodes are created lazily on the first call and persist for the
 * lifetime of the page.
 *
 * The optional <Announcer /> React component (@ulam/taho-bayabas) provides a
 * dev-mode toast overlay that makes announcements visible during development.
 * It does not drive the actual screen reader announcements — this module does.
 *
 * Adapted from adobe/react-spectrum @react-aria/live-announcer.
 * Copyright 2020 Adobe. All rights reserved. Apache-2.0.
 * Key adaptation: pub/sub layer so the dev toast can subscribe without
 * owning the live region; clear-then-repopulate timing preserved from
 * original implementation.
 */

// ─── DOM live region ──────────────────────────────────────────────────────────

let _politeEl = null
let _assertiveEl = null
let _initialized = false

function _init() {
  if (_initialized || typeof document === 'undefined') return
  _initialized = true

  const container = document.createElement('div')
  container.dataset.announcer = ''
  Object.assign(container.style, {
    border: 0,
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px',
    whiteSpace: 'nowrap',
  })

  _politeEl = document.createElement('div')
  _politeEl.setAttribute('role', 'status')
  _politeEl.setAttribute('aria-live', 'polite')
  _politeEl.setAttribute('aria-atomic', 'true')

  _assertiveEl = document.createElement('div')
  _assertiveEl.setAttribute('role', 'alert')
  _assertiveEl.setAttribute('aria-live', 'assertive')
  _assertiveEl.setAttribute('aria-atomic', 'true')

  container.appendChild(_politeEl)
  container.appendChild(_assertiveEl)
  document.body.prepend(container)
}

// Timers for the clear-then-repopulate pattern
let _politeTimer = null
let _assertiveTimer = null

function _set(el, message, clearDelay) {
  if (!el) return
  el.textContent = ''
  clearTimeout(el === _assertiveEl ? _assertiveTimer : _politeTimer)

  // 100ms: minimum delay before announcing into a dynamically-added live
  // region. Delays < 100ms are inconsistent in Safari + VoiceOver.
  // Documented in adobe/react-spectrum @react-aria/live-announcer.
  const timer = setTimeout(() => {
    el.textContent = message
    const hold = setTimeout(() => { el.textContent = '' }, clearDelay)
    if (el === _assertiveEl) _assertiveTimer = hold
    else _politeTimer = hold
  }, 100)

  if (el === _assertiveEl) _assertiveTimer = timer
  else _politeTimer = timer
}

// ─── Pub/sub for dev toast ────────────────────────────────────────────────────

const _listeners = new Set()

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Push a message into the page's ARIA live region.
 *
 * @param {string} message
 * @param {object} [options]
 * @param {'polite' | 'assertive'} [options.priority='polite']
 *   'polite'    — waits for a natural pause before reading. Default. Use for
 *                 status updates, confirmations, background notifications.
 *   'assertive' — interrupts the screen reader immediately. Use only for
 *                 time-critical errors the user must act on right now.
 * @param {boolean} [options.alert=false]
 *   Explicitly route the message through role="alert" (same DOM node as
 *   priority:'assertive'). Use when semantics matter — e.g. a form validation
 *   summary that should be recognised as an alert by ATs, not just a loud
 *   live region. Implies assertive interruption.
 *
 *   ⚠ Use alert sparingly. It interrupts whatever the screen reader is
 *   currently reading. Overuse desensitises users. Prefer priority:'polite'
 *   for anything that is not a genuine error or time-sensitive warning.
 */
export function announce(message, { priority = 'polite', alert = false } = {}) {
  _init()

  const useAssertive = priority === 'assertive' || alert

  if (useAssertive) {
    // Longer hold: 50ms per character, min 2500ms, so screen readers finish
    // reading before the DOM text is cleared.
    _set(_assertiveEl, message, Math.max(2500, message.length * 50))
  } else {
    _set(_politeEl, message, 1000)
  }

  const resolvedPriority = useAssertive ? 'assertive' : 'polite'
  _listeners.forEach(fn => fn(message, resolvedPriority))
}

/**
 * Clear the live region immediately (both politeness levels).
 * Useful before navigating away or when a queued announcement is no longer relevant.
 */
export function clearAnnouncements() {
  if (_politeEl) { clearTimeout(_politeTimer); _politeEl.textContent = '' }
  if (_assertiveEl) { clearTimeout(_assertiveTimer); _assertiveEl.textContent = '' }
}

/** @internal — used only by taho-bayabas Announcer dev toast */
export function _subscribe(fn) {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}
