import RadioChip from './RadioChip.jsx'

/**
 * RadioChipGroup — fieldset + visually hidden legend + RadioChip options.
 *
 * @example
 * <RadioChipGroup
 *   legend="Platform"
 *   name="platform"
 *   value={platform}
 *   onChange={setPlatform}
 *   options={[
 *     { value: 'all',    label: 'All' },
 *     { value: 'web',    label: 'Web' },
 *     { value: 'native', label: 'Native' },
 *   ]}
 * />
 */
export default function RadioChipGroup({ legend, name, value, onChange, options }) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="radio-chip-group">
        {options.map(opt => (
          <RadioChip
            key={opt.value}
            name={name}
            value={opt.value}
            label={opt.label}
            current={value}
            onChange={onChange}
          />
        ))}
      </div>
    </fieldset>
  )
}
