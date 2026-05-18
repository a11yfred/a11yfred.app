import { Button, Select, RadioChip, InputWithClear, InfoBox } from '@ulam/ube'
import { Link, Check, Filter, OctagonX, Trash2, Pin, Star, Archive, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useT } from '@ulam/calamansi/react'





import { CLIPBOARD_TIMEOUT, SORT_FLASH_MS } from '../utils/constants.js'

export default function ResultsMetaHeader({
  displayCount,
  query,
  onCopyLink,
  linkCopied,
  setLinkCopied,
  sortBy,
  pendingSort,
  setPendingSort,
  onSortChange,
  setSortToCommit,
  setSortFlash,
  sortFlash,
  showRankingSort,
  narrowMode,
  narrowResults,
  narrowQuery,
  onNarrowChange,
  onNarrowSearch,
  liveSearch,
  onOpenSettings,
  onNarrow,
  onNarrowExit,
  platform,
  onPlatformChange,
  results,
  platformLabels,
  onClear,
  countHeadingRef,
  hasAnyActiveFilter,
  hideCount = false,
  hideFilters = false,
}) {
  const t = useT()

  if (hideCount && hideFilters) return null

  const getSortInfo = () => {
    const infoLabel = t('detail.note_label')
    switch (sortBy) {
      case 'smart':
        return <InfoBox label={infoLabel} className="results-sort-info">{t('results.sort_smart_info')}</InfoBox>
      case 'wcag-level':
        return <InfoBox label={infoLabel} className="results-sort-info">{t('results.sort_wcag_level_info')}</InfoBox>
      case 'popularity':
        return <InfoBox label={infoLabel} className="results-sort-info">{t('results.sort_popularity_info')}</InfoBox>
      default:
        return null
    }
  }

  return (
    <div className="results-meta">
      <>
        <div className="results-count-row">
            <h2
              ref={countHeadingRef}
              tabIndex={-1}
              className="results-count"
            >
              {displayCount}
            </h2>
            {onCopyLink && (
              <Button
                active={linkCopied}
                icon={<Link size={14} aria-hidden="true" />}
                activeIcon={<Check size={14} aria-hidden="true" />}
                label={t('results.copy_link_aria')}
                activeLabel={t('results.copied_link')}
                variant="secondary"
                className="results-copy-link-btn"
                title={linkCopied ? t('results.copied_link') : t('results.copy_link')}
                onClick={() => {
                  onCopyLink()
                  setLinkCopied(true)
                  setTimeout(() => setLinkCopied(false), CLIPBOARD_TIMEOUT)
                }}
              >
                {linkCopied ? t('results.copied_link') : t('results.copy_link')}
              </Button>
            )}
          </div>
          {onSortChange && results.length > 0 && getSortInfo()}
          {onSortChange && results.length > 0 && (showRankingSort || liveSearch) && (
            <p className="results-rank-hint">
              {showRankingSort && <>
                {'Pin '}
                <Pin size={14} className="rank-hint-icon" aria-hidden="true" />
                {' to show on every page. Star '}
                <Star size={14} className="rank-hint-icon" aria-hidden="true" />
                {' to always show first. Archive '}
                <Archive size={14} className="rank-hint-icon" aria-hidden="true" />
                {' to always show last. Rank up '}
                <ThumbsUp size={14} className="rank-hint-icon" aria-hidden="true" />
                {' or rank down '}
                <ThumbsDown size={14} className="rank-hint-icon" aria-hidden="true" />
                {' to fine-tune the rest. Sort order is applied last. All actions can be '}
                <a href="#/settings" className="rank-hint-link">{t('results.rank_hint_undone')}</a>
                {'.'}
              </>}
              {showRankingSort && liveSearch && ' '}
              {liveSearch && <span className="results-sort-live-hint">
                <strong>{'Live Search is '}
                  <button
                    type="button"
                    className="rank-hint-link rank-hint-link--inline"
                    onClick={() => {
                      onOpenSettings?.()
                      setTimeout(() => document.getElementById('toggle-live-search')?.focus(), 300)
                    }}
                  >ON</button>
                  {': Results will sort immediately after entering or making a selection change.'}
                </strong>
              </span>}
            </p>
          )}

          <div className="results-actions-row">
            {onSortChange && (
              <div className={`results-sort-group${results.length > 0 ? ' results-sort-group--visible' : ''}`}>
                <div className="results-sort-controls">
                  <label htmlFor="results-sort" className="results-sort-label">{t('results.sort_label')}</label>
                  <Select
                    id="results-sort"
                    value={liveSearch ? sortBy : pendingSort}
                    onChange={e => {
                      if (liveSearch) {
                        onSortChange(e.target.value)
                      } else {
                        setPendingSort(e.target.value)
                      }
                    }}
                    wrapClass="results-sort-select-wrap"
                  >
                    <option value="smart">{t('results.sort_smart')}</option>
                    {query && <option value="relevance">{t('results.sort_relevance')}</option>}
                    <option value="severity-desc">{t('results.sort_severity_desc')}</option>
                    <option value="severity-asc">{t('results.sort_severity_asc')}</option>
                    <option value="title-az">{t('results.sort_title_az')}</option>
                    <option value="title-za">{t('results.sort_title_za')}</option>
                    <option value="sc">{t('results.sort_sc')}</option>
                    <option value="wcag-version">{t('results.sort_wcag_version')}</option>
                    <option value="wcag-level">{t('results.sort_wcag_level')}</option>
                    <option value="platform">{t('results.sort_platform')}</option>
                    <option value="popularity">{t('results.sort_popularity')}</option>
                  </Select>
                  {!liveSearch && (
                    <Button
                      variant="primary"
                      active={sortFlash}
                      disabled={pendingSort === sortBy}
                      className="results-sort-btn"
                      onClick={() => {
                        setSortToCommit(pendingSort)
                        setSortFlash(true)
                        setTimeout(() => setSortFlash(false), SORT_FLASH_MS)
                      }}
                    >
                      {sortFlash && <Check size={16} aria-hidden="true" />}
                      <span>{sortFlash ? t('results.sorted_confirm') : t('results.sort_apply')}</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
            <div className="results-filter-btns">
              {results.length > 0 && onNarrow && (
                <Button
                  variant="secondary"
                  className="results-narrow-btn"
                  title={narrowMode ? t('search.exit_narrow_aria') : t('results.narrow_title')}
                  onClick={narrowMode ? onNarrowExit : onNarrow}
                >
                  {narrowMode ? (
                    <>
                      <OctagonX size={16} aria-hidden="true" />
                      <span>{t('search.exit_narrow')}</span>
                    </>
                  ) : (
                    <>
                      <Filter size={16} aria-hidden="true" />
                      <span>{t('results.narrow_results')}</span>
                    </>
                  )}
                </Button>
              )}
              {onClear && (
                <Button
                  variant="tertiary"
                  className={`results-clear-btn${results.length > 0 ? ' results-clear-btn--visible' : ''}`}
                  title={t('results.clear_all_results')}
                  icon={<Trash2 size={14} aria-hidden="true" />}
                  disabled={!hasAnyActiveFilter}
                  onClick={onClear}
                >
                  {t('results.clear_all_results')}
                </Button>
              )}
            </div>
          </div>

          {onNarrowChange && (
            <div
              className={`results-narrow-input-section${narrowMode ? ' results-narrow-input-section--visible' : ''}`}
              aria-hidden={!narrowMode || undefined}
              inert={!narrowMode || undefined}
            >
              <label
                htmlFor="narrow-filter"
                className={`results-narrow-label${!query && !narrowQuery ? ' results-narrow-label--dimmed' : ''}`}
              >
                {t('search.narrowing_results')}
              </label>
              <div className={`results-narrow-row${!query && !narrowQuery ? ' results-narrow-row--dimmed' : ''}`}>
                <InputWithClear
                  id="narrow-filter"
                  type="text"
                  value={narrowQuery}
                  onChange={onNarrowChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !liveSearch && onNarrowSearch) {
                      onNarrowSearch()
                    }
                  }}
                  onClear={() => onNarrowChange('')}
                  placeholder={!query && !narrowQuery ? t('search.narrow_placeholder_needs_query') : narrowResults ? t('search.narrow_placeholder', { count: results.length }) : t('search.narrow_placeholder_default')}
                  clearAriaLabel={t('search.narrow_clear_aria')}
                  wrapClassName="results-narrow-input-wrap"
                  inputClassName={`results-narrow-input${narrowQuery ? ' results-narrow-input--has-value' : ''}`}
                  clearButtonClassName="btn--primary input-clear-btn"
                  disabled={!query && !narrowQuery}
                />
                {!liveSearch && (
                  <Button
                    onClick={onNarrowSearch}
                    disabled={narrowQuery.length < 2 || (!query && !narrowQuery)}
                    variant="primary"
                    className="results-narrow-submit-btn btn--input-height"
                  >
                    {t('search.narrow_button')}
                  </Button>
                )}
              </div>
            </div>
          )}
          {onPlatformChange && narrowMode && (
            <fieldset className="results-narrow-platform-group">
              <legend className="results-narrow-platform-legend">{t('results.narrow_platform_label')}</legend>
              <div className="radio-chip-group">
                {Object.entries(platformLabels).map(([value, label]) => (
                  <RadioChip
                    key={value}
                    name="narrow-platform"
                    value={value}
                    label={label}
                    current={sortBy === 'platform' ? 'all' : platform}
                    onChange={(val) => {
                      if (val === 'all') {
                        onPlatformChange('all')
                        if (sortBy === 'platform') onSortChange('smart')
                      } else {
                        onPlatformChange(val)
                        onSortChange('platform')
                      }
                    }}
                  />
                ))}
              </div>
            </fieldset>
          )}
          {onPlatformChange && narrowMode && <hr className="results-narrow-divider" aria-hidden="true" />}
        </>
    </div>
  )
}
