/**
 * SettingRow — label + optional description + control (toggle, select, etc.)
 *
 * Covers both panel-toggle-row (inline control) and panel-group (block content below).
 * The distinction is just layout: inline puts children beside the label,
 * block puts children below.
 *
 * @example — toggle row
 * <SettingRow label={<label htmlFor="tog">Live search</label>} description="Results appear as you type.">
 *   <Toggle id="tog" checked={v} onChange={setV} />
 * </SettingRow>
 *
 * @example — group (block children)
 * <SettingRow label="Theme" description="Choose your colour scheme." block>
 *   <RadioChipGroup ... />
 * </SettingRow>
 */
export default function SettingRow({ label, description, children, block = false, disabled = false, sm = false }) {
  const rowClass = [
    block ? 'panel-group' : 'panel-toggle-row',
    !block && sm ? 'panel-toggle-row--sm' : '',
    !block && disabled ? 'panel-toggle-row--disabled' : '',
  ].filter(Boolean).join(' ')

  const labelClass = block ? 'panel-group__label' : 'panel-toggle-label'
  const descClass  = block ? 'panel-group__desc'  : 'panel-toggle-desc'

  return (
    <div className={rowClass}>
      <div>
        <h3 className={labelClass}>{label}</h3>
        {description && <p className={descClass}>{description}</p>}
      </div>
      {children && (block
        ? <div>{children}</div>
        : children
      )}
    </div>
  )
}
