export const LS_AI_PROVIDER      = 'ai_provider'
export const LS_AGENTIC_MODE     = 'agentic_mode'
export const LS_APIKEY_PREFIX    = 'apikey_'
export const LS_AI_MODEL_PREFIX  = 'ai_model_'

export const AI_MAX_TOKENS          = 1024
export const AI_AGENTIC_MAX_TOKENS  = 2048
export const AGENTIC_MAX_TOOL_TURNS = 5

export const ANTHROPIC_API_VERSION = '2023-06-01'
export const ANTHROPIC_API_URL     = 'https://api.anthropic.com/v1/messages'

export const AI_DESC_REGEX = /^Description:\s*(.+)/m
export const AI_FIX_REGEX  = /^Suggested Fix:\s*(.+)/ms

export const DEBUG_AI_DELAY_MS = 1200

export const DEFAULT_AI_MODELS = {
  anthropic: 'claude-sonnet-4-6',
  openai:    'gpt-4o',
  google:    'gemini-1.5-flash',
  microsoft: '',
}

export const PROVIDER_LABELS = {
  anthropic: 'Claude',
  openai:    'GPT',
  google:    'Gemini',
  microsoft: 'Copilot',
}

export const DEBUG_COMMANDS = Object.freeze({
  OK:            'debug ok',
  WRONG:         'debug wrong',
  AUTH:          'debug 401',
  RATE:          'debug 429',
  SERVICE:       'debug 503',
  NETWORK:       'debug network',
  AI_ASSIST_ON:  'debug ai assist on',
  AI_ASSIST_OFF: 'debug ai assist off',
})

export const DEBUG_COMMAND_VALUES = Object.freeze(Object.values(DEBUG_COMMANDS))
