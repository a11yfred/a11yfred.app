import { useState, useEffect, useRef } from 'react'
import { createCompletion } from './createCompletion.js'

export function useCompletion(options = {}) {
  const instanceRef = useRef(null)
  if (!instanceRef.current) {
    instanceRef.current = createCompletion()
  }
  const instance = instanceRef.current

  const [state, setState] = useState({ loading: false, animating: false })
  useEffect(() => instance.subscribe(setState), [instance])

  useEffect(() => () => instance.cancel(), [instance])

  return {
    loading: state.loading,
    animating: state.animating,
    complete: (callOptions) => instance.complete({ ...options, ...callOptions }),
    cancel: () => instance.cancel(),
  }
}
