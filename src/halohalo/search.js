import Fuse from 'fuse.js'

// ─── searchItems ──────────────────────────────────────────────────────────────
// Generic Fuse.js search over any corpus array.
// fields     — Fuse key/weight config: [{ name, weight }, ...]
// Returns simplified result objects containing only the requested fields.

export function searchItems(query, corpus, { fields, threshold = 0.4, minMatchCharLength = 2, limit = 3, pick } = {}) {
  if (!query?.trim() || !Array.isArray(corpus) || corpus.length === 0) return []

  const fuse = new Fuse(corpus, {
    keys: fields,
    threshold,
    minMatchCharLength,
    includeScore: true,
  })

  const results = fuse.search(query.trim()).slice(0, limit).map(r => r.item)

  if (pick) return results.map(item => Object.fromEntries(pick.map(k => [k, item[k]])))
  return results
}

// ─── makeSearchTool ───────────────────────────────────────────────────────────
// Builds an Anthropic tool-use schema + handler pair for a corpus search tool.
// The returned { schema, handler } can be passed directly to callAnthropicWithTools.
//
// options.name        — tool name (default: 'search_corpus')
// options.description — tool description string
// options.fields      — Fuse key/weight config
// options.pick        — fields to include in returned results
// options.limit       — max results (default: 3)

export function makeSearchTool(corpus, options = {}) {
  const {
    name = 'search_corpus',
    description = 'Search the corpus for entries related to a natural-language query.',
    queryDescription = 'Natural-language search query.',
    fields,
    pick,
    limit = 3,
    threshold,
    minMatchCharLength,
  } = options

  const schema = {
    name,
    description,
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: queryDescription },
      },
      required: ['query'],
    },
  }

  function handler(_toolName, input) {
    return searchItems(input?.query ?? '', corpus, { fields, pick, limit, threshold, minMatchCharLength })
  }

  return { schema, handler }
}
