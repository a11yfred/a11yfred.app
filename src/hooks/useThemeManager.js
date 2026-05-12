// Canonical implementation: @ulam/ube — theme.js
// This file is a11yhelper's thin wrapper that wires in app-specific sounds.
import { useThemeManager as useThemeManagerLib, applyTheme } from '../components/ui/theme.js'
import { playPartySound, playSqueak } from '../utils/partySounds.js'
import { PARTY_SQUEAK_FREQUENCY } from '../utils/constants.js'
import { setStorage } from '../utils/storage.js'
import { LS_THEME } from '../utils/constants.js'

export { applyTheme }

export default function useThemeManager(theme, announceParty) {
  // Persist theme choice
  if (typeof window !== 'undefined') setStorage(LS_THEME, theme)

  useThemeManagerLib(theme, {
    onPartyActivated: announceParty,
    onPartyClick:     playPartySound,
    onPartyKey:       playSqueak,
    keyFrequency:     PARTY_SQUEAK_FREQUENCY,
    keyTargetId:      'finding-search',
  })
}
