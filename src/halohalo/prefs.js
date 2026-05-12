import { LS_AI_PROVIDER, LS_AI_MODEL_PREFIX, LS_AGENTIC_MODE, DEFAULT_AI_MODELS, PROVIDER_LABELS } from './constants.js'

export function getAiProvider() {
  return localStorage.getItem(LS_AI_PROVIDER) || 'anthropic'
}

export function isAgenticModeEnabled() {
  return localStorage.getItem(LS_AGENTIC_MODE) === 'true'
}

export function getAiModel(provider) {
  return localStorage.getItem(`${LS_AI_MODEL_PREFIX}${provider}`) || DEFAULT_AI_MODELS[provider] || ''
}

export function getProviderLabel(provider) {
  return PROVIDER_LABELS[provider] || provider
}
