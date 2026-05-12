import { forwardRef } from 'react'
import { useFocusOnMount, usePageTitle } from '../../siling-labuyo/index.js'
import PanelShell from './Panel.jsx'

const Panel = forwardRef(function Panel({
  heading,
  onClose,
  closeAriaLabel,
  className,
  pageTitle,
  dir = 'ltr',
  children,
  ...rest
}, ref) {
  const headingRef = useFocusOnMount()
  usePageTitle(pageTitle || heading)

  return (
    <PanelShell
      ref={ref}
      panelClassName={className}
      headerClassName="panel-header"
      titleClassName="panel-title"
      heading={heading}
      headingRef={headingRef}
      onClose={onClose}
      closeAriaLabel={closeAriaLabel}
      dir={dir}
      {...rest}
    >
      {children}
    </PanelShell>
  )
})

export default Panel
