export default function Toggle({ id, checked, onChange, disabled }) {
  return (
    <span className="toggle">
      <input
        type="checkbox"
        role="switch"
        id={id}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onChange(!checked) } }}
        className="toggle__input"
        disabled={disabled}
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
