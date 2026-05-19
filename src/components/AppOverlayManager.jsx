import { Button } from '@ulam/ube'
import { useMemo, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import { OverlayManager } from '@ulam/sili/react'

import { URL_PRIVACY_POLICY } from '../utils/constants.js'

/**
 * App-level overlay manager for a11yfred.
 * Orchestrates all overlays: app-level (viewAll, pendingEntry, pendingPrivacy)
 * and settings panel (privacy, language, unsaved, reset, fiesta).
 * Delegates rendering to sili's OverlayManager.
 */
export default function AppOverlayManager({
  t,
  // App-level overlays
  viewAllConfirmOpen,
  onViewAllConfirmClose,
  onViewAllConfirm,
  viewAllDontAsk: _viewAllDontAsk,
  onViewAllDontAskChange: _onViewAllDontAskChange,
  viewAllConfirmContent,
  viewAllTriggerRef,
  pendingEntry,
  onPendingEntryClose,
  onPendingEntryConfirm,
  pendingPrivacy,
  onPendingPrivacyClose,
  onPendingPrivacyConfirm,
  // Settings panel overlays
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
  // Determine which overlay should be open (single active overlay at a time)
  const activeId = useMemo(() => {
    // App-level overlays have priority
    if (viewAllConfirmOpen) return 'viewAllConfirm'
    if (pendingEntry) return 'pendingEntry'
    if (pendingPrivacy) return 'pendingPrivacy'
    // Settings panel overlays
    if (privacyOpen) return 'privacy'
    if (rhgPending) return 'rhg'
    if (unsavedOpen) return 'unsaved'
    if (resetConfirmOpen) return 'reset'
    if (noChangesOpen) return 'noChanges'
    if (fiestaConfirmOpen) return 'fiesta'
    return null
  }, [viewAllConfirmOpen, pendingEntry, pendingPrivacy, privacyOpen, rhgPending, unsavedOpen, resetConfirmOpen, noChangesOpen, fiestaConfirmOpen])

  // Generic close handler that routes to specific handlers
  const handleClose = useCallback(() => {
    const closeHandlers = {
      viewAllConfirm: onViewAllConfirmClose,
      pendingEntry: onPendingEntryClose,
      pendingPrivacy: onPendingPrivacyClose,
      privacy: onPrivacyClose,
      rhg: onRhgClose,
      unsaved: onUnsavedClose,
      reset: onResetClose,
      noChanges: onNoChangesClose,
      fiesta: onFiestaClose,
    }
    closeHandlers[activeId]?.()
  }, [activeId, onViewAllConfirmClose, onPendingEntryClose, onPendingPrivacyClose, onPrivacyClose, onRhgClose, onUnsavedClose, onResetClose, onNoChangesClose, onFiestaClose])

  // Build overlay config array for OverlayManager
  const overlays = useMemo(() => [
    // App-level overlays
    {
      id: 'viewAllConfirm',
      type: 'dialog',
      heading: t('search.view_all_confirm_heading'),
      returnFocusRef: viewAllTriggerRef,
      actions: [
        { label: t('search.view_all_confirm_yes'), onClick: onViewAllConfirm, className: 'btn--primary' },
        { label: t('search.view_all_confirm_no'), onClick: handleClose, className: 'btn--secondary' },
      ],
      content: viewAllConfirmContent,
    },
    {
      id: 'pendingEntry',
      type: 'dialog',
      heading: t('detail.discard_confirm_heading'),
      actions: [
        {
          label: t('detail.discard_confirm_yes'),
          onClick: onPendingEntryConfirm,
          className: 'btn--warning',
        },
        {
          label: t('detail.discard_confirm_no'),
          onClick: handleClose,
          className: 'btn--tertiary',
        },
      ],
      content: <p>{t('detail.discard_confirm_body')}</p>,
    },
    {
      id: 'pendingPrivacy',
      type: 'dialog',
      heading: t('detail.discard_confirm_heading'),
      actions: [
        {
          label: t('detail.discard_nav_yes'),
          onClick: onPendingPrivacyConfirm,
          className: 'btn--warning',
        },
        {
          label: t('detail.discard_nav_no'),
          onClick: handleClose,
          className: 'btn--tertiary',
        },
      ],
      content: <p>{t('detail.discard_nav_body')}</p>,
    },
    // Settings panel overlays
    {
      id: 'privacy',
      type: 'sheet',
      label: t('settings.privacy_heading'),
      heading: t('settings.privacy_heading'),
      collapsed: privacyCollapsed,
      onCollapse: setPrivacyCollapsed,
      hideCloseBottom: true,
      returnFocusRef: privacyButtonRef,
      initialFocusContainer: true,
      content: (
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
      ),
    },
    {
      id: 'reset',
      type: 'sheet',
      label: t('settings.confirm_reset_all_heading'),
      heading: t('settings.confirm_reset_all_heading'),
      hideCloseBottom: true,
      initialFocusContainer: true,
      content: (
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
      ),
    },
    {
      id: 'rhg',
      type: 'dialog',
      heading: t('settings.language_rhg_heading'),
      content: (
        <>
          <p>{t('settings.language_rhg_body_1')}</p>
          <p>{t('settings.language_rhg_body_2')}</p>
        </>
      ),
      actions: [
        { label: t('settings.language_rhg_use_anyway'), onClick: onRhgUseAnyway, className: 'btn--primary' },
        { label: t('common.cancel'), onClick: handleClose, className: 'btn--tertiary' },
      ],
    },
    {
      id: 'unsaved',
      type: 'dialog',
      heading: t('settings.unsaved_heading'),
      content: <p>{t('settings.unsaved_body')}</p>,
      actions: [
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
      ],
    },
    {
      id: 'noChanges',
      type: 'dialog',
      heading: t('settings.no_changes_heading'),
      content: <p>{t('settings.no_changes_body')}</p>,
      returnFocusRef: saveButtonRef,
      actions: [
        {
          label: t('common.ok'),
          onClick: handleClose,
          className: 'btn--primary',
        },
      ],
    },
    {
      id: 'fiesta',
      type: 'dialog',
      heading: t('settings.party_confirm_heading'),
      content: <p>{t('settings.party_confirm_body')}</p>,
      actions: [
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
      ],
    },
  ], [t, viewAllConfirmContent, viewAllTriggerRef, onViewAllConfirm, onPendingEntryConfirm, onPendingPrivacyConfirm, privacyCollapsed, setPrivacyCollapsed, onRhgUseAnyway, handleClose, onUnsavedSaveAndClose, onUnsavedDiscard, onFiestaConfirm, saveButtonRef, privacyButtonRef, onResetConfirm])

  return <OverlayManager overlays={overlays} activeId={activeId} onClose={handleClose} />
}
