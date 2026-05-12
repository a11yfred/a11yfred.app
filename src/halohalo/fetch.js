import { AiApiError, httpStatusToErrorType, PROVIDER_CONFIGS } from './providers.js'

// ─── callProvider ─────────────────────────────────────────────────────────────
// Single-turn completion against any configured provider.
// Returns the response text string.

export async function callProvider({ provider, model, key, prompt, maxTokens = 1024 }) {
  const config = PROVIDER_CONFIGS[provider]
  if (!config) throw new AiApiError('api_error', { provider })

  let url
  if (config.buildUrl) {
    url = config.buildUrl(key, model)
    if (!url) throw new AiApiError('api_error', { provider })
  } else {
    url = config.url
  }

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: config.buildHeaders(key),
      body: config.buildBody(prompt, model, maxTokens),
    })
  } catch {
    throw new AiApiError('network_error', { provider })
  }

  if (!res.ok) {
    throw new AiApiError(httpStatusToErrorType(res.status), { status: res.status, provider })
  }

  return config.parseResponse(res)
}

// ─── callAnthropicWithTools ───────────────────────────────────────────────────
// Agentic tool-use loop for Anthropic. Calls the messages API repeatedly until
// stop_reason is 'end_turn' or maxTurns is exhausted.
//
// onToolCall(toolName, toolInput) => toolResultContent (string or object)
// Returns the final text block content.

export async function callAnthropicWithTools({
  key,
  model,
  system,
  tools,
  messages,
  maxTokens = 2048,
  maxTurns = 5,
  onToolCall,
}) {
  const config = PROVIDER_CONFIGS.anthropic
  let turns = 0

  while (turns <= maxTurns) {
    let res
    try {
      res = await fetch(config.url, {
        method: 'POST',
        headers: config.buildHeaders(key),
        body: JSON.stringify({ model, max_tokens: maxTokens, system, tools, messages }),
      })
    } catch {
      throw new AiApiError('network_error', { provider: 'anthropic' })
    }

    if (!res.ok) {
      throw new AiApiError(httpStatusToErrorType(res.status), { status: res.status, provider: 'anthropic' })
    }

    const data = await res.json()

    if (import.meta.env.DEV) console.log(`[halohalo] turn ${turns + 1}, stop_reason: ${data.stop_reason}`)

    messages.push({ role: 'assistant', content: data.content })

    if (data.stop_reason === 'end_turn') {
      return data.content.find(b => b.type === 'text')?.text || ''
    }

    if (data.stop_reason === 'tool_use') {
      if (turns >= maxTurns) {
        if (import.meta.env.DEV) console.warn('[halohalo] maxTurns reached')
        throw new AiApiError('api_error', { provider: 'anthropic' })
      }

      const toolBlocks = data.content.filter(b => b.type === 'tool_use')
      const toolResults = await Promise.all(
        toolBlocks.map(async (block) => {
          const result = await onToolCall?.(block.name, block.input) ?? ''
          if (import.meta.env.DEV) {
            console.log(`[halohalo] tool_use: ${block.name}`, block.input, '→', result)
          }
          return {
            type: 'tool_result',
            tool_use_id: block.id,
            content: typeof result === 'string' ? result : JSON.stringify(result),
          }
        })
      )

      messages.push({ role: 'user', content: toolResults })
      turns++
      continue
    }

    break
  }

  throw new AiApiError('api_error', { provider: 'anthropic' })
}
