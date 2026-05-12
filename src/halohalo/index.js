// vanilla core
export { initHalohalo } from './init.js'
export { AiApiError, httpStatusToErrorType, PROVIDER_CONFIGS } from './providers.js'
export { callProvider, callAnthropicWithTools } from './fetch.js'
export { searchItems, makeSearchTool } from './search.js'
export { createProviderConfig } from './createProviderConfig.js'
export { createCompletion } from './createCompletion.js'
export { getAiRefinement, parseAiResponse } from './aiService.js'
export { getAgenticRefinement } from './agenticAiService.js'
export { PROVIDERS, PROVIDER_MODELS, initModels, initApiKeys } from './models.js'
export { getAiProvider, isAgenticModeEnabled, getAiModel, getProviderLabel } from './prefs.js'
export { checkConnectivity } from './connectivity.js'
export {
  LS_AI_PROVIDER, LS_AGENTIC_MODE, LS_APIKEY_PREFIX, LS_AI_MODEL_PREFIX,
  AI_MAX_TOKENS, AI_AGENTIC_MAX_TOKENS, AGENTIC_MAX_TOOL_TURNS,
  AI_DESC_REGEX, AI_FIX_REGEX,
  DEBUG_AI_DELAY_MS, DEFAULT_AI_MODELS, PROVIDER_LABELS,
  DEBUG_COMMANDS, DEBUG_COMMAND_VALUES,
  ANTHROPIC_API_VERSION, ANTHROPIC_API_URL,
} from './constants.js'
