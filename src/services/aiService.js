/**
 * aiService.js
 *
 * Thin abstraction over AI providers.
 * Keys are read from localStorage (set via SettingsPanel).
 * Calls go directly from the browser to the provider API.
 */

const PROVIDER_CONFIGS = {
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    buildHeaders: (key) => ({
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    }),
    buildBody: (prompt) => JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
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
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
    parseResponse: async (res) => {
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    },
  },

  google: {
    buildUrl: (key) =>
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    buildHeaders: () => ({
      'Content-Type': 'application/json',
    }),
    buildBody: (prompt) => JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024 },
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
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
    parseResponse: async (res) => {
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    },
  },
}

function buildPrompt({ defect, descText, remText, note }) {
  return `You are helping an accessibility auditor write defect descriptions in their established voice and methodology.

The auditor has this existing defect entry:

Title: ${defect.title}
WCAG SC: ${defect.scLabel}
Current description: ${descText}
Current remediation: ${remText}

The auditor wants to refine it with this note: "${note}"

Rewrite the description and remediation to reflect the refinement. Keep the same professional, direct tone and level of technical detail. Do not add preamble or explanation.

Respond with exactly two lines:
Description: [rewritten description]
Remediation: [rewritten remediation]`
}

export async function getAiRefinement({ defect, descText, remText, note }) {
  const provider = localStorage.getItem('ai_provider') || 'anthropic'
  const key = localStorage.getItem(`apikey_${provider}`)

  if (!key) {
    throw new Error(`No API key found for ${provider}. Add one in Settings.`)
  }

  const config = PROVIDER_CONFIGS[provider]
  const prompt = buildPrompt({ defect, descText, remText, note })

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

  const res = await fetch(url, {
    method: 'POST',
    headers: config.buildHeaders(key),
    body: config.buildBody(prompt),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error (${provider}): ${res.status} — ${err}`)
  }

  const text = await config.parseResponse(res)

  const descMatch = text.match(/^Description:\s*(.+)/m)
  const remMatch = text.match(/^Remediation:\s*(.+)/ms)

  return {
    desc: descMatch?.[1]?.trim() || null,
    rem: remMatch?.[1]?.trim() || null,
  }
}
