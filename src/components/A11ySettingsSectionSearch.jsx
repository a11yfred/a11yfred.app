import { FormControlRadioChip, FormControlToggle, Button } from '@ulam/ube'
import { PinOff, OctagonX, Check } from 'lucide-react'
import { useT } from '../hooks/useTranslate.js'
import { announce } from '@ulam/taho'




import { SETTINGS_FLASH_MS, DEFAULT_WCAG_FILTER } from '../utils/constants.js'

function PendingNote({ t }) {
  return (
    <p className="panel-pending-note">
      <strong>{t('settings.pending_save_note')}</strong>
    </p>
  )
}

function ClearDataRow({ t, labelKey, hasData, descKey, emptyKey, isDone, setIsDone, onClear, labelActionKey, labelDoneKey, Icon, className, announceKey, wrapperClass }) {
  return (
    <div className={`panel-toggle-row ${wrapperClass || ''}`}>
      <div>
        <h3 className="panel-toggle-label">{t(labelKey)}</h3>
        <p className="panel-toggle-desc">{hasData ? t(descKey) : t(emptyKey)}</p>
      </div>
      <Button
        active={isDone}
        icon={<Icon size={14} aria-hidden="true" />}
        activeIcon={<Check size={14} aria-hidden="true" />}
        label={t(labelActionKey)}
        activeLabel={t(labelDoneKey)}
        variant="primary"
        className={className}
        aria-disabled={!hasData ? 'true' : undefined}
        onClick={() => {
          onClear?.()
          setIsDone(true)
          if (announceKey) announce(t(announceKey))
          setTimeout(() => setIsDone(false), SETTINGS_FLASH_MS)
        }}
      >
        {isDone ? t(labelDoneKey) : t(labelActionKey)}
      </Button>
    </div>
  )
}

