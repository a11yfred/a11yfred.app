// ─── Error types ─────────────────────────────────────────────────────────────

export class AiApiError extends Error {
  /** @param {'invalid_key'|'rate_limit'|'service_error'|'network_error'|'api_error'} type */
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

// ─── Provider configs ─────────────────────────────────────────────────────────
// Each entry describes how to build headers, body, and parse responses for a
// given AI provider. getModel is injected at call time so the config itself
// carries no storage dependency.

export const PROVIDER_CONFIGS = {
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    buildHeaders: (key) => ({
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    }),
    buildBody: (prompt, model, maxTokens) => JSON.stringify({
      model,
      max_tokens: maxTokens,
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
    buildBody: (prompt, model, maxTokens) => JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
    parseResponse: async (res) => {
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    },
  },

  google: {
    buildUrl: (key, model) =>
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    buildHeaders: () => ({ 'Content-Type': 'application/json' }),
    buildBody: (prompt, _model, maxTokens) => JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    }),
    parseResponse: async (res) => {
      const data = await res.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    },
  },

  microsoft: {
    // Requires VITE_AZURE_OPENAI_ENDPOINT set to your Azure deployment URL.
    buildUrl: () => import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || null,
    buildHeaders: (key) => ({
      'Content-Type': 'application/json',
      'api-key': key,
    }),
    buildBody: (prompt, _model, maxTokens) => JSON.stringify({
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
    parseResponse: async (res) => {
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    },
  },
}

export const DEFAULT_PROVIDERS = ['anthropic', 'openai', 'google', 'microsoft']

export const DEFAULT_MODELS = {
  anthropic: 'claude-sonnet-4-6',
  openai:    'gpt-4o',
  google:    'gemini-1.5-flash',
  microsoft: '',
}

export const DEFAULT_PROVIDER_LABELS = {
  anthropic: 'Claude',
  openai:    'GPT',
  google:    'Gemini',
  microsoft: 'Copilot',
}
