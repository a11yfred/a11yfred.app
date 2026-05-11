# @ulam/ube — announce plugin

Part of [@ulam/ube](../../components/ui/README.md). Full documentation lives there.

## Quick reference

```jsx
import { Announcer, announce, useAnnounce } from '@ulam/ube/announce'

// Mount once at app root
<Announcer />

// Direct call from any module
announce('Settings: Saved')
announce('Error: Invalid key', { priority: 'assertive' })

// Hook style
const announce = useAnnounce()
announce('Copy: Copied to clipboard')
```

Priority: `'polite'` (default) waits for a pause. `'assertive'` interrupts immediately — errors only.

Prefix messages with context: `"Settings: Saved"` not `"Saved"`.
