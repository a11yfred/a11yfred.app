/**
 * dataService.js
 *
 * Phase 1: reads from local JSON file, with locale-specific overlay for
 * translated title/desc/rem. English keywords are always preserved on the
 * merged record so cross-language search works (e.g. typing "button" in the
 * Japanese locale still finds ATH-001).
 *
 * Phase 2 (Supabase): replace the body of getDefects() with a Supabase query.
 * No other file needs to change.
 */

import corpusData from '../data/corpus.json'

const translationCache = {}

async function loadTranslation(locale) {
  if (locale in translationCache) return translationCache[locale]
  try {
    const mod = await import(`../data/translations/${locale}.json`)
    translationCache[locale] = mod.default
    return mod.default
  } catch {
    translationCache[locale] = null
    return null
  }
}

export async function getDefects(locale = 'en') {
  if (!locale || locale === 'en') return corpusData

  const base = locale.split('-')[0]
  let overlay = await loadTranslation(locale)
  if (!overlay && base !== locale) overlay = await loadTranslation(base)
  if (!overlay) return corpusData

  return corpusData.map(entry => {
    const t = overlay[entry.id]
    if (!t) return { ...entry, _title_en: entry.title }
    return {
      ...entry,
      title:     t.title || entry.title,
      desc:      t.desc  || entry.desc,
      rem:       t.rem   || entry.rem,
      _title_en: entry.title,   // preserved for cross-language Fuse search
    }
  })
}
