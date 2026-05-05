import { useState, useEffect, useRef } from 'react'
import { Search, Star, Pin, Copy, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { usePaginationFocus, useDir, usePageTitle, Modal } from '../plugins/router/index.js'
import { useT } from '../i18n/index.jsx'

const SLIDES = [
  {
    icons: [Search],
    headingKey: 'onboarding.slide_1_heading',
    bodyKey: 'onboarding.slide_1_body',
  },
  {
    icons: [Star, Pin],
    headingKey: 'onboarding.slide_2_heading',
    bodyKey: 'onboarding.slide_2_body',
  },
  {
    icons: [Copy, Sparkles],
    headingKey: 'onboarding.slide_3_heading',
    bodyKey: 'onboarding.slide_3_body',
  },
]

export default function OnboardingPanel({ onClose }) {
  const t = useT()
  const dir = useDir()
  const FwdChevron  = dir === 'rtl' ? ChevronLeft  : ChevronRight
  const BackChevron = dir === 'rtl' ? ChevronRight : ChevronLeft

  const [step, setStep] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const stepHeadingRef = useRef(null)
  usePaginationFocus(stepHeadingRef, step)

  usePageTitle(t('onboarding.heading'))

  const total = SLIDES.length
  const isFirst = step === 0
  const isLast = step === total - 1

  function commitClose() {
    localStorage.setItem('onboardingSeen', '1')
    onClose()
  }

  function handleRequestClose() {
    if (isLast) {
      commitClose()
    } else {
      setConfirmOpen(true)
    }
  }

  // Intercept Escape in capture phase before the Drawer's bubble-phase listener fires,
  // so we can show the confirm modal instead of immediately closing the panel.
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== 'Escape') return
      if (confirmOpen) return // let the confirm Modal handle it
      e.stopImmediatePropagation()
      handleRequestClose()
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [isLast, confirmOpen]) // eslint-disable-line react-hooks/exhaustive-deps -- handleRequestClose reads isLast

  const slide = SLIDES[step]

  return (
    <div className="onboarding-panel">
      <div className="onboarding-header">
        <h2
          tabIndex={-1}
          className="onboarding-title"
        >
          {t('onboarding.heading')}
        </h2>
        <button
          type="button"
          onClick={handleRequestClose}
          aria-label={t('common.close')}
          title={t('common.close')}
          className="btn--icon btn--icon-accent onboarding-close-btn"
        >
          <X size={20} strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>

      <div className="onboarding-content" aria-live="polite" aria-atomic="true">
        <div className="onboarding-step-heading-row">
          <div className="onboarding-icons" aria-hidden="true">
            {slide.icons.map((Icon, i) => (
              <Icon key={i} size={40} strokeWidth={1.5} className="onboarding-icon" />
            ))}
          </div>
          <h3
            ref={stepHeadingRef}
            tabIndex={-1}
            className="onboarding-step-heading"
          >
            {t(slide.headingKey)}
          </h3>
        </div>
        <p className="onboarding-step-body">
          {t(slide.bodyKey)}
        </p>
      </div>

      <nav aria-label={t('onboarding.step_of', { step: step + 1, total })} className="onboarding-nav">
        <button
          type="button"
          className="btn--secondary onboarding-nav-btn btn--height-standard"
          onClick={() => setStep(s => s - 1)}
          aria-label={t('onboarding.prev_aria')}
          disabled={isFirst}
          aria-hidden={isFirst ? 'true' : undefined}
          tabIndex={isFirst ? -1 : undefined}
        >
          <BackChevron size={16} aria-hidden="true" />
          {t('onboarding.back')}
        </button>

        <ol className="onboarding-dots" aria-hidden="true">
          {SLIDES.map((_, i) => (
            <li key={i} className={`onboarding-dot${i === step ? ' onboarding-dot--active' : ''}`} />
          ))}
        </ol>

        <button
          type="button"
          className="btn--primary onboarding-nav-btn onboarding-nav-btn--next btn--height-standard"
          onClick={() => isLast ? commitClose() : setStep(s => s + 1)}
          aria-label={isLast ? t('onboarding.done_aria') : t('onboarding.next_aria')}
        >
          {isLast ? t('onboarding.done') : t('onboarding.next')}
          {!isLast && <FwdChevron size={16} aria-hidden="true" />}
        </button>
      </nav>

      <div className="onboarding-footer">
        <button
          type="button"
          className="btn--tertiary onboarding-skip-btn"
          onClick={handleRequestClose}
        >
          {t('onboarding.skip_tour')}
        </button>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        heading={t('onboarding.confirm_heading')}
        actions={[
          {
            label: t('onboarding.confirm_exit'),
            onClick: () => { setConfirmOpen(false); commitClose() },
            className: 'btn--primary modal-ok-btn',
          },
          {
            label: t('onboarding.confirm_stay'),
            onClick: () => setConfirmOpen(false),
            className: 'btn--secondary modal-ok-btn',
          },
        ]}
      >
        <p>{t('onboarding.confirm_body')}</p>
      </Modal>
    </div>
  )
}
