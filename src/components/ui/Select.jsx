import { ChevronDown } from 'lucide-react'

export default function Select({ id, value, onChange, disabled, wrapClass, children, ...rest }) {
  return (
    <div className={`settings-select-wrap${wrapClass ? ` ${wrapClass}` : ''}`}>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="settings-select"
        {...rest}
      >
        {children}
      </select>
      <ChevronDown size={14} aria-hidden="true" className="settings-select-chevron" />
    </div>
  )
}
