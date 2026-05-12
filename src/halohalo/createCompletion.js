import { callProvider, callAnthropicWithTools } from './fetch.js'
import { AiApiError } from './providers.js'

const DEFAULT_TYPEWRITER = { tickMs: 33, minCharsPerTick: 2, charDivisor: 40 }

/**
 * Vanilla completion runner — no React required.
 * Returns { complete(options), cancel() } plus a subscribe() for state changes.
 *
 * State: { loading: boolean, animating: boolean }
 *
 * options for complete():
 *   provider, model, key, prompt, maxTokens — for standard completions
 *   agentOptions: { system, tools, messages, maxTurns, onToolCall } — for agentic
 *   onResult(fields)       — called with parsed result after completion
 *   onError(error)         — called with AiApiError on failure
 *   parseResponse(text)    — maps raw text to result fields object
 *   typewriter             — { tickMs, minCharsPerTick, charDivisor } or false
 *   onAnimate(field, text) — called each tick with field + current text slice
 *   onAnimateDone()        — called when typewriter finishes
 */
export function createCompletion() {
  let loading = false
  let animating = false
  let timer = null
  const listeners = new Set()
  const notify = () => listeners.forEach(fn => fn({ loading, animating }))

  function runTypewriter(fields, { typewriter, onAnimate, onAnimateDone }) {
    clearTimeout(timer)
    const { tickMs, minCharsPerTick, charDivisor } = { ...DEFAULT_TYPEWRITER, ...typewriter }

    const entries = Object.entries(fields).filter(([, v]) => typeof v === 'string' && v.length > 0)
    if (!entries.length) {
      animating = false
      notify()
      onAnimateDone?.()
      return
    }

    const total = entries.reduce((sum, [, v]) => sum + v.length, 0)
    const charsPerTick = Math.max(minCharsPerTick, Math.ceil(total / charDivisor))
    const indices = Object.fromEntries(entries.map(([k]) => [k, 0]))
    let entryIdx = 0

    function tick() {
      const [field, text] = entries[entryIdx]
      indices[field] = Math.min(indices[field] + charsPerTick, text.length)
      onAnimate?.(field, text.slice(0, indices[field]))
      if (indices[field] >= text.length) entryIdx++
      if (entryIdx >= entries.length) {
        animating = false
        notify()
        onAnimateDone?.()
      } else {
        timer = setTimeout(tick, tickMs)
      }
    }

    timer = setTimeout(tick, tickMs)
  }

  return {
    get loading() { return loading },
    get animating() { return animating },

    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },

    async complete({ provider, model, key, prompt, maxTokens, agentOptions, onResult, onError, parseResponse, typewriter = DEFAULT_TYPEWRITER, onAnimate, onAnimateDone }) {
      loading = true
      notify()

      try {
        let text
        if (agentOptions) {
          const { system, tools, messages, maxTurns, onToolCall } = agentOptions
          text = await callAnthropicWithTools({ key, model, system, tools, messages, maxTokens, maxTurns, onToolCall })
        } else {
          text = await callProvider({ provider, model, key, prompt, maxTokens })
        }

        const result = parseResponse ? parseResponse(text) : { text }
        loading = false

        if (typewriter && onAnimate) {
          animating = true
          notify()
          onResult?.(result)
          runTypewriter(result, { typewriter, onAnimate, onAnimateDone })
        } else {
          notify()
          onResult?.(result)
          onAnimateDone?.()
        }
      } catch (e) {
        loading = false
        animating = false
        notify()
        onError?.(e instanceof AiApiError ? e : new AiApiError('api_error'))
      }
    },

    cancel() {
      clearTimeout(timer)
      loading = false
      animating = false
      notify()
    },
  }
}
