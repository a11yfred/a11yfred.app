export default function RadioChip({ name, value, label, current, onChange }) {
  const isActive = current === value
  return (
    <label className={`radio-chip${isActive ? ' radio-chip--active' : ''}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={isActive}
        onChange={() => onChange(value)}
        className="radio-chip__input"
        aria-label={label.replace(/\n/g, ' ')}
      />
      <span className="radio-chip__indicator" aria-hidden="true" />
      <span aria-hidden="true">
        {label.split('\n').flatMap((part, i) => i === 0 ? [part] : [<br key={i} />, part])}
      </span>
    </label>
  )
}
