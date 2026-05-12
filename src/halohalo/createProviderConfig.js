import { DEFAULT_MODELS, DEFAULT_PROVIDERS, DEFAULT_PROVIDER_LABELS } from './providers.js'
import { getAdapter } from '../sawsawan/platformAdapter.js'

/**
 * Vanilla provider config store — no React required.
 * Returns a plain object with getters, setters, and a subscribe() for change notifications.
 *
 * storageKeys: { provider, modelPrefix, keyPrefix, mode? }
 * providers: optional array of { id, label, defaultModel? }
 */
export function createProviderConfig(storageKeys, providers = DEFAULT_PROVIDERS) {
  const { provider: providerKey, modelPrefix, keyPrefix, mode: modeKey } = storageKeys

  const providerList = providers.map(p =>
    typeof p === 'string' ? { id: p, label: DEFAULT_PROVIDER_LABELS[p] || p } : p
  )

  let provider = getAdapter().readPref(providerKey) || providerList[0]?.id || 'anthropic'

  let models = Object.fromEntries(
    providerList.map(p => [
      p.id,
      getAdapter().readPref(`${modelPrefix}${p.id}`) || p.defaultModel || DEFAULT_MODELS[p.id] || '',
    ])
  )

  let mode = modeKey ? getAdapter().readPref(modeKey) === 'true' : false

  const listeners = new Set()
  const notify = () => listeners.forEach(fn => fn())

  return {
    get provider() { return provider },
    get models() { return { ...models } },
    get mode() { return mode },
    get providers() { return providerList },

    setProvider(id) {
      getAdapter().writePref(providerKey, id)
      provider = id
      notify()
    },

    setModel(providerId, modelId) {
      getAdapter().writePref(`${modelPrefix}${providerId}`, modelId)
      models = { ...models, [providerId]: modelId }
      notify()
    },

    setMode(value) {
      if (!modeKey) return
      getAdapter().writePref(modeKey, value ? 'true' : 'false')
      mode = value
      notify()
    },

    async setKey(providerId, value) {
      await getAdapter().setKey(`${keyPrefix}${providerId}`, value)
    },

    async getKey(providerId) {
      return (await getAdapter().getKey(`${keyPrefix}${providerId}`)) || ''
    },

    getModel(providerId) {
      return models[providerId] || DEFAULT_MODELS[providerId] || ''
    },

    getLabel(providerId) {
      return providerList.find(p => p.id === providerId)?.label
        || DEFAULT_PROVIDER_LABELS[providerId]
        || providerId
    },

    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
  }
}
