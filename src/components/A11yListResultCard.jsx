import { Star, ThumbsUp, ThumbsDown, Archive, ArchiveRestore, Pin, PinOff, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Fragment } from 'react'
import { announce } from '@ulam/taho'
import { useT } from '@ulam/calamansi/react'
import { SEVERITY_VARS } from '../data/severityStyles.js'
import ButtonIcon from './ui/ButtonIcon.jsx'
import Badge from './ui/Badge.jsx'
import LinkSkipTo from './ui/LinkSkipTo.jsx'
import entrySlug from '../utils/entrySlug.js'
import { DEFAULT_RATING, DESC_PREVIEW_LENGTH, TITLE_TRUNCATE_LENGTH, SWIPE_THRESHOLD, SWIPE_REVEAL, SWIPE_ACTIVATE, SWIPE_PIN_FLASH_MS, PIN_FLY_MS, UNPIN_FLY_MS, ARCHIVE_FLY_MS, UNARCHIVE_FLY_MS, RANK_ANIM_MS } from '../utils/constants.js'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function truncateAtWord(text, maxLength) {
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…'
}

function triggerButtonAnimation(btn, id, setAnimating) {
  btn.classList.remove('animating')
  void btn.offsetWidth
  btn.classList.add('animating')
  setAnimating(s => new Set(s).add(id))
  setTimeout(() => {
    btn.classList.remove('animating')
    setAnimating(s => { const n = new Set(s); n.delete(id); return n })
  }, RANK_ANIM_MS)
}

