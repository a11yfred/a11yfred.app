import Fuse from 'fuse.js'
import { applyOverride } from './userOverridesService.js'
import {
  DEFAULT_RATING, MAX_SEARCH_ALL, MAX_SEARCH_RESULTS, SEARCH_PERF_WARN_MS,
  RATING_SCORE_WEIGHT, SEVERITY_SORT_ORDER, WCAG_VERSION_ORDER, WCAG_LEVEL_ORDER,
  SORT_MISSING_ORDER, DEFAULT_WCAG_FILTER,
} from '../utils/constants.js'

const FUSE_OPTIONS = {
  keys: [
    { name: 'title',     weight: 0.40 },
    { name: '_title_en', weight: 0.30 },
    { name: 'keywords',  weight: 0.15 },
    { name: 'desc',      weight: 0.10 },
    { name: 'fix',       weight: 0.05 },
  ],
  threshold: 0.3,
  minMatchCharLength: 3,
  includeScore: true,
}

// Parse boolean search operators: +term (required), -term (excluded)
function parseSearchQuery(query) {
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
 * Merges corpus entries with user overrides and user-created entries.
 *
 * @param {Array} corpusEntries
 * @param {string} locale
 * @param {Object} userOverrides
 * @param {Array} userEntries
 * @returns {Array}
 */
export function mergeEntries(corpusEntries, locale, userOverrides = {}, userEntries = []) {
  const hasOverrides = Object.keys(userOverrides).length > 0
  const corpus = hasOverrides
    ? corpusEntries.map(f => applyOverride(f, locale, userOverrides))
    : corpusEntries
  return userEntries.length ? [...corpus, ...userEntries] : corpus
}

/**
 * Filters entries by platform.
 *
 * @param {Array} entries
 * @param {string} platform - 'all' | 'web' | 'native' | 'document'
 * @returns {Array}
 */
export function filterByPlatform(entries, platform) {
  if (!platform || platform === 'all') return entries
  return entries.filter(d => !d.platform || d.platform === platform)
}

/**
 * Filters entries by WCAG version and level ceiling.
 * AAA has the most SC, AA has fewer, A has the fewest.
 * AAA is the least restrictive and never filters results.
 *
 * @param {Array} entries
 * @param {{ maxVersion: string, maxLevel: string }} wcagFilter
 * @returns {Array}
 */
export function filterByWcag(entries, wcagFilter = DEFAULT_WCAG_FILTER) {
  const { maxVersion = '2.2', maxLevel = 'AA' } = wcagFilter ?? {}
  const vMax = WCAG_VERSION_ORDER[maxVersion] ?? 2
  const lMax = WCAG_LEVEL_ORDER[maxLevel] ?? 1
  // AAA (level 2) has the most SC, so it includes all results; no filtering needed
  if (vMax === 2 && lMax === 2) return entries
  return entries.filter(f => {
    if (f.wcagVersion && (WCAG_VERSION_ORDER[f.wcagVersion] ?? 0) > vMax) return false
    if (f.wcagLevel  && (WCAG_LEVEL_ORDER[f.wcagLevel]   ?? 0) > lMax) return false
    return true
  })
}

/**
 * Sorts entries by archived → starred → severity → primarySC,
 * weighted by user ratings.
 *
 * @param {Array} entries
 * @param {Object} ratings - map of entry id → { score, starred, archived }
 * @returns {Array} new sorted array
 */
export function sortEntries(entries, ratings = {}) {
  return [...entries].sort((a, b) => {
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
 * pre-filtered entries array.
 *
 * @param {Array} entries - already platform/WCAG filtered
 * @param {string} query
 * @param {Object} ratings
 * @param {number} [searchKey=0] - unused at this layer; kept so callers can
 *   pass it through for memoisation keys without needing to strip it
 * @returns {Array} up to MAX_SEARCH_RESULTS entry objects
 */
let cachedFuse = null
let cachedEntries = null

export function searchEntries(entries, query, ratings = {}, _searchKey = 0) {
  if (!query || query.trim().length < 2) return []

  const { baseQuery, required, excluded } = parseSearchQuery(query)
  if (cachedEntries !== entries || !cachedFuse) {
    cachedFuse = new Fuse(entries, FUSE_OPTIONS)
    cachedEntries = entries
  }
  const fuse = cachedFuse

  const t0 = performance.now()
  const searchTerm = baseQuery || query.trim()
  const raw = fuse.search(searchTerm).slice(0, MAX_SEARCH_ALL)
  const elapsed = performance.now() - t0
  if (import.meta.env.DEV && elapsed > SEARCH_PERF_WARN_MS) {
    console.warn(`[searchEntries] search took ${elapsed.toFixed(1)}ms for "${query}" over ${entries.length} entries`)
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
