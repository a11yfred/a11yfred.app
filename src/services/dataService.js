/**
 * dataService.js
 *
 * Phase 1: reads from local JSON file, with locale-specific overlay for
 * translated title/desc/rem. English keywords are always preserved on the
 * merged record so cross-language search works (e.g. typing "button" in the
 * Japanese locale still finds ATH-001).
 *
 * Phase 2 (Supabase): replace the body of getFindings() with a Supabase query.
 * Add getUserFindings() to load the user's custom entries from Supabase.
 * No other file needs to change.
 */

import corpusData from '../data/personal-corpus.json'

// Raw overlay data cache — avoids re-fetching the same JSON module
const overlayCache = {}

// Fully-merged results cache — avoids re-mapping corpusData on every locale switch
const mergedCache = {}

// Closest-match fallbacks for locales that share a translation overlay.
// Add entries here when a locale lacks its own overlay but is close enough
// to an existing one. Separate from the base-language fallback chain.
const OVERLAY_FALLBACKS = {
  pt: 'pt-BR',   // Portuguese Portugal → Brazilian Portuguese
}

async function loadOverlay(locale) {
  if (locale in overlayCache) return overlayCache[locale]
  try {
    const mod = await import(`../data/translations/${locale}.json`)
    overlayCache[locale] = mod.default
    return mod.default
  } catch {
    overlayCache[locale] = null
    return null
  }
}

export async function getFindings(locale = 'en') {
  // All English variants use the corpus directly — no overlay needed
  if (!locale || locale.startsWith('en')) return corpusData

  // Return cached merged result if already computed for this locale
  if (locale in mergedCache) return mergedCache[locale]

  const base = locale.split('-')[0]

  // Try: exact locale → base language → named fallback → English
  let overlay = await loadOverlay(locale)
  if (!overlay && base !== locale)         overlay = await loadOverlay(base)
  if (!overlay && OVERLAY_FALLBACKS[base]) overlay = await loadOverlay(OVERLAY_FALLBACKS[base])
  if (!overlay) return corpusData

  const merged = corpusData.map(entry => {
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

  mergedCache[locale] = merged
  return merged
}

/**
 * Phase 2 stub — returns the signed-in user's custom finding entries.
 *
 * Custom entries use the same schema as corpus.json but with IDs like "USR-001".
 * They are stored in the Supabase `user_findings` table with RLS so only the
 * owner can read/write them.
 *
 * To activate:
 *   import { supabase } from './supabaseClient'
 *   const { data, error } = await supabase
 *     .from('user_findings')
 *     .select('*')
 *     .order('created_at', { ascending: false })
 *   if (error) throw error
 *   return data
 *
 * Usage — combine with getFindings() for a merged search set:
 *   const [public, custom] = await Promise.all([getFindings(locale), getUserFindings(userId)])
 *   const all = [...public, ...custom]
 */
export async function getUserFindings(_userId) {
  return []
}

/**
 * Phase 2 stub — saves or updates a user's custom finding entry.
 *
 * To activate:
 *   const { error } = await supabase
 *     .from('user_findings')
 *     .upsert({ ...finding, user_id: userId, updated_at: new Date().toISOString() })
 *   if (error) throw error
 */
export async function saveUserFinding(_userId, _finding) {
  throw new Error('User findings not yet implemented — see dataService.js Phase 2 comments')
}

/**
 * Phase 2 stub — deletes a user's custom finding entry.
 *
 * To activate:
 *   const { error } = await supabase
 *     .from('user_findings')
 *     .delete()
 *     .eq('id', findingId)
 *     .eq('user_id', userId)
 *   if (error) throw error
 */
export async function deleteUserFinding(_userId, _findingId) {
  throw new Error('User findings not yet implemented — see dataService.js Phase 2 comments')
}

/**
 * Phase 2 stub — syncs non-sensitive settings to Supabase for cross-device restore.
 * API keys are intentionally excluded and remain localStorage-only.
 *
 * To activate:
 *   const { error } = await supabase
 *     .from('user_settings')
 *     .upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() })
 *   if (error) throw error
 */
export async function syncSettings(_userId, _settings) {
  return null
}

/**
 * Phase 2 stub — retrieves synced settings for a signed-in user.
 * Returns null if not found (falls back to localStorage values in App.jsx).
 *
 * To activate:
 *   const { data } = await supabase
 *     .from('user_settings')
 *     .select('*')
 *     .eq('user_id', userId)
 *     .single()
 *   return data
 */
export async function getRemoteSettings(_userId) {
  return null
}
