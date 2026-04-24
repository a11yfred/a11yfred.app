/**
 * dataService.js
 *
 * Phase 1: reads from local JSON file.
 * Phase 2 (Supabase): replace the body of getDefects() with a Supabase query.
 * No other file needs to change.
 *
 * Supabase migration stub:
 *
 *   import { createClient } from '@supabase/supabase-js'
 *   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
 *
 *   export async function getDefects() {
 *     const { data, error } = await supabase.from('defects').select('*')
 *     if (error) throw error
 *     return data
 *   }
 */

import corpusData from '../data/mikeys-corpus.json'

export async function getDefects() {
  // Simulate async to make Supabase migration a drop-in swap
  return Promise.resolve(corpusData)
}
