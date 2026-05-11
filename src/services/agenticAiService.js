import { callAnthropicWithTools, makeSearchTool } from '../halohalo/index.js'
import { getAdapter } from '../sawsawan/platformAdapter.js'
import { AI_AGENTIC_MAX_TOKENS, AGENTIC_MAX_TOOL_TURNS, LS_APIKEY_PREFIX } from '../utils/constants.js'
import { getAiModel } from '../utils/storage.js'
import { parseAiResponse } from './aiService.js'

export { AiApiError } from '../halohalo/index.js'

const SYSTEM_PROMPT = `You are an expert accessibility auditor's AI assistant. Your job is to help rewrite finding descriptions in the auditor's established voice and methodology.

Before rewriting, always call search_corpus at least once to find similar findings that demonstrate the expected tone, technical depth, and format.

Rules:
- Call search_corpus before producing your final output, context from similar findings improves accuracy
- Preserve the auditor's direct, professional style, no preamble, no hedging, no emojis
- Keep technical accuracy: reference specific WCAG SCs, HTML attributes, and ARIA patterns where appropriate
- Match the existing finding's level of technical detail, do not expand or compress significantly
- Do not add phrases like "I've rewritten..." or "Here is the updated..."
- Format your final output as exactly two lines with no extra text before or after:
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
    system: SYSTEM_PROMPT,
    tools: [toolSchema],
    messages,
    maxTokens: AI_AGENTIC_MAX_TOKENS,
    maxTurns: AGENTIC_MAX_TOOL_TURNS,
    onToolCall: toolHandler,
  })

  return parseAiResponse(text)
}
