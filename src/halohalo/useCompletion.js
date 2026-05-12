import { useState, useEffect } from 'react'
import { createCompletion } from './createCompletion.js'

export function useCompletion(options = {}) {
  const [instance] = useState(createCompletion)
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
