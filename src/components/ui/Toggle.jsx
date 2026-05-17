import { useAriaDisabledKeydown } from './useAriaDisabled.js'

export default function Toggle({ id, checked, onChange, disabled }) {
  const handleKeyDown = useAriaDisabledKeydown(disabled)
  return (
    <span className="toggle">
      <input
        type="checkbox"
        role="switch"
        id={id}
        disabled={disabled}
        checked={checked}
        onChange={e => !disabled && onChange(e.target.checked)}
        onKeyDown={e => {
          handleKeyDown(e)
          if (e.key === 'Enter' && !disabled) onChange(!checked)
        }}
        className="toggle__input"
      />
      <span aria-hidden="true" className="toggle__track">
        <span role="presentation" className="toggle__thumb">
          {checked
            ? <span role="presentation" className="toggle__check" />
            : <span role="presentation" className="toggle__ring" />
          }
        </span>
      </span>
    </span>
  )
}
