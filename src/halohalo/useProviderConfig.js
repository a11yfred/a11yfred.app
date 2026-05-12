import { useState, useCallback, useEffect, useRef } from 'react'
import { createProviderConfig } from './createProviderConfig.js'

export function useProviderConfig(storageKeys, providers) {
  const configRef = useRef(null)
  if (!configRef.current) {
    configRef.current = createProviderConfig(storageKeys, providers)
  }
  const config = configRef.current

  const [, rerender] = useState(0)
  useEffect(() => config.subscribe(() => rerender(n => n + 1)), [config])

  return {
    provider: config.provider,
    models: config.models,
    mode: config.mode,
    providers: config.providers,
    setProvider: useCallback((id) => config.setProvider(id), [config]),
    setModel: useCallback((pid, mid) => config.setModel(pid, mid), [config]),
    setMode: useCallback((v) => config.setMode(v), [config]),
    setKey: useCallback((pid, v) => config.setKey(pid, v), [config]),
    getKey: useCallback((pid) => config.getKey(pid), [config]),
    getModel: useCallback((pid) => config.getModel(pid), [config]),
    getLabel: useCallback((pid) => config.getLabel(pid), [config]),
  }
}
