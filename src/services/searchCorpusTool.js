/**
 * searchCorpusTool.js
 *
 * Anthropic tool-use schema and handler for the `search_corpus` tool.
 * Runs a Fuse.js search over a provided corpus array — no React hooks,
 * safe to call from a plain async function in agenticAiService.js.
 */

import Fuse from 'fuse.js'

export const SEARCH_CORPUS_TOOL_SCHEMA = {
  name: 'search_corpus',
  description:
    'Search the accessibility finding corpus for entries related to a natural-language query. ' +
    'Call this before rewriting to find similar findings that demonstrate the expected voice, ' +
    'tone, and technical depth. Returns up to 3 matching entries.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Natural-language search query, e.g. "keyboard focus visible" or "color contrast low vision".',
      },
    },
    required: ['query'],
  },
}

const FUSE_OPTIONS = {
  keys: [
    { name: 'title',    weight: 0.32 },
    { name: 'keywords', weight: 0.30 },
    { name: 'desc',     weight: 0.07 },
    { name: 'rem',      weight: 0.03 },
  ],
  threshold: 0.4,
  minMatchCharLength: 2,
}

/**
 * Run a Fuse.js search over the provided corpus and return simplified result objects.
 *
 * @param {string} query
 * @param {object[]} corpus — full corpus array
 * @param {number} [limit=3]
 * @returns {{ id, title, scLabel, priority, desc, rem }[]}
 */
export function searchCorpus(query, corpus, limit = 3) {
  if (!query?.trim() || !Array.isArray(corpus) || corpus.length === 0) return []
  const fuse = new Fuse(corpus, FUSE_OPTIONS)
  return fuse
    .search(query.trim())
    .slice(0, limit)
    .map(r => ({
      id:       r.item.id,
      title:    r.item.title,
      scLabel:  r.item.scLabel,
      priority: r.item.priority,
      desc:     r.item.desc,
      rem:      r.item.rem,
    }))
}
