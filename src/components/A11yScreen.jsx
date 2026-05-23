import React from 'react'
import { Button, Screen as ScreenModule } from '@ulam/ube'
import { RotateCcw } from 'lucide-react'

function DefaultSearchIcon() {
  return (
    <svg aria-hidden="true" width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="22" cy="22" r="14" stroke="var(--border)" strokeWidth="2.5"/>
      <line x1="33" y1="33" x2="47" y2="47" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="14" y1="19" x2="30" y2="19" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
      <line x1="14" y1="23" x2="27" y2="23" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3"/>
      <line x1="14" y1="27" x2="24" y2="27" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 3"/>
    </svg>
  )
}

let ScreenComponent = ScreenModule
if (!ScreenComponent) {
  // Fallback: render as a div if import fails
  ScreenComponent = function FallbackScreen({ variant = 'no-results', ariaLabel, heading, body, activeFilters, action, actionLabel, onMount, children }) {
    React.useEffect(() => {
      onMount?.()
    }, [onMount])

    return (
      <div className={`screen screen--${variant}`} role="region" aria-label={ariaLabel}>
        {heading && <h2 className="screen__heading">{heading}</h2>}
        <DefaultSearchIcon />
        {body && <p className="screen__body">{body}</p>}
        {activeFilters && activeFilters.length > 0 && (
          <div className="screen-filters">
            {activeFilters.map((filter, i) => (
              <span key={i}>{filter.label}</span>
            ))}
          </div>
        )}
        {action && (
          <Button
            variant="primary"
            onClick={action}
            icon={<RotateCcw size={8} aria-hidden="true" />}
          >
            {actionLabel}
          </Button>
        )}
        {children}
      </div>
    )
  }
}

export default ScreenComponent
