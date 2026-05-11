# @ulam/ube — router plugin

Part of [@ulam/ube](../../components/ui/README.md). Full documentation lives there.

## Quick reference

```jsx
import { Router, useRouter, Modal, Drawer, BottomSheet } from '@ulam/ube/router'
import {
  useFocusOnMount, useReturnFocus, useFocusTrap,
  usePaginationFocus, useAriaHide, useDir,
  useMediaQuery, usePageTitle, useEscapeKey,
} from '@ulam/ube/router'

// Wrap app
<Router><AppShell /></Router>

// Navigation
const { route, navigate } = useRouter()

// Focus management
const headingRef = useFocusOnMount()
usePageTitle('Page Name')
const dir = useDir() // 'ltr' | 'rtl'
```

Routes are hash fragments: `example.com/#/settings`. Browser back button works natively.
