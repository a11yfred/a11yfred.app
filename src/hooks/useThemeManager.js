// Canonical implementation: @ulam/ube — theme.js
// This file is a11yfred's thin wrapper that wires in app-specific sounds.
import { useThemeManager as useThemeManagerLib, applyTheme } from '@ulam/ube'
import { playPartySound, playSqueak } from '../utils/fiestaSounds.js'
import { FIESTA_SQUEAK_FREQUENCY, LS_THEME } from '../utils/constants.js'
import { setStorage } from '../utils/storage.js'

export { applyTheme }

/**
 * Manages theme application and persistence, with party mode sound effects.
 * Thin wrapper around @ulam/ube's useThemeManager that adds app-specific
 * party mode sounds and localStorage persistence.
 *
 * @param {'auto' | 'light' | 'dark' | 'fiesta'} theme - The theme to apply
 * @param {Function} [announceFiesta] - Callback to announce when party mode activates
 */
export default function useThemeManager(theme, announceFiesta) {
  // Persist theme choice
  if (typeof window !== 'undefined') setStorage(LS_THEME, theme)

  useThemeManagerLib(theme, {
    onFiestaActivated: announceFiesta,
    onFiestaClick:     playPartySound,
    onFiestaKey:       playSqueak,
    keyFrequency:      FIESTA_SQUEAK_FREQUENCY,
    keyTargetId:       'entry-search',
  })
}
