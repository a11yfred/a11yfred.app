/**
 * PanelRowSetting — label + optional description + control (toggle, select, etc.)
 *
 * Covers both panel-toggle-row (inline control) and panel-group (block content below).
 * The distinction is just layout: inline puts children beside the label,
 * block puts children below.
 *
 * @example — toggle row
 * <PanelRowSetting label={<label htmlFor="tog">Live search</label>} description="Results appear as you type.">
 *   <Toggle id="tog" checked={v} onChange={setV} />
 * </PanelRowSetting>
 *
 * @example — group (block children)
 * <PanelRowSetting label="Theme" description="Choose your colour scheme." block>
 *   <RadioChipGroup ... />
 * </PanelRowSetting>
 */
import { Children } from 'react'

export default function PanelRowSetting({ label, description, children, block = false, disabled = false, sm = false }) {
  const rowClass = [
    block ? 'panel-group' : 'panel-toggle-row',
    !block && sm ? 'panel-toggle-row--sm' : '',
    !block && disabled ? 'panel-toggle-row--disabled' : '',
  ].filter(Boolean).join(' ')

  const labelClass = block ? 'panel-group__label' : 'panel-toggle-label'
  const descClass  = block ? 'panel-group__desc'  : 'panel-toggle-desc'

  if (block) {
    return (
      <div className={rowClass}>
        <div>
          <h3 className={labelClass}>{label}</h3>
          {description && <p className={descClass}>{description}</p>}
        </div>
        {children && <div>{children}</div>}
      </div>
    )
  }

  // Inline (toggle) layout: last child is the control (col 2 row 1),
  // any earlier children (e.g. PendingNote) go inside the label column.
  const childArray = Children.toArray(children).filter(Boolean)
  const control = childArray.at(-1)
  const notes = childArray.slice(0, -1)

  return (
    <div className={rowClass}>
      <div>
        <h3 className={labelClass}>{label}</h3>
        {description && <p className={descClass}>{description}</p>}
        {notes}
      </div>
      {control}
    </div>
  )
}
