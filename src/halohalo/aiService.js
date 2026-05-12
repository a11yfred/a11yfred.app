import { callProvider } from './fetch.js'
import { getAdapter } from '../sawsawan/platformAdapter.js'
import { AI_MAX_TOKENS, AI_DESC_REGEX, AI_FIX_REGEX, LS_APIKEY_PREFIX } from './constants.js'
import { getAiProvider, getAiModel } from './prefs.js'
import { getBuildPrompt } from './init.js'

export { AiApiError, httpStatusToErrorType } from './providers.js'

export function parseAiResponse(text) {
  const descMatch = text.match(AI_DESC_REGEX)
  const fixMatch  = text.match(AI_FIX_REGEX)
  return {
    desc: descMatch?.[1]?.trim() || null,
    fix:  fixMatch?.[1]?.trim()  || null,
  }
}

export async function getAiRefinement({ finding, descText, fixText, note }) {
  const buildPrompt = getBuildPrompt()
  if (!buildPrompt) throw new Error('halohalo: call initHalohalo({ buildPrompt }) before getAiRefinement')

  const provider = getAiProvider()
  const key = await getAdapter().getKey(`${LS_APIKEY_PREFIX}${provider}`)

  if (!key) throw new Error(`No API key found for ${provider}. Add one in Settings.`)

  const model = getAiModel(provider)
  const prompt = buildPrompt({ finding, descText, fixText, note })
  const text = await callProvider({ provider, model, key, prompt, maxTokens: AI_MAX_TOKENS })
  return parseAiResponse(text)
}
