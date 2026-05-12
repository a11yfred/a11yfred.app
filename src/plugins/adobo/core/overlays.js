// Known a11y overlay script signatures — src substrings and global variable names.
// Source: overlayfactsheet.com / overlay-fact-sheet vendor list.
export const OVERLAY_SIGNATURES = [
  { name: 'accessiBe',       src: 'acsbapp.com',          global: 'acsbJS' },
  { name: 'AudioEye',        src: 'audioeye.com',          global: 'AudioEye' },
  { name: 'UserWay',         src: 'userway.org',           global: 'UserWay' },
  { name: 'EqualWeb',        src: 'equalweb.com',          global: 'EqualWeb' },
  { name: 'MaxAccess',       src: 'maxaccess.io',          global: 'MaxAccess' },
  { name: 'Recite Me',       src: 'reciteme.com',          global: 'ReciteMe' },
  { name: 'ADA Site Comply', src: 'adasitecompliance.com', global: null },
  { name: 'Accessflow',      src: 'accessflow.ai',         global: null },
  { name: 'Ally',            src: 'allytechno.com',        global: null },
  { name: 'Enabler',         src: 'wcag.io',               global: null },
]

/**
 * Scans the current page for known a11y overlay scripts.
 * Checks both script[src] attributes and injected global variables.
 *
 * @returns {string[]} Names of detected overlays
 */
export function detectOverlays(signatures = OVERLAY_SIGNATURES) {
  const found = []
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  for (const sig of signatures) {
    const bySrc = scripts.some(s => s.src.includes(sig.src))
    const byGlobal = sig.global && typeof window[sig.global] !== 'undefined'
    if (bySrc || byGlobal) found.push(sig.name)
  }
  return found
}
