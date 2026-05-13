// Canonical implementation: @ulam/ube — theme.js
// This file is a11yfred's thin wrapper that wires in app-specific sounds.
import { useThemeManager as useThemeManagerLib, applyTheme } from '@ulam/ube'
import { playPartySound, playSqueak } from '../utils/fiestaSounds.js'
import { FIESTA_SQUEAK_FREQUENCY } from '../utils/constants.js'
import { setStorage } from '../utils/storage.js'
import { LS_THEME } from '../utils/constants.js'

export { applyTheme }

export default function useThemeManager(theme, announceFiesta) {
  // Persist theme choice
  if (typeof window !== 'undefined') setStorage(LS_THEME, theme)

  useThemeManagerLib(theme, {
    onFiestaActivated: announceFiesta,
    onFiestaClick:     playPartySound,
    onFiestaKey:       playSqueak,
    keyFrequency:      FIESTA_SQUEAK_FREQUENCY,
    keyTargetId:       'finding-search',
  })
}
