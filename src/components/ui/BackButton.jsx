import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function BackButton({ onClick, ariaLabel, className = 'btn--icon btn--icon-accent', dir = 'ltr' }) {
  const Chevron = dir === 'rtl' ? ChevronRight : ChevronLeft
  return (
    <button onClick={onClick} aria-label={ariaLabel} className={className}>
      <Chevron size={20} strokeWidth={2.5} aria-hidden="true" />
    </button>
  )
}
