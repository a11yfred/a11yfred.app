// Hook for managing aria-disabled keyboard interaction
// Prevents Space and Enter keys from activating disabled form controls
export function useAriaDisabledKeydown(isDisabled) {
  return (e) => {
    if (isDisabled && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault()
    }
  }
}
