import { AlertTriangle } from 'lucide-react'
import { Modal, Sheet } from '@ulam/sili/react'
import Button from './ui/Button.jsx'
import { URL_PRIVACY_POLICY } from '../utils/constants.js'

function SheetPrivacy({
  t,
  open,
  onClose,
  collapsed,
  onCollapse,
  privacyButtonRef,
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      collapsed={collapsed}
      onCollapse={onCollapse}
      label={t('settings.privacy_heading')}
      heading={t('settings.privacy_heading')}
      closeLabel={t('common.close')}
      returnFocusRef={privacyButtonRef}
      hideCloseBottom
    >
      <h2 className="sheet-heading">{t('settings.privacy_heading')}</h2>
      <h3 className="panel-subheading">{t('settings.privacy_subhead_storage')}</h3>
      <p>{t('settings.privacy_body_1')}</p>
      <p>{t('settings.privacy_body_2')}</p>
      <h3 className="panel-subheading">{t('settings.privacy_subhead_translations')}</h3>
      <p>{t('settings.privacy_body_translations')}</p>
      <p><a href={URL_PRIVACY_POLICY} target="_blank" rel="noreferrer">{t('settings.privacy_full_policy')}<span className="sr-only"> (opens in new tab)</span></a></p>
      <div className="panel-detail-actions-end">
        <button className="btn btn--primary panel-detail-close-btn" onClick={onClose}>
          {t('common.close')}
        </button>
      </div>
    </Sheet>
  )
}

function ModalWarningRhg({
  t,
  open,
  onClose,
  onUseAnyway,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      heading={t('settings.language_rhg_heading')}
      actions={[
        { label: t('settings.language_rhg_use_anyway'), onClick: onUseAnyway, className: 'btn--primary' },
        { label: t('common.cancel'), onClick: onClose, className: 'btn--tertiary' },
      ]}
    >
      <p>{t('settings.language_rhg_body_1')}</p>
      <p>{t('settings.language_rhg_body_2')}</p>
    </Modal>
  )
}

function ModalChangesUnsaved({
  t,
  open,
  onClose,
  onSaveAndClose,
  onDiscard,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      heading={t('settings.unsaved_heading')}
      actions={[
        {
          label: t('settings.unsaved_save_close'),
          onClick: onSaveAndClose,
          className: 'btn--primary',
        },
        {
          label: t('settings.unsaved_discard'),
          onClick: onDiscard,
          className: 'btn--secondary',
        },
        {
          label: t('settings.unsaved_cancel'),
          onClick: onClose,
          className: 'btn--tertiary',
        },
      ]}
    >
      <p>{t('settings.unsaved_body')}</p>
    </Modal>
  )
}

function SheetConfirmReset({
  t,
  open,
  onClose,
  onConfirm,
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      label={t('settings.confirm_reset_all_heading')}
      closeLabel={t('common.close')}
      hideCloseBottom={true}
    >
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
            onClick={onConfirm}
          >
            {t('settings.confirm_reset_all_yes')}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            {t('settings.confirm_reset_all_no')}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

function ModalChangesNone({
  t,
  open,
  onClose,
  saveButtonRef,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      returnFocusRef={saveButtonRef}
      heading={t('settings.no_changes_heading')}
    >
      <p>{t('settings.no_changes_body')}</p>
    </Modal>
  )
}

function ModalConfirmFiesta({
  t,
  open,
  onClose,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      heading={t('settings.party_confirm_heading')}
      actions={[
        {
          label: t('settings.party_confirm_yes'),
          onClick: onConfirm,
          className: 'btn--primary',
        },
        {
          label: t('settings.party_confirm_no'),
          onClick: onClose,
          className: 'btn--tertiary',
        },
      ]}
    >
      <p>{t('settings.party_confirm_body')}</p>
    </Modal>
  )
}

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
  return (
    <>
      <SheetPrivacy
        t={t}
        open={privacyOpen}
        onClose={onPrivacyClose}
        collapsed={privacyCollapsed}
        onCollapse={setPrivacyCollapsed}
        privacyButtonRef={privacyButtonRef}
      />

      <ModalWarningRhg
        t={t}
        open={rhgPending}
        onClose={onRhgClose}
        onUseAnyway={onRhgUseAnyway}
      />

      <ModalChangesUnsaved
        t={t}
        open={unsavedOpen}
        onClose={onUnsavedClose}
        onSaveAndClose={onUnsavedSaveAndClose}
        onDiscard={onUnsavedDiscard}
      />

      <SheetConfirmReset
        t={t}
        open={resetConfirmOpen}
        onClose={onResetClose}
        onConfirm={onResetConfirm}
      />

      <ModalChangesNone
        t={t}
        open={noChangesOpen}
        onClose={onNoChangesClose}
        saveButtonRef={saveButtonRef}
      />

      <ModalConfirmFiesta
        t={t}
        open={fiestaConfirmOpen}
        onClose={onFiestaClose}
        onConfirm={onFiestaConfirm}
      />
    </>
  )
}
