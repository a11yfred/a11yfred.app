import { _subscribe } from '../taho/announce.js'

const IS_DEV = import.meta.env.DEV

/**
 * Vanilla dev-mode announcer toast — no React required.
 * Creates a DOM node that shows screen reader announcements as a visible toast.
 * Returns a destroy() function.
 *
 * In production (IS_DEV = false) this is a no-op that returns { destroy() {} }.
 */
export function mountAnnouncer({ enabled = true } = {}) {
  if (!IS_DEV) return { destroy() {} }

  const el = document.createElement('div')
  el.className = 'announce-toast announce-toast--hidden'
  el.setAttribute('aria-hidden', 'true')
  document.body.appendChild(el)

  let timer = null
  let fadeTimer = null
  let isEnabled = enabled

  const unsub = _subscribe((message, priority) => {
    if (!isEnabled) return

    clearTimeout(timer)
    clearTimeout(fadeTimer)

    el.className = `announce-toast announce-toast--${priority}`
    el.innerHTML = `<span class="announce-toast__badge">${priority}</span>${message}`

    timer = setTimeout(() => {
      el.classList.add('announce-toast--fading')
      fadeTimer = setTimeout(() => {
        el.className = 'announce-toast announce-toast--hidden'
        el.innerHTML = ''
      }, 400)
    }, 3600)
  })

  return {
    setEnabled(value) { isEnabled = value },
    destroy() {
      unsub()
      clearTimeout(timer)
      clearTimeout(fadeTimer)
      el.remove()
    },
  }
}
