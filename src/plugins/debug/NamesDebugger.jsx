import { useState, useEffect } from 'react'

const IS_DEV = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

function getAccessibleName(el) {
  const tag = el.tagName.toUpperCase()

  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) return { name: ariaLabel.trim(), source: 'aria-label' }

  const labelledBy = el.getAttribute('aria-labelledby')
  if (labelledBy) {
    const text = labelledBy.split(/\s+/).filter(Boolean)
      .map(id => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean).join(' ')
    if (text) return { name: text, source: 'aria-labelledby' }
  }

  if (tag === 'IMG') {
    const alt = el.getAttribute('alt')
    if (alt !== null) return { name: alt || '(empty)', source: 'alt' }
    return { name: '(no alt)', source: 'missing' }
  }

  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) {
    if (el.id) {
      const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
      if (label) return { name: label.textContent.trim(), source: 'label[for]' }
    }
    const parentLabel = el.closest('label')
    if (parentLabel) {
      const clone = parentLabel.cloneNode(true)
      clone.querySelector('input,select,textarea')?.remove()
      const text = clone.textContent.trim()
      if (text) return { name: text, source: 'parent label' }
    }
    const placeholder = el.getAttribute('placeholder')
    if (placeholder) return { name: placeholder, source: 'placeholder' }
    const ariaDescribedBy = el.getAttribute('aria-describedby')
    if (ariaDescribedBy) {
      const text = document.getElementById(ariaDescribedBy)?.textContent?.trim()
      if (text) return { name: text, source: 'aria-describedby' }
    }
    return { name: '(no label)', source: 'missing' }
  }

  const title = el.getAttribute('title')
  if (title) return { name: title.trim(), source: 'title' }

  const text = el.textContent?.trim().replace(/\s+/g, ' ')
  if (text) {
    return { name: text.length > 60 ? text.slice(0, 60) + '…' : text, source: 'text content' }
  }

  return { name: '(none)', source: 'none' }
}

/**
 * On hover, shows a tooltip at the cursor with the accessible name of the
 * element under the pointer and the source that provides the name.
 * Dev-only. Renders nothing in production.
 *
 * Props:
 *   enabled  boolean  — set false to hide (e.g. after "debug names off")
 */
export function NamesDebugger({ enabled = true }) {
  const [tooltip, setTooltip] = useState(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!IS_DEV) return

    const handleMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
    }

    const handleOver = (e) => {
      const el = e.target
      if (!el || el === document.body || el === document.documentElement) {
        setTooltip(null)
        return
      }
      const { name, source } = getAccessibleName(el)
      setTooltip({ name, source })
    }

    const handleOut = () => setTooltip(null)

    document.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseleave', handleOut)
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseleave', handleOut)
    }
  }, [])

  if (!IS_DEV || !enabled || !tooltip) return null

  const LEFT_OFFSET = 14
  const TOP_OFFSET = 20
  const style = {
    left: pos.x + LEFT_OFFSET,
    top:  pos.y + TOP_OFFSET,
  }

  return (
    <div className="names-tooltip" style={style} aria-hidden="true">
      <span className="names-tooltip__source">{tooltip.source}</span>
      <span className="names-tooltip__name">{tooltip.name}</span>
    </div>
  )
}
