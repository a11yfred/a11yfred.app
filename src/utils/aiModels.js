export const PROVIDERS = [
  { id: 'anthropic', label: 'Anthropic (Claude)', placeholderKey: 'settings.api_placeholder_anthropic' },
  { id: 'openai',    label: 'OpenAI (GPT)',        placeholderKey: 'settings.api_placeholder_openai'    },
  { id: 'google',    label: 'Google (Gemini)',      placeholderKey: 'settings.api_placeholder_google'    },
  { id: 'microsoft', label: 'Microsoft (Copilot)', placeholderKey: 'settings.api_placeholder_default'   },
]

export const PROVIDER_MODELS = {
  anthropic: [
    { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 — fast, low cost' },
    { id: 'claude-sonnet-4-6',         label: 'Claude Sonnet 4.6 — balanced (default)' },
    { id: 'claude-opus-4-7',           label: 'Claude Opus 4.7 — most capable' },
  ],
  openai: [
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini — fast, low cost' },
    { id: 'gpt-4o',      label: 'GPT-4o — balanced (default)' },
  ],
  google: [
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash — fast (default)' },
    { id: 'gemini-1.5-pro',   label: 'Gemini 1.5 Pro — most capable' },
  ],
  microsoft: [],
}

export const MODEL_DEFAULTS = {
  anthropic: 'claude-sonnet-4-6',
  openai:    'gpt-4o',
  google:    'gemini-1.5-flash',
  microsoft: '',
}

export function initModels() {
  return Object.fromEntries(
    PROVIDERS.map(p => [p.id, localStorage.getItem(`ai_model_${p.id}`) || MODEL_DEFAULTS[p.id] || ''])
  )
}
