import { useState, useEffect, useRef } from 'react'
import { Search, Star, Copy, CircleArrowLeft, CircleArrowRight, Hand, ClipboardPaste } from 'lucide-react'
import { usePaginationFocus, useDir, usePageTitle, Modal } from '../plugins/router/index.js'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'
import Button from './ui/Button.jsx'
import { LS_ONBOARDING_SEEN } from '../utils/constants.js'
import { setStorage } from '../utils/storage.js'

const randomAngle = () => Math.floor(Math.random() * 360)

const SLIDES = [
  {
    Icon: Search,
    headingKey: 'onboarding.slide_1_heading',
    bodyKey: 'onboarding.slide_1_body',
  },
  {
    Icon: Star,
    headingKey: 'onboarding.slide_2_heading',
    bodyKey: 'onboarding.slide_2_body',
  },
  {
    Icon: Copy,
    headingKey: 'onboarding.slide_3_heading',
    bodyKey: 'onboarding.slide_3_body',
  },
]

export default function OnboardingPanel({ onClose }) {
  const t = useT()
  const dir = useDir()
  const FwdArrow  = dir === 'rtl' ? CircleArrowLeft  : CircleArrowRight
  const BackArrow = dir === 'rtl' ? CircleArrowRight : CircleArrowLeft

  const [step, setStep] = useState(0)
  const [gradAngle, setGradAngle] = useState(() => randomAngle())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const titleRef = useRef(null)
  const stepHeadingRef = useRef(null)
  usePaginationFocus(stepHeadingRef, step)

  useEffect(() => { titleRef.current?.focus() }, [])

  usePageTitle(t('onboarding.heading'))

  const total = SLIDES.length
  const isFirst = step === 0
  const isLast = step === total - 1

  function commitClose() {
    setStorage(LS_ONBOARDING_SEEN, '1')
    onClose()
  }

  function handleRequestClose() {
    if (isLast) {
      commitClose()
    } else {
      setConfirmOpen(true)
    }
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== 'Escape') return
      if (confirmOpen) return
      e.stopImmediatePropagation()
      handleRequestClose()
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [isLast, confirmOpen]) // eslint-disable-line react-hooks/exhaustive-deps -- handleRequestClose reads isLast

  const slide = SLIDES[step]
  const SlideIcon = slide.Icon

  return (
    <div className="onboarding-panel" style={{ '--onboarding-grad-angle': `${gradAngle}deg` }}>
      <div className="onboarding-deco" aria-hidden="true">
        <Hand size={64} className="onboarding-deco__icon" />
        <ClipboardPaste size={64} className="onboarding-deco__icon" />
      </div>

      <div className="onboarding-header">
        <h1 id="onboarding-title" ref={titleRef} tabIndex={-1} className="onboarding-title">
          {t('onboarding.heading')}
        </h1>
      </div>

      <div className="onboarding-content">
        <h2 ref={stepHeadingRef} tabIndex={-1} className="onboarding-step-heading">
          <SlideIcon size={36} strokeWidth={1.5} className="onboarding-step-icon" aria-hidden="true" />
          {t(slide.headingKey)}
        </h2>
        <p className="onboarding-step-body">
          {t(slide.bodyKey)}
        </p>
      </div>

      <div className="onboarding-nav">
        {isFirst
          ? <span className="onboarding-arrow-placeholder" aria-hidden="true" />
          : (
            <button
              type="button"
              className="onboarding-arrow-btn"
              onClick={() => { setGradAngle(randomAngle()); setStep(s => { const next = s - 1; announce(t('onboarding.step_of', { step: next + 1, total })); return next }) }}
              aria-label={t('onboarding.prev_aria')}
            >
              <BackArrow size={36} aria-hidden="true" />
            </button>
          )
        }

        <ol className="onboarding-dots" aria-hidden="true">
          {SLIDES.map((_, i) => (
            <li key={i} className={`onboarding-dot${i === step ? ' onboarding-dot--active' : ''}`} />
          ))}
        </ol>

        <button
          type="button"
          className="onboarding-arrow-btn"
          onClick={() => isLast ? commitClose() : (setGradAngle(randomAngle()), setStep(s => { const next = s + 1; announce(t('onboarding.step_of', { step: next + 1, total })); return next }))}
          aria-label={isLast ? t('onboarding.done_aria') : t('onboarding.next_aria')}
        >
          <FwdArrow size={36} aria-hidden="true" />
        </button>
      </div>

      <div className="onboarding-footer">
        <Button
          variant="tertiary"
          className="onboarding-skip-btn"
          onClick={handleRequestClose}
        >
          {t('onboarding.skip_tour')}
        </Button>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        heading={t('onboarding.confirm_heading')}
        actions={[
          {
            label: t('common.close'),
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
