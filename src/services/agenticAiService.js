/**
 * agenticAiService.js
 *
 * Agentic AI refinement using Anthropic tool use.
 * Only supports the Anthropic provider — tool use requires the messages API
 * with tool definitions, which is Anthropic-specific in this codebase.
 *
 * Workflow per call:
 *   1. Send user refinement request with the search_corpus tool available
 *   2. If the model calls search_corpus, run it locally via Fuse.js and return results
 *   3. Repeat up to MAX_TOOL_TURNS times
 *   4. Extract the final Description / Remediation output
 *
 * Error handling:
 *   - AiApiError is thrown for all API-level failures
 *   - If MAX_TOOL_TURNS is reached without a final answer, throws AiApiError('api_error')
 *   - Dev console logs every turn and tool call for debugging
 */

import { AiApiError } from './aiService.js'
import { SEARCH_CORPUS_TOOL_SCHEMA, searchCorpus } from './searchCorpusTool.js'

const MAX_TOOL_TURNS = 5

export const AGENTIC_SYSTEM_PROMPT = `You are an expert accessibility auditor's AI assistant. Your job is to help rewrite finding descriptions in the auditor's established voice and methodology.

Before rewriting, always call search_corpus at least once to find similar findings that demonstrate the expected tone, technical depth, and format.

Rules:
- Call search_corpus before producing your final output — context from similar findings improves accuracy
- Preserve the auditor's direct, professional style — no preamble, no hedging, no emojis
- Keep technical accuracy: reference specific WCAG SCs, HTML attributes, and ARIA patterns where appropriate
- Match the existing finding's level of technical detail — do not expand or compress significantly
- Do not add phrases like "I've rewritten..." or "Here is the updated..."
- Format your final output as exactly two lines with no extra text before or after:
  Description: [rewritten description]
  Remediation: [rewritten remediation]`

async function callAnthropicMessages({ key, model, messages }) {
  let res
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: AGENTIC_SYSTEM_PROMPT,
        tools: [SEARCH_CORPUS_TOOL_SCHEMA],
        messages,
      }),
    })
  } catch {
    throw new AiApiError('network_error', { provider: 'anthropic' })
  }

  if (!res.ok) {
    const type =
      res.status === 401 || res.status === 403 ? 'invalid_key'
      : res.status === 429 ? 'rate_limit'
      : res.status >= 500 ? 'service_error'
      : 'api_error'
    throw new AiApiError(type, { status: res.status, provider: 'anthropic' })
  }

  return res.json()
}

/**
 * Run an agentic refinement using Anthropic tool use.
 *
 * @param {{ finding, descText, remText, note, corpus: object[] }} params
 * @returns {Promise<{ desc: string|null, rem: string|null }>}
 */
export async function getAgenticRefinement({ finding, descText, remText, note, corpus }) {
  const key = localStorage.getItem('apikey_anthropic')
  if (!key) {
    throw new Error('Anthropic API key required for agentic mode. Add one in Settings → AI Assist.')
  }

  const model = localStorage.getItem('ai_model_anthropic') || 'claude-sonnet-4-6'

  const userPrompt = `Refine this accessibility finding based on the auditor's note.

Title: ${finding.title}
WCAG SC: ${finding.scLabel}
Priority: ${finding.priority}
Platform: ${finding.platform}

Current description:
${descText}

Current remediation:
${remText}

Auditor's note: "${note}"

Search the corpus for related findings, then rewrite the description and remediation to reflect the refinement.`

  const messages = [{ role: 'user', content: userPrompt }]
  let toolTurns = 0

  while (toolTurns <= MAX_TOOL_TURNS) {
    const data = await callAnthropicMessages({ key, model, messages })

    if (import.meta.env.DEV) {
      console.log(`[agenticAI] turn ${toolTurns + 1} — stop_reason: ${data.stop_reason}`)
    }

    messages.push({ role: 'assistant', content: data.content })

    if (data.stop_reason === 'end_turn') {
      const textBlock = data.content.find(b => b.type === 'text')
      const text = textBlock?.text || ''
      const descMatch = text.match(/^Description:\s*(.+)/m)
      const remMatch  = text.match(/^Remediation:\s*(.+)/ms)
      return {
        desc: descMatch?.[1]?.trim() || null,
        rem:  remMatch?.[1]?.trim()  || null,
      }
    }

    if (data.stop_reason === 'tool_use') {
      if (toolTurns >= MAX_TOOL_TURNS) {
        if (import.meta.env.DEV) {
          console.warn('[agenticAI] MAX_TOOL_TURNS reached — aborting')
        }
        throw new AiApiError('api_error', { provider: 'anthropic' })
      }

      const toolBlocks = data.content.filter(b => b.type === 'tool_use')
      const toolResults = toolBlocks.map(block => {
        const results = searchCorpus(block.input?.query ?? '', corpus)
        if (import.meta.env.DEV) {
          console.log(
            `[agenticAI] tool_use: search_corpus("${block.input?.query}") → ${results.length} results`,
            results.map(r => r.id)
          )
        }
        return {
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(results),
        }
      })

      messages.push({ role: 'user', content: toolResults })
      toolTurns++
      continue
    }

    // Unexpected stop_reason
    break
  }

  throw new AiApiError('api_error', { provider: 'anthropic' })
}
