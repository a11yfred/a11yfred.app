export default function ButtonLink({ href, onClick, className, children, ...rest }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`btn-link${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </a>
  )
}
