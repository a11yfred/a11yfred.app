import Fuse from 'fuse.js'
import { applyOverride } from './userOverridesService.js'
import {
  DEFAULT_RATING, MAX_SEARCH_ALL, MAX_SEARCH_RESULTS, SEARCH_PERF_WARN_MS,
  RATING_SCORE_WEIGHT, SEVERITY_SORT_ORDER, WCAG_VERSION_ORDER, WCAG_LEVEL_ORDER,
  SORT_MISSING_ORDER, DEFAULT_WCAG_FILTER,
} from '../utils/constants.js'

const FUSE_OPTIONS = {
  keys: [
    { name: 'title',     weight: 0.28 },
    { name: '_title_en', weight: 0.24 },
    { name: 'keywords',  weight: 0.20 },
    { name: 'desc',      weight: 0.18 },
    { name: 'fix',       weight: 0.10 },
  ],
  threshold: 0.4,
  minMatchCharLength: 2,
  includeScore: true,
}

// Parse boolean search operators: +term (required), -term (excluded)
export function parseSearchQuery(query) {
  const trimmed = query.trim()
  const required = []
  const excluded = []
  const opPattern = /([+-])(\S+)/g
  let match
  while ((match = opPattern.exec(trimmed)) !== null) {
    if (match[1] === '+') required.push(match[2])
    else excluded.push(match[2])
  }
  const baseQuery = trimmed.replace(/[+-]\S+/g, '').trim()
  return { baseQuery, required, excluded }
}

/**
 * Merges corpus findings with user overrides and user-created findings.
 *
 * @param {Array} corpusFindings
 * @param {string} locale
 * @param {Object} userOverrides
 * @param {Array} userFindings
 * @returns {Array}
 */
export function mergeFindings(corpusFindings, locale, userOverrides = {}, userFindings = []) {
  const hasOverrides = Object.keys(userOverrides).length > 0
  const corpus = hasOverrides
    ? corpusFindings.map(f => applyOverride(f, locale, userOverrides))
    : corpusFindings
  return userFindings.length ? [...corpus, ...userFindings] : corpus
}

/**
 * Filters findings by platform.
 *
 * @param {Array} findings
 * @param {string} platform - 'all' | 'web' | 'native' | 'document'
 * @returns {Array}
 */
export function filterByPlatform(findings, platform) {
  if (!platform || platform === 'all') return findings
  return findings.filter(d => !d.platform || d.platform === platform)
}

/**
 * Filters findings by WCAG version and level ceiling.
 *
 * @param {Array} findings
 * @param {{ maxVersion: string, maxLevel: string }} wcagFilter
 * @returns {Array}
 */
export function filterByWcag(findings, wcagFilter = DEFAULT_WCAG_FILTER) {
  const { maxVersion = '2.2', maxLevel = 'AA' } = wcagFilter ?? {}
  const vMax = WCAG_VERSION_ORDER[maxVersion] ?? 2
  const lMax = WCAG_LEVEL_ORDER[maxLevel] ?? 1
  if (vMax === 2 && lMax >= 1) return findings
  return findings.filter(f => {
    if (f.wcagVersion && (WCAG_VERSION_ORDER[f.wcagVersion] ?? 0) > vMax) return false
    if (f.wcagLevel  && (WCAG_LEVEL_ORDER[f.wcagLevel]   ?? 0) > lMax) return false
    return true
  })
}

/**
 * Sorts findings by archived → starred → severity → primarySC,
 * weighted by user ratings.
 *
 * @param {Array} findings
 * @param {Object} ratings - map of finding id → { score, starred, archived }
 * @returns {Array} new sorted array
 */
export function sortFindings(findings, ratings = {}) {
  return [...findings].sort((a, b) => {
    const ra = ratings[a.id] || DEFAULT_RATING
    const rb = ratings[b.id] || DEFAULT_RATING
    if (ra.archived !== rb.archived) return ra.archived ? 1 : -1
    if (ra.starred !== rb.starred) return ra.starred ? -1 : 1
    const sa = SEVERITY_SORT_ORDER[a.severity] ?? SORT_MISSING_ORDER
    const sb = SEVERITY_SORT_ORDER[b.severity] ?? SORT_MISSING_ORDER
    if (sa !== sb) return sa - sb
    return (a.primarySC ?? '').localeCompare(b.primarySC ?? '')
  })
}

/**
 * Runs fuzzy search + boolean filtering + rating-weighted sort over a
 * pre-filtered findings array.
 *
 * @param {Array} findings - already platform/WCAG filtered
 * @param {string} query
 * @param {Object} ratings
 * @param {number} [searchKey=0] - unused at this layer; kept so callers can
 *   pass it through for memoisation keys without needing to strip it
 * @returns {Array} up to MAX_SEARCH_RESULTS finding objects
 */
export function searchFindings(findings, query, ratings = {}, _searchKey = 0) {
  if (!query || query.trim().length < 2) return []

  const { baseQuery, required, excluded } = parseSearchQuery(query)
  const fuse = new Fuse(findings, FUSE_OPTIONS)

  const t0 = performance.now()
  const searchTerm = baseQuery || query.trim()
  const raw = fuse.search(searchTerm).slice(0, MAX_SEARCH_ALL)
  const elapsed = performance.now() - t0
  if (import.meta.env.DEV && elapsed > SEARCH_PERF_WARN_MS) {
    console.warn(`[searchFindings] search took ${elapsed.toFixed(1)}ms for "${query}" over ${findings.length} entries`)
  }

  return raw
    .filter(r => {
      const text = [r.item.title, r.item.desc, r.item.fix, (r.item.keywords || []).join(' ')]
        .join(' ').toLowerCase()
      for (const term of required) {
        if (!text.includes(term.toLowerCase())) return false
      }
      for (const term of excluded) {
        if (text.includes(term.toLowerCase())) return false
      }
      return true
    })
    .sort((a, b) => {
      const ra = ratings[a.item.id] || DEFAULT_RATING
      const rb = ratings[b.item.id] || DEFAULT_RATING
      if (ra.archived !== rb.archived) return ra.archived ? 1 : -1
      if (ra.starred !== rb.starred) return ra.starred ? -1 : 1
      const adjA = (a.score ?? 1) - (ra.score * RATING_SCORE_WEIGHT)
      const adjB = (b.score ?? 1) - (rb.score * RATING_SCORE_WEIGHT)
      return adjA - adjB
    })
    .slice(0, MAX_SEARCH_RESULTS)
    .map(r => r.item)
}
