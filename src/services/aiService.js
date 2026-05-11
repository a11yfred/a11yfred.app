/**
 * aiService.js
 *
 * Thin abstraction over AI providers.
 * Keys are read from localStorage (set via SettingsPanel).
 * Calls go directly from the browser to the provider API.
 */

import { AI_MAX_TOKENS, ANTHROPIC_API_VERSION, ANTHROPIC_API_URL, AI_DESC_REGEX, AI_FIX_REGEX, LS_APIKEY_PREFIX } from '../utils/constants.js'
import { getStorage, getAiProvider, getAiModel } from '../utils/storage.js'

export class AiApiError extends Error {
  /**
   * @param {'invalid_key'|'rate_limit'|'service_error'|'network_error'|'api_error'} type
   * @param {{ status?: number, provider?: string }} opts
   */
  constructor(type, { status, provider } = {}) {
    super(`AiApiError: ${type}`)
    this.type = type
    this.status = status
    this.provider = provider
  }
}

export function httpStatusToErrorType(status) {
  if (status === 401 || status === 403) return 'invalid_key'
  if (status === 429) return 'rate_limit'
  if (status >= 500) return 'service_error'
  return 'api_error'
}

const PROVIDER_CONFIGS = {
  anthropic: {
    url: ANTHROPIC_API_URL,
    buildHeaders: (key) => ({
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': ANTHROPIC_API_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    }),
    buildBody: (prompt) => JSON.stringify({
      model: getAiModel('anthropic'),
      max_tokens: AI_MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    }),
    parseResponse: async (res) => {
      const data = await res.json()
      return data.content?.[0]?.text || ''
    },
  },

  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    buildHeaders: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
    buildBody: (prompt) => JSON.stringify({
      model: getAiModel('openai'),
      max_tokens: AI_MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    }),
    parseResponse: async (res) => {
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    },
  },

  google: {
    buildUrl: (key) =>
      `https://generativelanguage.googleapis.com/v1beta/models/${getAiModel('google')}:generateContent?key=${key}`,
    buildHeaders: () => ({
      'Content-Type': 'application/json',
    }),
    buildBody: (prompt) => JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: AI_MAX_TOKENS },
    }),
    parseResponse: async (res) => {
      const data = await res.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    },
  },

  microsoft: {
    // Azure OpenAI requires an endpoint URL in addition to an API key.
    // Set VITE_AZURE_OPENAI_ENDPOINT in your .env to your deployment URL:
    //   https://{resource}.openai.azure.com/openai/deployments/{deployment}/chat/completions?api-version=2024-02-01
    buildUrl: () => import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || null,
    buildHeaders: (key) => ({
      'Content-Type': 'application/json',
      'api-key': key,
    }),
    buildBody: (prompt) => JSON.stringify({
      max_tokens: AI_MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    }),
    parseResponse: async (res) => {
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    },
  },
}

function buildPrompt({ finding, descText, fixText, note }) {
  return `You are helping an accessibility auditor write finding descriptions in their established voice and methodology.

The auditor has this existing finding:

Title: ${finding.title}
WCAG SC: ${finding.primarySC}
Current description: ${descText}
Current suggested fix: ${fixText}

The auditor wants to refine it with this note: "${note}"

Rewrite the description and suggested fix to reflect the refinement. Keep the same professional, direct tone and level of technical detail. Do not add preamble or explanation.

Respond with exactly two lines:
Description: [rewritten description]
Suggested Fix: [rewritten suggested fix]`
}

export async function getAiRefinement({ finding, descText, fixText, note }) {
  const provider = getAiProvider()
  const key = window.electronAPI
    ? await window.electronAPI.keys.get(`${LS_APIKEY_PREFIX}${provider}`)
    : getStorage(`${LS_APIKEY_PREFIX}${provider}`)

  if (!key) {
    throw new Error(`No API key found for ${provider}. Add one in Settings.`)
  }

  const config = PROVIDER_CONFIGS[provider]
  const prompt = buildPrompt({ finding, descText, fixText, note })

  // Build URL (some providers need the key in the URL)
  let url
  if (config.buildUrl) {
    url = config.buildUrl(key)
    if (!url) {
      throw new Error(
        `Microsoft/Azure provider requires VITE_AZURE_OPENAI_ENDPOINT to be set. ` +
        `Add your Azure OpenAI deployment URL to your .env file.`
      )
    }
  } else {
    url = config.url
  }

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: config.buildHeaders(key),
      body: config.buildBody(prompt),
    })
  } catch {
    throw new AiApiError('network_error', { provider })
  }

  if (!res.ok) {
    throw new AiApiError(httpStatusToErrorType(res.status), { status: res.status, provider })
  }

  const text = await config.parseResponse(res)

  const descMatch = text.match(AI_DESC_REGEX)
  const fixMatch  = text.match(AI_FIX_REGEX)

  return {
    desc: descMatch?.[1]?.trim() || null,
    fix: fixMatch?.[1]?.trim() || null,
  }
}
