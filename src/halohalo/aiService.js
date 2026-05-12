import { callProvider } from './fetch.js'
import { getAdapter } from '../sawsawan/platformAdapter.js'
import { AI_MAX_TOKENS, AI_DESC_REGEX, AI_FIX_REGEX, LS_APIKEY_PREFIX } from './constants.js'
import { getAiProvider, getAiModel } from './prefs.js'

export { AiApiError, httpStatusToErrorType } from './providers.js'

function buildPrompt({ item, descText, fixText, note }) {
  return `You are helping an accessibility auditor write finding descriptions in their established voice and methodology.

The auditor has this existing finding:

Title: ${item.title}
WCAG SC: ${item.primarySC}
Current description: ${descText}
Current suggested fix: ${fixText}

The auditor wants to refine it with this note: "${note}"

Rewrite the description and suggested fix to reflect the refinement. Keep the same professional, direct tone and level of technical detail. Do not add preamble or explanation.

Respond with exactly two lines:
Description: [rewritten description]
Suggested Fix: [rewritten suggested fix]`
}

export function parseAiResponse(text) {
  const descMatch = text.match(AI_DESC_REGEX)
  const fixMatch  = text.match(AI_FIX_REGEX)
  return {
    desc: descMatch?.[1]?.trim() || null,
    fix:  fixMatch?.[1]?.trim()  || null,
  }
}

export async function getAiRefinement({ finding, descText, fixText, note }) {
  const provider = getAiProvider()
  const key = await getAdapter().getKey(`${LS_APIKEY_PREFIX}${provider}`)

  if (!key) throw new Error(`No API key found for ${provider}. Add one in Settings.`)

  const model = getAiModel(provider)
  const prompt = buildPrompt({ item: finding, descText, fixText, note })
  const text = await callProvider({ provider, model, key, prompt, maxTokens: AI_MAX_TOKENS })
  return parseAiResponse(text)
}
