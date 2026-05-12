import en from './en.json'
import enGB from './en-GB.json'
import enAU from './en-AU.json'
import enIN from './en-IN.json'
import enZA from './en-ZA.json'
import es from './es.json'
import esES from './es-ES.json'
import esPH from './es-PH.json'
import fr from './fr.json'
import frCA from './fr-CA.json'
import de from './de.json'
import nl from './nl.json'
import sv from './sv.json'
import pt from './pt.json'
import ptBR from './pt-BR.json'
import af from './af.json'
import zh from './zh.json'
import ja from './ja.json'
import ko from './ko.json'
import yue from './yue.json'
import bo from './bo.json'
import tl from './tl.json'
import vi from './vi.json'
import hi from './hi.json'
import ta from './ta.json'
import haw from './haw.json'
import ht from './ht.json'
import eu from './eu.json'
import mi from './mi.json'
import gn from './gn.json'
import qu from './qu.json'
import nah from './nah.json'
import nv from './nv.json'
import iu from './iu.json'
import cr from './cr.json'
import oj from './oj.json'
import ceb from './ceb.json'
import ilo from './ilo.json'
import cbk from './cbk.json'
import ug from './ug.json'
import arPS from './ar-PS.json'
import zgh from './zgh.json'
import rhg from './rhg.json'
import crh from './crh.json'
import eo from './eo.json'
import pjt from './pjt.json'
import pig from './pig.json'
import pir from './pir.json'
import tlh from './tlh.json'
import val from './val.json'
import blt from './blt.json'
import dot from './dot.json'
import tok from './tok.json'
import nav from './nav.json'
import qya from './qya.json'
import sjn from './sjn.json'
import hod from './hod.json'
import dov from './dov.json'
import nds from './nds.json'
import nws from './nws.json'
import mnd from './mnd.json'
import csp from './csp.json'
import sim from './sim.json'
import ali from './ali.json'

const MESSAGES = {
  en,
  'en-GB': enGB, 'en-AU': enAU, 'en-IN': enIN, 'en-ZA': enZA,
  es, 'es-ES': esES, 'es-PH': esPH,
  fr, 'fr-CA': frCA,
  de, nl, sv,
  pt, 'pt-BR': ptBR,
  af,
  zh, ja, ko, yue, bo,
  tl, vi, hi, ta,
  haw, ht, eu, mi,
  gn, qu, nah, nv, iu, cr, oj,
  ceb, ilo, cbk,
  ug, 'ar-PS': arPS, zgh, rhg, crh,
  eo, pjt,
  pig, pir, tlh, val, blt, dot, tok, nav, qya, sjn, hod,
  dov, nds, nws, mnd, csp, sim, ali,
}

// ─── Module singleton ─────────────────────────────────────────────────────────

let _t = _makeT('en')
const _listeners = new Set()

function _makeT(locale) {
  const msgs = MESSAGES[locale] ?? MESSAGES[locale?.split('-')[0]] ?? MESSAGES.en
  return (key, vars) => {
    let str = (msgs[key] != null && msgs[key] !== '') ? msgs[key] : (MESSAGES.en[key] ?? key)
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => { str = str.replaceAll(`{${k}}`, String(v)) })
    }
    return str
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Set the active locale. All subscribers are notified.
 * Call once at app init and again when the user changes language.
 *
 * @param {string} locale - BCP 47 locale code (e.g. 'en', 'fr', 'tl')
 */
export function setLocale(locale) {
  _t = _makeT(locale)
  _listeners.forEach(fn => fn(_t))
}

/**
 * Returns the current translate function synchronously.
 * Use outside React — in services, event handlers, vanilla JS.
 *
 * @returns {(key: string, vars?: Record<string, string>) => string}
 */
export function getT() {
  return _t
}

/**
 * Subscribe to locale changes. Returns an unsubscribe function.
 * Used internally by the React shim to re-render on locale change.
 *
 * @internal
 * @param {(t: Function) => void} fn
 * @returns {() => void} unsubscribe
 */
export function _subscribe(fn) {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}

export { getPref, setPref } from './pref.js'
export { isSignificantlyChanged } from './textComparison.js'
