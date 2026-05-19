# aria-disabled Migration Guide for a11yfred

## Overview

The @ulam/ube framework now implements a unified `aria-disabled` pattern for all controls. This guide helps a11yfred migrate from mixed `:disabled` pseudo-class and custom class patterns to the consistent aria-disabled approach.

## Why Migrate

- **Consistency**: Single pattern across all controls (native and custom)
- **Accessibility**: Proper screen reader announcements and keyboard handling
- **Tab Order**: Disabled elements stay focusable (no `tabindex="-1"` removal)
- **Reduced Complexity**: No more mixing native `disabled` + custom classes
- **User Preferences**: Automatic support for `prefers-reduced-transparency`

## Migration Strategy

### Option 1: Use @ulam/ube Components (Recommended)

Replace custom buttons with ube buttons when possible:

```jsx
// ❌ Old: custom button component
<ResultRankBtn disabled={disabled} onClick={handleClick} />

// ✅ New: ube button with aria-disabled
import ButtonIcon from '@ulam/ube'
<ButtonIcon disabled={disabled} onClick={handleClick} icon={...} />
```

### Option 2: Migrate Custom Components to aria-disabled

For custom components that must stay, add aria-disabled support:

**Before:**

```tsx
// Custom button using native disabled
export function ResultRankBtn({ disabled, onClick, ...props }) {
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      ↑
    </button>
  )
}
```

**After:**

```tsx
// Custom button using aria-disabled
import { setAriaDisabled } from '@ulam/ube'

export function ResultRankBtn({ disabled, onClick, ...props }) {
  const ref = useRef(null)
  
  useEffect(() => {
    if (ref.current) {
      setAriaDisabled(ref.current, disabled)
    }
  }, [disabled])
  
  return (
    <button 
      ref={ref}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      ↑
    </button>
  )
}
```

## CSS Migration

### Step 1: Consolidate Disabled Selectors

**app-screen-results.css:**

```css
/* ❌ Old selectors */
.result-rank-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.result-rank-btn:not(:disabled):hover {
  color: var(--text-heading);
}

/* ✅ New selectors */
.result-rank-btn[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-rank-btn:not([aria-disabled="true"]):hover {
  color: var(--text-heading);
}

/* ✅ For reduced transparency support */
@media (prefers-reduced-transparency: reduce) {
  .result-rank-btn[aria-disabled="true"] {
    opacity: 1;
    background-color: var(--border);
    border-color: var(--text-disabled);
  }
}
```

### Step 2: Remove Legacy Class Patterns

```css
/* ❌ Remove these */
.search-input-field--disabled,
input.search-input--disabled {
  opacity: 1;
  color: var(--text-disabled);
}

/* ✅ Replace with */
input[aria-disabled="true"] {
  opacity: 0.5;
  color: var(--text-disabled);
}

@media (prefers-reduced-transparency: reduce) {
  input[aria-disabled="true"] {
    opacity: 1;
    background-color: var(--border);
  }
}
```

## Checklist for a11yfred Components

- [ ] **ResultRankBtn** — migrate to aria-disabled
- [ ] **ResultPinBtn** — migrate to aria-disabled
- [ ] **ResultsClearBtn** — migrate to aria-disabled
- [ ] **PanelDetailCopyBtn** — migrate to aria-disabled
- [ ] **SearchInputSubmit** — use ube button or add aria-disabled
- [ ] **app-screen-results.css** — update selectors from `:disabled` to `[aria-disabled="true"]`
- [ ] **app-carousel-onboarding.css** — consolidate mixed patterns
- [ ] **app-drawer-panel-admin.css** — update custom inputs
- [ ] **Remove class-based patterns** — `.search-input-field--disabled`, `.result-rank-btn--disabled`, etc.

## Testing After Migration

1. **Keyboard Navigation**: Tab to disabled button, verify Space/Enter doesn't activate
2. **Visual State**: Verify disabled appearance (opacity or color contrast)
3. **Screen Reader**: Verify control announced as disabled
4. **Reduced Transparency**: Enable in OS, verify alternative styling
5. **Hover/Active**: Verify hover and active states suppressed

## Resources

- ube DISABLED_STATE_GUIDE.md
- ube core/ariaDisabled.js
- [ARIA Authoring Practices - Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

## Questions?

Refer to @ulam/ube documentation or the DISABLED_STATE_GUIDE.md for detailed patterns and usage.
