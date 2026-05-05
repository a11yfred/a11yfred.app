export default function Toggle({ id, checked, onChange }) {
  return (
    <span className="toggle">
      <input
        type="checkbox"
        role="switch"
        id={id}
        checked={checked}
        onChange={onChange}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onChange(e) } }}
        className="toggle__input"
      />
      <span aria-hidden="true" role="presentation" className="toggle__track">
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
