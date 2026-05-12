// ─── halohalo module singleton ────────────────────────────────────────────────
// Holds app-injected config. Call initHalohalo() before using aiService or
// agenticAiService.

let _buildPrompt = null
let _systemPrompt = null

/**
 * Register app-specific AI config. Call once at app init.
 *
 * @param {{
 *   buildPrompt: (params: object) => string,
 *   systemPrompt?: string,
 * }} config
 *
 * buildPrompt receives { finding, descText, fixText, note } and must return
 * the user-turn prompt string for single-turn refinement.
 *
 * systemPrompt is used for agentic (tool-use) mode. If omitted, agentic mode
 * falls back to a generic instruction.
 */
export function initHalohalo({ buildPrompt, systemPrompt = null }) {
  _buildPrompt = buildPrompt
  _systemPrompt = systemPrompt
}

export function getBuildPrompt() {
  return _buildPrompt
}

export function getSystemPrompt() {
  return _systemPrompt
}
