import { forwardRef } from 'react'
import ButtonBack from './ButtonBack.jsx'

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
        <ButtonBack onClick={onClose} ariaLabel={closeAriaLabel} dir={dir} />
        <h2 ref={headingRef} tabIndex={-1} className={titleClassName}>
          {heading}
        </h2>
      </div>
      {children}
    </div>
  )
})

export default Panel
