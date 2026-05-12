import { callAnthropicWithTools } from './fetch.js'
import { makeSearchTool } from './search.js'
import { getAdapter } from '../sawsawan/platformAdapter.js'
import { AI_AGENTIC_MAX_TOKENS, AGENTIC_MAX_TOOL_TURNS, LS_APIKEY_PREFIX } from './constants.js'
import { getAiModel } from './prefs.js'
import { parseAiResponse } from './aiService.js'
import { getSystemPrompt } from './init.js'

export { AiApiError } from './providers.js'

const FALLBACK_SYSTEM_PROMPT = `You are an AI assistant helping rewrite text entries based on user notes. Search for related entries before rewriting, then produce a revised description and suggested fix.

Format your final output as exactly two lines:
Description: [rewritten description]
Suggested Fix: [rewritten suggested fix]`

const CORPUS_SEARCH_FIELDS = [
  { name: 'title',    weight: 0.32 },
  { name: 'keywords', weight: 0.30 },
  { name: 'desc',     weight: 0.07 },
  { name: 'fix',      weight: 0.03 },
]

const CORPUS_PICK = ['id', 'title', 'primarySC', 'severity', 'desc', 'fix']

export async function getAgenticRefinement({ finding, descText, fixText, note, corpus }) {
  const key = await getAdapter().getKey(`${LS_APIKEY_PREFIX}anthropic`)

  if (!key) throw new Error('Anthropic API key required for agentic mode. Add one in Settings → AI Assist.')

  const model = getAiModel('anthropic')

  const { schema: toolSchema, handler: toolHandler } = makeSearchTool(corpus, {
    name: 'search_corpus',
    description:
      'Search the accessibility finding corpus for entries related to a natural-language query. ' +
      'Call this before rewriting to find similar findings that demonstrate the expected voice, ' +
      'tone, and technical depth. Returns up to 3 matching entries.',
    queryDescription: 'Natural-language search query, e.g. "keyboard focus visible" or "color contrast low vision".',
    fields: CORPUS_SEARCH_FIELDS,
    pick: CORPUS_PICK,
    limit: 3,
  })

  const userPrompt = `Refine this accessibility finding based on the auditor's note.

Title: ${finding.title}
WCAG SC: ${finding.primarySC}
Severity: ${finding.severity}
Platform: ${finding.platform}

Current description:
${descText}

Current suggested fix:
${fixText}

Auditor's note: "${note}"

Search the corpus for related findings, then rewrite the description and suggested fix to reflect the refinement.`

  const messages = [{ role: 'user', content: userPrompt }]

  const text = await callAnthropicWithTools({
    key,
    model,
    system: getSystemPrompt() || FALLBACK_SYSTEM_PROMPT,
    tools: [toolSchema],
    messages,
    maxTokens: AI_AGENTIC_MAX_TOKENS,
    maxTurns: AGENTIC_MAX_TOOL_TURNS,
    onToolCall: toolHandler,
  })

  return parseAiResponse(text)
}
