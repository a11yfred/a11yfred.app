import { useState, useCallback } from 'react'
import { DEFAULT_MODELS, DEFAULT_PROVIDERS, DEFAULT_PROVIDER_LABELS } from './providers.js'
import { getAdapter } from '../sawsawan/platformAdapter.js'

// ─── useProviderConfig ────────────────────────────────────────────────────────
// Manages active provider, per-provider model selection, API keys, and an
// optional boolean mode flag — all persisted via the platform adapter.
//
// storageKeys: {
//   provider:    string — key for the active provider id
//   modelPrefix: string — prefix; full key = modelPrefix + providerId
//   keyPrefix:   string — prefix; full key = keyPrefix + providerId
//   mode:        string — optional key for a boolean mode flag (e.g. agentic)
// }
// providers: optional array of { id, label, defaultModel? } — defaults to the
//            four built-in providers

export function useProviderConfig(storageKeys, providers = DEFAULT_PROVIDERS) {
  const { provider: providerKey, modelPrefix, keyPrefix, mode: modeKey } = storageKeys

  const providerList = providers.map(p =>
    typeof p === 'string' ? { id: p, label: DEFAULT_PROVIDER_LABELS[p] || p } : p
  )

  const [provider, setProviderState] = useState(
    () => getAdapter().readPref(providerKey) || providerList[0]?.id || 'anthropic'
  )

  const [models, setModelsState] = useState(() =>
    Object.fromEntries(
      providerList.map(p => [
        p.id,
        getAdapter().readPref(`${modelPrefix}${p.id}`) || p.defaultModel || DEFAULT_MODELS[p.id] || '',
      ])
    )
  )

  // Keys are not pre-loaded in memory when the adapter is async (Electron).
  // getKey() is always async — callers must await it.
  const [keys, setKeysState] = useState(() =>
    Object.fromEntries(providerList.map(p => [p.id, '']))
  )

  const [mode, setModeState] = useState(
    () => modeKey ? getAdapter().readPref(modeKey) === 'true' : false
  )

  const setProvider = useCallback((id) => {
    getAdapter().writePref(providerKey, id)
    setProviderState(id)
  }, [providerKey])

  const setModel = useCallback((providerId, modelId) => {
    getAdapter().writePref(`${modelPrefix}${providerId}`, modelId)
    setModelsState(prev => ({ ...prev, [providerId]: modelId }))
  }, [modelPrefix])

  const setKey = useCallback((providerId, value) => {
    getAdapter().setKey(`${keyPrefix}${providerId}`, value)
    setKeysState(prev => ({ ...prev, [providerId]: value }))
  }, [keyPrefix])

  const setMode = useCallback((value) => {
    if (!modeKey) return
    getAdapter().writePref(modeKey, value ? 'true' : 'false')
    setModeState(value)
  }, [modeKey])

  const getKey = useCallback(async (providerId) => {
    return (await getAdapter().getKey(`${keyPrefix}${providerId}`)) || ''
  }, [keyPrefix])

  const getModel = useCallback((providerId) => {
    return models[providerId] || DEFAULT_MODELS[providerId] || ''
  }, [models])

  const getLabel = useCallback((providerId) => {
    return providerList.find(p => p.id === providerId)?.label
      || DEFAULT_PROVIDER_LABELS[providerId]
      || providerId
  }, [providerList])

  return {
    provider, setProvider,
    models, setModel, getModel,
    keys, setKey, getKey,
    mode, setMode,
    providers: providerList,
    getLabel,
  }
}