export default function SettingsSectionSearch({
  platform,
  pendingPlatform,
  setPendingPlatform,
  liveSearch,
  pendingLiveSearch,
  setPendingLiveSearch,
  // showPersonalCorpus,
  // pendingShowPersonalCorpus,
  // setPendingShowPersonalCorpus,
  wcagFilter,
  pendingWcagFilter,
  setPendingWcagFilter,
  showVoting,
  pendingShowVoting,
  setPendingShowVoting,
  hasPins,
  hasStarred,
  hasRankings,
  hasArchived,
  onClearPins,
  onClearStarred,
  onResetRankings,
  onClearArchived,
  unpinAllDone,
  setUnpinAllDone,
  unstarAllDone,
  setUnstarAllDone,
  resetRankingsDone,
  setResetRankingsDone,
  unarchiveAllDone,
  setUnarchiveAllDone,
}) {
  const t = useT()

  return (
    <section className="panel-section">
      <h3 className="panel-section-heading">{t('settings.search_section')}</h3>
      <div className="panel-group">
        <div className="panel-row">
          <div className="panel-row-label">
            <h3 className="panel-field-label">{t('settings.platform_label')}</h3>
            <p className="panel-field-desc">
              {pendingPlatform === 'all' ? <>Show <strong>all results</strong> across web, native apps, and documents.</> :
                pendingPlatform === 'web' ? <>Show <strong>web-oriented</strong> results.</> :
                  pendingPlatform === 'native' ? <>Show <strong>native app-oriented</strong> results.</> :
                    <>Show <strong>document-oriented</strong> results.</>
              }
            </p>
            {pendingPlatform !== platform && <PendingNote t={t} />}
          </div>
          <div className="panel-row-control">
            <fieldset>
              <legend className="sr-only">{t('settings.platform_label')}</legend>
              <div className="radio-chip-group">
                {[
                  { value: 'all', labelKey: 'settings.platform_all', announceKey: 'settings.platform_all_announce' },
                  { value: 'web', labelKey: 'settings.platform_web', announceKey: 'settings.platform_web_announce' },
                  { value: 'native', labelKey: 'settings.platform_native', announceKey: 'settings.platform_native_announce' },
                  { value: 'document', labelKey: 'settings.platform_document', announceKey: 'settings.platform_document_announce' },
                ].map(({ value, labelKey, announceKey }) => (
                  <FormControlRadioChip
                    key={value}
                    name="platform-setting"
                    value={value}
                    label={t(labelKey)}
                    current={pendingPlatform}
                    onChange={(val) => { setPendingPlatform(val); announce(t(announceKey)) }}
                  />
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="panel-group">
        <div className="panel-toggle-row">
          <div className="panel-row-label">
            <label htmlFor="toggle-live-search" className="panel-field-label">{t('settings.live_search_label')}</label>
            <p className="panel-field-desc">{pendingLiveSearch ? <>Results appear <strong>as you type</strong>.</> : <>Results appear on <strong>Search</strong> button press or <strong>Enter</strong> key.</>}</p>
            {pendingLiveSearch !== liveSearch && <PendingNote t={t} />}
          </div>
          <div className="panel-row-control">
            <FormControlToggle id="toggle-live-search" checked={pendingLiveSearch} onChange={() => setPendingLiveSearch(v => !v)} />
          </div>
        </div>
      </div>

      {/* TODO: Unhide personal corpus feature for post-launch
      <div className="panel-section">
        <div className="panel-row">
          <div className="panel-row-label">
            <label htmlFor="toggle-personal-corpus" className="panel-field-label">{t('settings.personal_corpus_label')}</label>
            <p className="panel-field-desc">{pendingShowPersonalCorpus ? <>Your custom findings <strong>appear in search results</strong>.</> : <>Your custom findings <strong>are hidden from results</strong>.</>}</p>
            <PendingNote t={t} visible={pendingShowPersonalCorpus !== showPersonalCorpus} />
          </div>
          <div className="panel-row-control">
            <FormControlToggle id="toggle-personal-corpus" checked={pendingShowPersonalCorpus} onChange={() => setPendingShowPersonalCorpus(v => !v)} />
          </div>
        </div>
      </div>
      */}

      <div className="panel-group">
        <h3 className="panel-group__label">{t('settings.wcag_filter_label')}</h3>
        <p className="panel-group__desc">Filter findings by <strong>WCAG Version</strong> and <strong>Conformance Level</strong>. Each Version includes all findings from previous versions.</p>
        {(pendingWcagFilter.maxVersion !== (wcagFilter?.maxVersion ?? DEFAULT_WCAG_FILTER.maxVersion) ||
          pendingWcagFilter.maxLevel !== (wcagFilter?.maxLevel ?? DEFAULT_WCAG_FILTER.maxLevel)) && <PendingNote t={t} />}
        <div className="settings-wcag-filter-row">
          <fieldset>
            <legend className="panel-radio-legend">{t('settings.wcag_filter_legend')}</legend>
            <div className="panel-radio-group">
              {[
                { value: '2.0', labelKey: 'settings.wcag_filter_20' },
                { value: '2.1', labelKey: 'settings.wcag_filter_21' },
                { value: '2.2', labelKey: 'settings.wcag_filter_22' },
              ].map(({ value, labelKey }) => (
                <label key={value} className="control__label">
                  <input
                    type="radio"
                    name="wcag-version"
                    value={value}
                    checked={(pendingWcagFilter?.maxVersion ?? DEFAULT_WCAG_FILTER.maxVersion) === value}
                    onChange={() => setPendingWcagFilter(f => ({ ...f, maxVersion: value }))}
                    className="control"
                  />
                  {t(labelKey)}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="panel-radio-legend">{t('settings.wcag_level_legend')}</legend>
            <div className="panel-radio-group">
              {[
                { value: 'A', labelKey: 'settings.wcag_level_a' },
                { value: 'AA', labelKey: 'settings.wcag_level_aa' },
                { value: 'AAA', labelKey: 'settings.wcag_level_aaa' },
              ].map(({ value, labelKey }) => (
                <label key={value} className="control__label">
                  <input
                    type="radio"
                    name="wcag-level"
                    value={value}
                    checked={(pendingWcagFilter?.maxLevel ?? DEFAULT_WCAG_FILTER.maxLevel) === value}
                    onChange={() => setPendingWcagFilter(f => ({ ...f, maxLevel: value }))}
                    className="control"
                  />
                  {t(labelKey)}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <ClearDataRow t={t} labelKey="settings.pinned_results_label" hasData={hasPins} descKey="settings.pinned_results_desc" emptyKey="settings.pinned_results_empty" isDone={unpinAllDone} setIsDone={setUnpinAllDone} onClear={onClearPins} labelActionKey="settings.unpin_all" labelDoneKey="settings.unpin_all_done" Icon={PinOff} className="btn-settings" wrapperClass="panel-data-row" />

      <div className="panel-section">
        <div className="panel-toggle-row">
          <div className="panel-row-label">
            <label htmlFor="toggle-ranking" className="panel-field-label">{t('settings.ranking_label')}</label>
            <p className="panel-field-desc">{pendingShowVoting
              ? <>Ranking controls <strong>are visible on each result</strong>.</>
              : <>Ranking controls <strong>are hidden</strong>.</>}
            </p>
            {pendingShowVoting !== showVoting && <PendingNote t={t} />}
          </div>
          <div className="panel-row-control">
            <FormControlToggle id="toggle-ranking" checked={pendingShowVoting} onChange={() => setPendingShowVoting(v => !v)} />
          </div>
        </div>
      </div>

      <ClearDataRow t={t} labelKey="settings.starred_results_label" hasData={hasStarred} descKey="settings.starred_results_desc" emptyKey="settings.starred_results_empty" isDone={unstarAllDone} setIsDone={setUnstarAllDone} onClear={onClearStarred} labelActionKey="settings.unstar_all" labelDoneKey="settings.unstar_all_done" Icon={OctagonX} className="btn-settings" announceKey="settings.unstar_all_done" wrapperClass="panel-data-row" />

      <ClearDataRow t={t} labelKey="settings.rankings_label" hasData={hasRankings} descKey="settings.rankings_desc" emptyKey="settings.rankings_empty" isDone={resetRankingsDone} setIsDone={setResetRankingsDone} onClear={onResetRankings} labelActionKey="settings.reset_rankings" labelDoneKey="settings.reset_rankings_done" Icon={OctagonX} className="btn-settings" announceKey="settings.reset_rankings_done" wrapperClass="panel-data-row" />

      <ClearDataRow t={t} labelKey="settings.archived_results_label" hasData={hasArchived} descKey="settings.archived_results_desc" emptyKey="settings.archived_results_empty" isDone={unarchiveAllDone} setIsDone={setUnarchiveAllDone} onClear={onClearArchived} labelActionKey="settings.unarchive_all" labelDoneKey="settings.unarchive_all_done" Icon={OctagonX} className="btn-settings" announceKey="settings.unarchive_all_done" wrapperClass="panel-data-row" />
    </section>
  )
}
