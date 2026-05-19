import { useEffect } from 'react'

/**
 * Ko-fi floating donation widget with accessibility patches.
 *
 * Currently disabled, re-enable by importing and rendering <KofiWidget />
 * in App.jsx inside the <Router> wrapper.
 *
 * The widget is a third-party script that injects its own DOM. This
 * component loads the script and then watches via MutationObserver for
 * the widget to mount, patching it with:
 *   - aria-label on the trigger button
 *   - role="dialog" + aria-modal="true" + focus trap on the overlay panel
 *   - title on the iframe
 *   - visible labels for inputs that only have placeholder text
 *   - Escape key handler to close the panel and restore focus
 */
export default function WidgetKofi() {
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
