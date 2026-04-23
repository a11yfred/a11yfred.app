/**
 * aiService.js
 *
 * Thin abstraction over AI providers.
 * - Anthropic: implemented
 * - OpenAI, Google, Microsoft: stubbed, ready to wire up
 *
 * Keys are read from localStorage (set via SettingsPanel).
 * Calls go directly from the browser to the provider API.
 * No server required for Phase 1.
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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
    parseResponse: async (res) => {
      const data = await res.json()
      return data.content?.[0]?.text || ''
    },
  },

  openai: {
    // TODO: implement OpenAI
    stub: true,
  },

  google: {
    // TODO: implement Gemini
    stub: true,
  },

  microsoft: {
    // TODO: implement Copilot
    stub: true,
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

  if (config.stub) {
    throw new Error(`${provider} provider is not yet implemented.`)
  }

  const prompt = buildPrompt({ defect, descText, remText, note })

  const res = await fetch(config.url, {
    method: 'POST',
    headers: config.buildHeaders(key),
    body: config.buildBody(prompt),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error: ${res.status} — ${err}`)
  }

  const text = await config.parseResponse(res)

  // Parse the two-line response
  const descMatch = text.match(/^Description:\s*(.+)/m)
  const remMatch = text.match(/^Remediation:\s*(.+)/ms)

  return {
    desc: descMatch?.[1]?.trim() || null,
    rem: remMatch?.[1]?.trim() || null,
  }
}
