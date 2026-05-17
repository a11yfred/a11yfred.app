import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal, Sheet } from '@ulam/sili/react'
import Button from './ui/Button.jsx'
import { URL_PRIVACY_POLICY } from '../utils/constants.js'

export default function ManagerModalsSheets({
  t,
  privacyOpen,
  privacyCollapsed,
  setPrivacyCollapsed,
  onPrivacyClose,
  privacyButtonRef,
  rhgPending,
  onRhgClose,
  onRhgUseAnyway,
  unsavedOpen,
  onUnsavedClose,
  onUnsavedSaveAndClose,
  onUnsavedDiscard,
  resetConfirmOpen,
  onResetClose,
  onResetConfirm,
  noChangesOpen,
  onNoChangesClose,
  saveButtonRef,
  fiestaConfirmOpen,
  onFiestaClose,
  onFiestaConfirm,
}) {
  // Determine which modal/sheet should be open
  const activeModal = useMemo(() => {
    if (privacyOpen) return 'privacy'
    if (rhgPending) return 'rhg'
    if (unsavedOpen) return 'unsaved'
    if (resetConfirmOpen) return 'reset'
    if (noChangesOpen) return 'noChanges'
    if (fiestaConfirmOpen) return 'fiesta'
    return null
  }, [privacyOpen, rhgPending, unsavedOpen, resetConfirmOpen, noChangesOpen, fiestaConfirmOpen])

  // Handle close based on modal type
  const handleClose = () => {
    switch (activeModal) {
      case 'privacy':
        onPrivacyClose()
        break
      case 'rhg':
        onRhgClose()
        break
      case 'unsaved':
        onUnsavedClose()
        break
      case 'reset':
        onResetClose()
        break
      case 'noChanges':
        onNoChangesClose()
        break
      case 'fiesta':
        onFiestaClose()
        break
      default:
        break
    }
  }

  // Render Sheet content based on modal type
  const renderSheetContent = () => {
    switch (activeModal) {
      case 'privacy':
        return (
          <>
            <h2 className="sheet-heading">{t('settings.privacy_heading')}</h2>
            <h3 className="panel-subheading">{t('settings.privacy_subhead_storage')}</h3>
            <p>{t('settings.privacy_body_1')}</p>
            <p>{t('settings.privacy_body_2')}</p>
            <h3 className="panel-subheading">{t('settings.privacy_subhead_translations')}</h3>
            <p>{t('settings.privacy_body_translations')}</p>
            <p><a href={URL_PRIVACY_POLICY} target="_blank" rel="noreferrer">{t('settings.privacy_full_policy')}<span className="sr-only"> (opens in new tab)</span></a></p>
            <div className="panel-detail-actions-end">
              <button className="btn btn--primary panel-detail-close-btn" onClick={handleClose}>
                {t('common.close')}
              </button>
            </div>
          </>
        )
      case 'reset':
        return (
          <div className="settings-reset-sheet">
            <h2 className="sheet-heading">{t('settings.confirm_reset_all_heading')}</h2>

            <div className="alert-banner alert-banner--warning">
              <AlertTriangle size={18} aria-hidden="true" />
              <p>{t('settings.confirm_reset_all_intro')}</p>
            </div>

            <div className="settings-reset-section">
              <h3>{t('settings.confirm_reset_all_will_clear')}</h3>
              <ul className="settings-reset-list">
                <li>{t('settings.confirm_reset_all_item_api_keys')}</li>
                <li>{t('settings.confirm_reset_all_item_frequency')}</li>
                <li>{t('settings.confirm_reset_all_item_recent')}</li>
              </ul>
            </div>

            <div className="settings-reset-section">
              <h3>{t('settings.confirm_reset_all_will_reset')}</h3>
              <ul className="settings-reset-list">
                <li>{t('settings.confirm_reset_all_keep_item_theme')}</li>
                <li>{t('settings.confirm_reset_all_keep_item_language')}</li>
                <li>{t('settings.confirm_reset_all_keep_item_platform')}</li>
                <li>{t('settings.confirm_reset_all_keep_item_live_search')}</li>
                <li>{t('settings.confirm_reset_all_keep_item_wcag_filter')}</li>
                <li>{t('settings.confirm_reset_all_keep_item_pins')}</li>
                <li>{t('settings.confirm_reset_all_keep_item_ranking_controls')}</li>
                <li>{t('settings.confirm_reset_all_keep_item_starred')}</li>
                <li>{t('settings.confirm_reset_all_keep_item_ranking_data')}</li>
                <li>{t('settings.confirm_reset_all_keep_item_archived')}</li>
                <li>{t('settings.confirm_reset_all_keep_item_ai_enabled')}</li>
              </ul>
            </div>

            <div className="settings-reset-section">
              <h3>{t('settings.confirm_reset_all_will_keep')}</h3>
              <ul className="settings-reset-list">
                <li>{t('settings.confirm_reset_all_keep_item_corpus')}</li>
                <li>{t('settings.confirm_reset_all_keep_item_contributions')}</li>
              </ul>
            </div>

            <div className="settings-reset-actions">
              <Button
                variant="primary"
                onClick={onResetConfirm}
              >
                {t('settings.confirm_reset_all_yes')}
              </Button>
              <Button
                variant="secondary"
                onClick={handleClose}
              >
                {t('settings.confirm_reset_all_no')}
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Render Modal content based on modal type
  const renderModalContent = () => {
    switch (activeModal) {
      case 'rhg':
        return (
          <>
            <p>{t('settings.language_rhg_body_1')}</p>
            <p>{t('settings.language_rhg_body_2')}</p>
          </>
        )
      case 'unsaved':
        return <p>{t('settings.unsaved_body')}</p>
      case 'noChanges':
        return <p>{t('settings.no_changes_body')}</p>
      case 'fiesta':
        return <p>{t('settings.party_confirm_body')}</p>
      default:
        return null
    }
  }

  // Get Modal actions based on type
  const getModalActions = () => {
    switch (activeModal) {
      case 'rhg':
        return [
          { label: t('settings.language_rhg_use_anyway'), onClick: onRhgUseAnyway, className: 'btn--primary' },
          { label: t('common.cancel'), onClick: handleClose, className: 'btn--tertiary' },
        ]
      case 'unsaved':
        return [
          {
            label: t('settings.unsaved_save_close'),
            onClick: onUnsavedSaveAndClose,
            className: 'btn--primary',
          },
          {
            label: t('settings.unsaved_discard'),
            onClick: onUnsavedDiscard,
            className: 'btn--secondary',
          },
          {
            label: t('settings.unsaved_cancel'),
            onClick: handleClose,
            className: 'btn--tertiary',
          },
        ]
      case 'noChanges':
        return []
      case 'fiesta':
        return [
          {
            label: t('settings.party_confirm_yes'),
            onClick: onFiestaConfirm,
            className: 'btn--primary',
          },
          {
            label: t('settings.party_confirm_no'),
            onClick: handleClose,
            className: 'btn--tertiary',
          },
        ]
      default:
        return []
    }
  }

  // Get Modal heading based on type
  const getModalHeading = () => {
    switch (activeModal) {
      case 'rhg':
        return t('settings.language_rhg_heading')
      case 'unsaved':
        return t('settings.unsaved_heading')
      case 'noChanges':
        return t('settings.no_changes_heading')
      case 'fiesta':
        return t('settings.party_confirm_heading')
      default:
        return ''
    }
  }

  const isSheetActive = activeModal === 'privacy' || activeModal === 'reset'
  const isModalActive = activeModal === 'rhg' || activeModal === 'unsaved' || activeModal === 'noChanges' || activeModal === 'fiesta'

  return (
    <>
      {/* Single Sheet */}
      {isSheetActive && (
        <Sheet
          open={true}
          onClose={handleClose}
          collapsed={activeModal === 'privacy' ? privacyCollapsed : false}
          onCollapse={(collapsed) => {
            if (activeModal === 'privacy') setPrivacyCollapsed(collapsed)
          }}
          label={activeModal === 'privacy' ? t('settings.privacy_heading') : t('settings.confirm_reset_all_heading')}
          heading={activeModal === 'privacy' ? t('settings.privacy_heading') : t('settings.confirm_reset_all_heading')}
          closeLabel={t('common.close')}
          returnFocusRef={activeModal === 'privacy' ? privacyButtonRef : null}
          hideCloseBottom={activeModal === 'reset'}
        >
          {renderSheetContent()}
        </Sheet>
      )}

      {/* Single Modal */}
      {isModalActive && (
        <Modal
          open={true}
          onClose={handleClose}
          heading={getModalHeading()}
          actions={getModalActions()}
          returnFocusRef={activeModal === 'noChanges' ? saveButtonRef : null}
        >
          {renderModalContent()}
        </Modal>
      )}
    </>
  )
}