export default function A11yListResultCard({
  entry,
  index,
  selected,
  onSelect,
  displayResults,
  showRanking,
  showRankingSort,
  onPin,
  onRankUp,
  onRankDown,
  onStar,
  onArchive,
  onBadgeClick,
  ratings,
  pinnedIds,
  animatingUp,
  animatingDown,
  archivingIds,
  unarchivingIds,
  pinningIds,
  unpinningIds,
  setAnimatingUp,
  setAnimatingDown,
  setArchivingIds,
  setUnarchivingIds,
  setPinningIds,
  setUnpinningIds,
  swipeOpenId,
  setSwipeOpenId,
  swipeTouchRef,
  itemRefs,
  snapshotPositions,
}) {
  const t = useT()
  const { score, starred, archived } = ratings[entry.id] || DEFAULT_RATING
  const p = SEVERITY_VARS[entry.severity] || SEVERITY_VARS['Best Practice']
  const pinned = pinnedIds.has(entry.id)

  const truncDesc = entry.desc.length > DESC_PREVIEW_LENGTH
    ? entry.desc.slice(0, DESC_PREVIEW_LENGTH).trimEnd() + '…'
    : entry.desc

  const cardLabel = archived
    ? t('results.archived_label', { title: entry.title })
    : `${entry.title}, ${t(p.key)}, ${entry.primarySC}, ${truncDesc}`

  const shortTitle = truncateAtWord(entry.title, TITLE_TRUNCATE_LENGTH)
  const isSelected = selected?.id === entry.id

  function handleRankUp(e) {
    e.stopPropagation()
    if (!prefersReducedMotion) snapshotPositions()
    triggerButtonAnimation(e.currentTarget, entry.id, setAnimatingUp)
    onRankUp?.(entry.id)
    announce(t('announce.ranked_up', { title: entry.title, score: score + 1 }))
  }

  function handleRankDown(e) {
    e.stopPropagation()
    if (!prefersReducedMotion) snapshotPositions()
    triggerButtonAnimation(e.currentTarget, entry.id, setAnimatingDown)
    onRankDown?.(entry.id)
    announce(t('announce.ranked_down', { title: entry.title, score: score - 1 }))
  }

  function handleStar(e) {
    e.stopPropagation()
    onStar?.(entry.id)
  }

  function handleArchive(e) {
    e.stopPropagation()
    const idx = displayResults.indexOf(entry)
    const next = displayResults[idx + 1] || displayResults[idx - 1]
    const nextId = next?.id
    if (!archived) {
      announce(t('announce.archived'), { priority: 'assertive' })
      if (prefersReducedMotion || displayResults.length === 1) {
        onArchive?.(entry.id)
        if (nextId) requestAnimationFrame(() => itemRefs.current[nextId]?.focus())
      } else {
        setArchivingIds(s => new Set(s).add(entry.id))
        setTimeout(() => {
          onArchive?.(entry.id)
          setArchivingIds(s => { const n = new Set(s); n.delete(entry.id); return n })
          if (nextId) requestAnimationFrame(() => itemRefs.current[nextId]?.focus())
        }, ARCHIVE_FLY_MS)
      }
    } else {
      announce(t('announce.unarchived'), { priority: 'assertive' })
      if (prefersReducedMotion || displayResults.length === 1) {
        onArchive?.(entry.id)
      } else {
        setUnarchivingIds(s => new Set(s).add(entry.id))
        setTimeout(() => {
          onArchive?.(entry.id)
          setUnarchivingIds(s => { const n = new Set(s); n.delete(entry.id); return n })
        }, UNARCHIVE_FLY_MS)
      }
    }
  }

  function handlePin(e) {
    e.stopPropagation()
    announce(pinned
      ? t('announce.unpinned', { title: entry.title })
      : t('announce.pinned', { title: entry.title })
    )
    if (prefersReducedMotion) {
      onPin?.(entry.id)
    } else if (!pinned) {
      setPinningIds(s => new Set(s).add(entry.id))
      setTimeout(() => {
        onPin?.(entry.id)
        setPinningIds(s => { const n = new Set(s); n.delete(entry.id); return n })
      }, PIN_FLY_MS)
    } else {
      setUnpinningIds(s => new Set(s).add(entry.id))
      setTimeout(() => {
        onPin?.(entry.id)
        setUnpinningIds(s => { const n = new Set(s); n.delete(entry.id); return n })
      }, UNPIN_FLY_MS)
    }
  }

  function handleSwipeTouchStart(e) {
    const t = e.touches[0]
    swipeTouchRef.current = { startX: t.clientX, startY: t.clientY, id: entry.id, moved: false }
  }

  function handleSwipeTouchEnd(e) {
    const touch = swipeTouchRef.current
    if (!touch || touch.id !== entry.id) return
    swipeTouchRef.current = null
    const el = e.currentTarget.querySelector('.result-swipe-wrap')
    if (!el) return
    const leftPanel = e.currentTarget.querySelector('.result-action-panel--left')
    if (leftPanel) leftPanel.style.width = ''
    const rightPanel = e.currentTarget.querySelector('.result-action-panel--right')
    if (rightPanel) rightPanel.style.width = ''
    const current = new DOMMatrix(getComputedStyle(el).transform).m41
    el.style.transition = ''
    const swipeIsOpen = swipeOpenId?.id === entry.id
    const swipeSide = swipeIsOpen ? swipeOpenId.side : null
    const base = swipeIsOpen ? (swipeSide === 'left' ? -SWIPE_REVEAL : SWIPE_REVEAL) : 0
    const delta = current - base
    if (delta < -SWIPE_THRESHOLD) {
      setSwipeOpenId({ id: entry.id, side: 'left' })
    } else if (onPin && current >= SWIPE_ACTIVATE) {
      if (!archived) {
        const row = e.currentTarget
        const flashClass = pinned ? 'result-row--unpin-flash' : 'result-row--pin-flash'
        row.classList.add(flashClass)
        setTimeout(() => {
          row.classList.remove(flashClass)
          setSwipeOpenId(null)
          announce(pinned
            ? t('announce.unpinned', { title: entry.title })
            : t('announce.pinned', { title: entry.title })
          )
          if (prefersReducedMotion) {
            onPin?.(entry.id)
          } else if (!pinned) {
            setPinningIds(s => new Set(s).add(entry.id))
            setTimeout(() => {
              onPin?.(entry.id)
              setPinningIds(s => { const n = new Set(s); n.delete(entry.id); return n })
            }, PIN_FLY_MS)
          } else {
            setUnpinningIds(s => new Set(s).add(entry.id))
            setTimeout(() => {
              onPin?.(entry.id)
              setUnpinningIds(s => { const n = new Set(s); n.delete(entry.id); return n })
            }, UNPIN_FLY_MS)
          }
        }, SWIPE_PIN_FLASH_MS)
      } else {
        setSwipeOpenId(null)
      }
    } else if (delta > SWIPE_THRESHOLD) {
      setSwipeOpenId({ id: entry.id, side: 'right' })
    } else {
      setSwipeOpenId(null)
    }
    el.style.transform = ''
  }

  const nextEntry = displayResults[index + 1] ?? displayResults[0]
  const skipHref = `#result-${nextEntry.id}`

  function handleSkipToNext(e) {
    e.preventDefault()
    itemRefs.current[nextEntry.id]?.focus()
  }

  const swipeIsOpen = swipeOpenId?.id === entry.id
  const swipeSide = swipeIsOpen ? swipeOpenId.side : null
  const swipeClass = swipeIsOpen ? ` result-row--swipe-${swipeSide}` : ''

  return (
    <Fragment key={entry.id}>
      <li
        id={`result-${entry.id}`}
        data-swipe-id={entry.id}
        data-flip-id={entry.id}
        className={`result-row${archived ? ' result-row--archived' : ''}${swipeClass}${pinningIds.has(entry.id) ? ' result-row--pinning' : ''}${unpinningIds.has(entry.id) ? ' result-row--unpinning' : ''}${archivingIds.has(entry.id) ? ' result-row--archiving' : ''}${unarchivingIds.has(entry.id) ? ' result-row--unarchiving' : ''}`}
        style={{ '--result-i': index }}
        onTouchStart={(showRanking || onPin) ? handleSwipeTouchStart : undefined}
        onTouchEnd={(showRanking || onPin) ? handleSwipeTouchEnd : undefined}
      >
        <div className="result-swipe-wrap">
          <div className="result-card-wrap">
            {(showRanking || onPin) && (
              <div className="result-swipe-hint" aria-hidden="true">
                {onPin && <ChevronsRight size={18} className="result-swipe-hint__chevron result-swipe-hint__chevron--left" aria-hidden="true" />}
                {showRanking && !pinned && <ChevronsLeft size={18} className="result-swipe-hint__chevron result-swipe-hint__chevron--right" aria-hidden="true" />}
              </div>
            )}
            <a
              ref={el => { if (el) itemRefs.current[entry.id] = el }} // eslint-disable-line react-hooks/immutability -- intentional, safe mutation in callback ref
              data-entry-id={entry.id}
              href={`#/entry/${entry.id}/${entrySlug(entry.title)}`}
              aria-label={cardLabel}
              onClick={e => {
                e.preventDefault()
                if (swipeIsOpen) { setSwipeOpenId(null); return }
                if (!archived) onSelect?.(entry, e.currentTarget)
              }}
              onKeyDown={e => {
                if (e.key === 'ArrowDown') { e.preventDefault(); itemRefs.current[displayResults[index + 1]?.id]?.focus() }
                if (e.key === 'ArrowUp')   { e.preventDefault(); itemRefs.current[displayResults[index - 1]?.id]?.focus() }
              }}
              className={`result-item${isSelected ? ' result-item--selected' : ''}${starred ? ' result-item--starred' : ''}${pinned ? ' result-item--pinned' : ''}${onPin ? ' result-item--pinnable' : ''}`}
            >
              <div className="result-item__header">
                <span className="result-item__title">
                  {entry.title}
                </span>
                <span className="result-item__badges">
                  <Badge
                    variant="severity"
                    bg={archived ? undefined : p.bg}
                    color={archived ? undefined : p.color}
                    prefix={entry.severity !== 'Best Practice' ? t('badge.severity_prefix') : undefined}
                  >
                    {t(p.key)}
                  </Badge>
                  {entry.creditNames?.map(src => (
                    <Badge
                      key={src}
                      variant="source"
                      prefix={t('badge.source_prefix')}
                      title={`Source: ${src}`}
                    >
                      {src}
                    </Badge>
                  ))}
                  {entry.wcagVersion && (
                    <Badge
                      variant="wcag"
                      title={`${t('badge.wcag_prefix')}${entry.wcagVersion}`}
                      aria-label={`${t('badge.wcag_prefix')}${entry.wcagVersion}, ${t('results.badge_filter_aria')}`}
                      onClick={() => onBadgeClick?.({ type: 'wcag', value: entry.wcagVersion })}
                      tabIndex={-1}
                    >
                      {entry.wcagVersion}
                    </Badge>
                  )}
                  {entry.wcagLevel && (
                    <Badge
                      variant="wcag-level"
                      title={`${t('badge.level_prefix')}${entry.wcagLevel}`}
                      aria-label={`${t('badge.level_prefix')}${entry.wcagLevel}, ${t('results.badge_filter_aria')}`}
                      onClick={() => onBadgeClick?.({ type: 'wcag-level', value: entry.wcagLevel })}
                      tabIndex={-1}
                    >
                      {entry.wcagLevel}
                    </Badge>
                  )}
                </span>
              </div>

              <div className="result-item__sc">{entry.primarySC}</div>

              <div className="result-item__desc">{entry.desc}</div>
            </a>

            {showRankingSort && index < displayResults.length - 1 && (
              <LinkSkipTo
                href={skipHref}
                tabIndex={archived ? -1 : 0}
                onClick={handleSkipToNext}
                onFocus={(e) => {
                  const row = e.currentTarget.closest('li.result-row')
                  if (row) row.classList.add('result-row--skip-focused')
                }}
                onBlur={(e) => {
                  const row = e.currentTarget.closest('li.result-row')
                  if (row) row.classList.remove('result-row--skip-focused')
                }}
              >
                {t('results.skip_to_next')}
              </LinkSkipTo>
            )}
            {onPin && (
              <ButtonIcon
                variant="tertiary"
                label={pinned ? t('results.unpin', { title: shortTitle }) : t('results.pin', { title: shortTitle })}
                disabled={archived}
                onClick={handlePin}
                icon={pinned
                  ? <PinOff size={14} aria-hidden="true" fill="currentColor" />
                  : <Pin size={14} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} />
                }
                className={`result-pin-btn${pinned ? ' result-pin-btn--active' : ''}`}
              />
            )}
          </div>

          {showRanking && !pinned && <div className="result-rank-col">
            <ButtonIcon
              variant="tertiary"
              label={starred ? t('results.unstar', { title: shortTitle }) : t('results.star', { title: shortTitle })}
              disabled={archived}
              onClick={handleStar}
              icon={<Star size={13} aria-hidden="true" fill={starred ? 'currentColor' : 'none'} />}
              className={`result-rank-btn result-rank-btn--star${starred ? ' result-rank-btn--active' : ''}`}
            />

            {!pinned && <>
              <ButtonIcon
                variant="tertiary"
                label={t('results.rank_up', { title: shortTitle })}
                disabled={archived}
                onClick={handleRankUp}
                icon={<ThumbsUp size={14} aria-hidden="true" fill={animatingUp.has(entry.id) ? 'currentColor' : 'none'} />}
                className="result-rank-btn result-rank-btn--up"
              />

              <span
                className="result-rank-score"
                title={t('results.score_label', { score })}
              >
                <span className="sr-only">{t('results.score_label', { score })}</span>
                <span aria-hidden="true">{score}</span>
              </span>

              <ButtonIcon
                variant="tertiary"
                label={t('results.rank_down', { title: shortTitle })}
                disabled={archived}
                onClick={handleRankDown}
                icon={<ThumbsDown size={14} aria-hidden="true" fill={animatingDown.has(entry.id) ? 'currentColor' : 'none'} />}
                className="result-rank-btn result-rank-btn--down"
              />
            </>}

            <ButtonIcon
              variant="tertiary"
              label={archived ? t('results.unarchive', { title: shortTitle }) : t('results.archive', { title: shortTitle })}
              onClick={handleArchive}
              icon={archived
                ? <ArchiveRestore size={13} aria-hidden="true" />
                : <Archive size={13} aria-hidden="true" />
              }
              className={`result-rank-btn result-rank-btn--archive${archived ? ' result-rank-btn--active' : ''}`}
            />
          </div>}
        </div>

        {onPin && (
          <div
            className="result-action-panel result-action-panel--right"
            onFocus={() => setSwipeOpenId({ id: entry.id, side: 'right' })}
            onBlur={() => setSwipeOpenId(null)}
          >
            <ButtonIcon
              variant="tertiary"
              label={pinned ? t('results.unpin', { title: shortTitle }) : t('results.pin', { title: shortTitle })}
              disabled={archived}
              onClick={handlePin}
              icon={pinned
                ? <PinOff size={14} aria-hidden="true" fill="currentColor" />
                : <Pin size={14} aria-hidden="true" fill="currentColor" />
              }
              className={`result-rank-btn${pinned ? ' result-pin-btn--active' : ''}`}
            />
          </div>
        )}

        {showRanking && !pinned && (
          <div
            className="result-action-panel result-action-panel--left"
            onFocus={() => setSwipeOpenId({ id: entry.id, side: 'left' })}
            onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSwipeOpenId(null) }}
          >
            <ButtonIcon variant="tertiary" label={starred ? t('results.unstar', { title: shortTitle }) : t('results.star', { title: shortTitle })} onClick={handleStar}
              icon={<Star size={13} aria-hidden="true" fill={starred ? 'currentColor' : 'none'} />}
              className={`result-rank-btn result-rank-btn--star${starred ? ' result-rank-btn--active' : ''}`}
            />
            <ButtonIcon variant="tertiary" label={t('results.rank_up', { title: shortTitle })} disabled={archived} onClick={handleRankUp}
              icon={<ThumbsUp size={14} aria-hidden="true" />}
              className="result-rank-btn result-rank-btn--up"
            />
            <span className="result-rank-score" aria-hidden="true">{score}</span>
            <ButtonIcon variant="tertiary" label={t('results.rank_down', { title: shortTitle })} disabled={archived} onClick={handleRankDown}
              icon={<ThumbsDown size={14} aria-hidden="true" />}
              className="result-rank-btn result-rank-btn--down"
            />
            <ButtonIcon variant="tertiary" label={archived ? t('results.unarchive', { title: shortTitle }) : t('results.archive', { title: shortTitle })} onClick={handleArchive}
              icon={archived ? <ArchiveRestore size={13} aria-hidden="true" /> : <Archive size={13} aria-hidden="true" />}
              className={`result-rank-btn result-rank-btn--archive${archived ? ' result-rank-btn--active' : ''}`}
            />
          </div>
        )}
      </li>
    </Fragment>
  )
}
