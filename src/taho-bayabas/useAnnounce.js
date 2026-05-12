import { announce } from '../taho/announce.js'

/**
 * Returns the announce() function. Use this inside React components when
 * you prefer hooks-style imports over direct module imports.
 *
 * Both of these are equivalent:
 *
 *   // hook style (inside a component)
 *   const announce = useAnnounce()
 *   announce('Settings: Saved')
 *
 *   // direct import (anywhere — components, handlers, services)
 *   import { announce } from '@ulam/taho'
 *   announce('Settings: Saved')
 */
export function useAnnounce() {
  return announce
}
