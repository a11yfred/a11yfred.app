import { forwardRef } from 'react'
import BackButton from './BackButton.jsx'

const Panel = forwardRef(function Panel({
  panelClassName,
  headerClassName,
  titleClassName,
  heading,
  headingRef,
  onClose,
  closeAriaLabel,
  children,
  dir = 'ltr',
  ...rest
}, ref) {
  return (
    <div ref={ref} className={panelClassName} {...rest}>
      <div className={headerClassName}>
        <BackButton onClick={onClose} ariaLabel={closeAriaLabel} dir={dir} />
        <h2 ref={headingRef} tabIndex={-1} className={titleClassName}>
          {heading}
        </h2>
      </div>
      {children}
    </div>
  )
})

export default Panel
