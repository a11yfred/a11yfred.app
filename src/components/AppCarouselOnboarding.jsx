import { Button, FadeTransition } from '@ulam/ube'
import { useState, useRef, useEffect } from 'react'
import { Search, Star, Copy, CircleArrowLeft, CircleArrowRight, Hand, ClipboardPaste } from 'lucide-react'
import { useFocusOnMount, usePaginationFocus, useDir, Dialog, useKeydown } from '@ulam/sili/react'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { announce } from '@ulam/taho'
import { useT } from '../hooks/useTranslate.js'

import { LS_ONBOARDING_SEEN } from '../utils/constants.js'
import { setStorage } from '../utils/storage.js'
import './app-carousel-onboarding.css'

const randomAngle = () => Math.floor(Math.random() * 360)

const SLIDES = [
  {
    Icon: null,
    headingKey: 'onboarding.welcome_heading',
    bodyKey: 'onboarding.welcome_body',
    isWelcome: true,
  },
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

export default function AppCarouselOnboarding({ onClose }) {
  const t = useT()
  const dir = useDir()
  const FwdArrow  = dir === 'rtl' ? CircleArrowLeft  : CircleArrowRight
  const BackArrow = dir === 'rtl' ? CircleArrowRight : CircleArrowLeft

  const [step, setStep] = useState(0)
  const [slideDir, setSlideDir] = useState('ltr')
  const [gradAngle, setGradAngle] = useState(() => randomAngle())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const titleRef = useFocusOnMount()
  const stepHeadingRef = useRef(null)
  usePaginationFocus(stepHeadingRef, step)

  const total = SLIDES.length
  const currentSlide = SLIDES[step]
  const slideHeading = currentSlide.isWelcome ? null : t(currentSlide.headingKey)
  const pageTitle = slideHeading || t('onboarding.heading')

  usePageTitle(pageTitle)

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

  useKeydown((e) => {
    if (e.key !== 'Escape') return
    if (confirmOpen) return
    e.stopImmediatePropagation()
    handleRequestClose()
  }, { capture: true })

  const slide = SLIDES[step]
  const SlideIcon = slide.Icon

  return (
    <div className="onboarding-panel page-panel" style={{ '--onboarding-grad-angle': `${gradAngle}deg` }}>
      <div className="onboarding-deco" aria-hidden="true">
        <Hand size={64} className="onboarding-deco__icon" />
        <ClipboardPaste size={64} className="onboarding-deco__icon" />
      </div>

      <div className="onboarding-header">
        <h1 id="onboarding-title" ref={titleRef} tabIndex={-1} className="onboarding-title" style={slide.isWelcome ? { visibility: 'hidden', height: 0, margin: 0 } : {}}>
          {t('onboarding.heading')}
        </h1>
      </div>

      <div className="onboarding-content">
        <FadeTransition watchKey={step} className="onboarding-slide" direction={slideDir}>
          {slide.isWelcome && (
            <h1 ref={stepHeadingRef} tabIndex={-1} className="onboarding-step-heading">
              {t(slide.headingKey)}
            </h1>
          )}
          {!slide.isWelcome && (
            <h2 ref={stepHeadingRef} tabIndex={-1} className="onboarding-step-heading">
              <SlideIcon size={36} strokeWidth={1.5} className="onboarding-step-icon" aria-hidden="true" />
              {t(slide.headingKey)}
            </h2>
          )}
          <p className="onboarding-step-body">
            {t(slide.bodyKey)}
          </p>
        </FadeTransition>
      </div>

      <div className="onboarding-nav">
        {isFirst
          ? <span className="onboarding-arrow-placeholder" aria-hidden="true" />
          : (
            <button
              type="button"
              className="onboarding-arrow-btn"
              onClick={() => { setGradAngle(randomAngle()); setSlideDir('rtl'); setStep(s => { const next = s - 1; announce(t('onboarding.step_of', { step: next + 1, total })); return next }) }}
              aria-label={t('onboarding.prev_aria_label')}
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
          onClick={() => isLast ? commitClose() : (setGradAngle(randomAngle()), setSlideDir('ltr'), setStep(s => { const next = s + 1; announce(t('onboarding.step_of', { step: next + 1, total })); return next }))}
          aria-label={isLast ? t('onboarding.done_aria_label') : t('onboarding.next_aria_label')}
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

      <Dialog
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
      </Dialog>
    </div>
  )
}
