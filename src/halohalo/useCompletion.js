import { useState, useRef, useEffect } from 'react'
import { callProvider, callAnthropicWithTools } from './fetch.js'
import { AiApiError } from './providers.js'

const DEFAULT_TYPEWRITER = { tickMs: 33, minCharsPerTick: 2, charDivisor: 40 }

// ─── useCompletion ────────────────────────────────────────────────────────────
// Manages a single AI completion lifecycle: call → typewriter animation → result.
//
// options:
//   onResult(fields)    — called with the parsed result object after completion
//   onError(error)      — called with AiApiError or Error on failure
//   parseResponse(text) — (text: string) => object; maps raw text to result fields
//   typewriter          — { tickMs, minCharsPerTick, charDivisor } or false to disable
//   onAnimate(field, text) — called each tick with field name + current text slice
//   onAnimateDone()     — called when typewriter finishes

export function useCompletion({
  onResult,
  onError,
  parseResponse,
  typewriter = DEFAULT_TYPEWRITER,
  onAnimate,
  onAnimateDone,
} = {}) {
  const [loading, setLoading] = useState(false)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function runTypewriter(fields) {
    clearTimeout(timerRef.current)
    const { tickMs, minCharsPerTick, charDivisor } = { ...DEFAULT_TYPEWRITER, ...typewriter }

    const entries = Object.entries(fields).filter(([, v]) => typeof v === 'string' && v.length > 0)
    if (!entries.length) { setAnimating(false); onAnimateDone?.(); return }

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
        setAnimating(false)
        onAnimateDone?.()
      } else {
        timerRef.current = setTimeout(tick, tickMs)
      }
    }

    timerRef.current = setTimeout(tick, tickMs)
  }

  async function complete({ provider, model, key, prompt, maxTokens, agentOptions }) {
    setLoading(true)

    try {
      let text
      if (agentOptions) {
        const { system, tools, messages, maxTurns, onToolCall } = agentOptions
        text = await callAnthropicWithTools({ key, model, system, tools, messages, maxTokens, maxTurns, onToolCall })
      } else {
        text = await callProvider({ provider, model, key, prompt, maxTokens })
      }

      const result = parseResponse ? parseResponse(text) : { text }
      setLoading(false)

      if (typewriter && onAnimate) {
        setAnimating(true)
        onResult?.(result)
        runTypewriter(result)
      } else {
        onResult?.(result)
        onAnimateDone?.()
      }
    } catch (e) {
      setLoading(false)
      setAnimating(false)
      onError?.(e instanceof AiApiError ? e : new AiApiError('api_error'))
    }
  }

  function cancel() {
    clearTimeout(timerRef.current)
    setLoading(false)
    setAnimating(false)
  }

  return { loading, animating, complete, cancel }
}
