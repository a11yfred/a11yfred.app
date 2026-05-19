import { FormControlCheckbox } from '@ulam/ube'

export default function FieldCheckbox({ label, checked, onChange, disabled, id }) {
  return (
    <div className="panel-detail-ai-field-select-item">
      <FormControlCheckbox
        id={id}
        label={label}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
      />
    </div>
  )
}
