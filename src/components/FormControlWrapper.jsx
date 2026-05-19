/**
 * Form Control Wrapper component factory.
 *
 * These utilities simplify common form control patterns across a11yfred.
 * Consider moving these to @ulam/ube for broader framework-wide applicability.
 */

export function FormControlRow({ label, children, id, variant = '' }) {
  return (
    <div className={`panel-toggle-row${variant ? ` ${variant}` : ''}`}>
      {label && <label htmlFor={id} className="panel-toggle-label">{label}</label>}
      {children}
    </div>
  )
}

export function FormControlCheckboxWrapper({ id, label, checked, onChange, disabled }) {
  return (
    <div className="panel-detail-ai-field-select-item">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  )
}

export function FormControlToggleRow({ id, label, checked, onChange, variant = '' }) {
  return (
    <FormControlRow id={id} label={label} variant={variant}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        role="switch"
        aria-checked={checked}
      />
    </FormControlRow>
  )
}
