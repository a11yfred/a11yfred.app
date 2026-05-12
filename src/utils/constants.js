export const DEFAULT_RATING = {
  score: 0,
  starred: false,
  archived: false,
}

export const TOAST_HIDE_DURATION = 2000
export const CLIPBOARD_TIMEOUT = 2000
export const NOTIFICATION_TIMEOUT = 2000
export const CYCLE_MS = 2500
export const TYPEWRITER_TICK_MS = 33
export const SEARCH_PERF_WARN_MS = 20
export const RATING_SCORE_WEIGHT = 0.05
export const MS_PER_DAY = 86400000
export const SETTINGS_FLASH_MS = 1500
export const SORT_FLASH_MS = 1000

export const pluralResult = (n) => n === 1 ? 'Result' : 'Results'

export const MAX_RECENT_FINDINGS = 10
export const VIEW_ALL_SKIP_FLAG = '1'
export const FOOTER_CREDIT_NAME = 'Mikey Ilagan'

export const SMART_SCORE_STAR_BONUS    = 50
export const SMART_SCORE_RANK_WEIGHT   = 10
export const SMART_SCORE_POP_WEIGHT    = 2
export const SMART_SCORE_ARCHIVE_PENALTY = 100
export const SMART_SCORE_INDEX_PENALTY  = 0.1

export const POP_STAR_BONUS    = 2
export const POP_UNSTAR_PENALTY = 1
export const POP_ARCHIVE_PENALTY = 1
export const POP_OPEN_BOOST    = 0.5
export const POP_COPY_BOOST    = 0.25
export const RESULTS_COUNT_FOCUS_DELAY = 80
export const VIEW_ALL_LOADING_DELAY = 400
export const ANIMATION_COMPLETE_DELAY = 5000

export const LS_RECENT_FINDINGS  = 'recentFindings'
export const LS_LAST_SELECTED    = 'lastSelectedId'
export const LS_THEME            = 'theme'
export const LS_LANGUAGE         = 'language'
export const LS_SAVE_COUNT       = 'settingsSaveCount'
export const LS_LIVE_SEARCH      = 'liveSearch'
export const LS_SHOW_RANKING     = 'showRanking'
export const LS_PLATFORM         = 'platform'
export const LS_WCAG_FILTER      = 'wcagFilter'
export const LS_ONBOARDING_SEEN  = 'onboardingSeen'
export const LS_DEFECT_RATINGS   = 'defect_ratings'
export const LS_PINNED_FINDINGS  = 'pinnedFindings'
export const LS_CO_SELECTION     = 'coSelectionPairs'
export const LS_USER_OVERRIDES   = 'userOverrides'
export const LS_USER_FINDINGS    = 'userFindings'
export const LS_CONTRIBUTIONS    = 'pendingContributions'
export const LS_ADMIN_DATASET    = 'adminDataset'
export const SS_COPIED_IDS       = 'sessionCopiedIds'

export const DEFAULT_WCAG_FILTER = { maxVersion: '2.2', maxLevel: 'AA' }

export const SEVERITY_SCORE = { Critical: 40, High: 30, Medium: 20, Low: 10, 'Best Practice': 5 }

export const RANK_ANIM_MS = 400

export const PLATFORM_ORDER = { web: 0, native: 1, document: 2 }

export const EASTER_EGG_LOCALES = new Set(['pig', 'pir', 'tlh', 'val', 'blt', 'dot', 'tok', 'nav', 'qya', 'sjn', 'hod', 'dov', 'nds', 'nws', 'mnd', 'csp', 'sim', 'ali'])
export const RTL_LOCALES = new Set(['ar-PS', 'ug'])

export const TYPEWRITER_MIN_CHARS_PER_TICK = 2
export const TYPEWRITER_CHAR_DIVISOR = 40

export const FIESTA_SQUEAK_FREQUENCY = 3

export const ARCHIVE_FOCUS_DELAY_MS = 100

export const SORT_MISSING_ORDER = 99

export const RESULTS_VIEW_ALL_THRESHOLD = 50

export const FIESTA_COMPLEMENT_OFFSET = 180
export const FIESTA_TRIAD_OFFSET      = 120
export const FIESTA_GRAD_RANGE        = 80
export const FIESTA_GRAD_MIN          = 10

export const URL_GITHUB_REPO      = 'https://github.com/mikeyil/A11yHelper'
export const URL_GITHUB_SPONSORS  = 'https://github.com/sponsors/mikeyil'
export const URL_LINKEDIN         = 'https://www.linkedin.com/in/mikeyil'
export const URL_PERSONAL_SITE    = 'https://www.mikey.fyi?ref=a11yhelper'

export const LS_FINDING_NOTE_PREFIX = 'finding_note_'

export const SEVERITY_SORT_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3, 'Best Practice': 4 }
export const WCAG_VERSION_ORDER  = { '2.0': 0, '2.1': 1, '2.2': 2 }
export const WCAG_LEVEL_ORDER    = { A: 0, AA: 1, AAA: 2 }

export const SEARCH_LOAD_TIMEOUT_MS = 8000
export const DEBUG_SKELETON_QUERY = 'debug skeleton'

export const SWIPE_REVEAL = 44
export const SWIPE_THRESHOLD = 22
export const SWIPE_ACTIVATE = 120

export const MAX_SEARCH_RESULTS = 8
export const MAX_SEARCH_ALL = 12
export const TITLE_TRUNCATE_LENGTH = 36
export const DESC_PREVIEW_LENGTH = 180

export const LS_VIEW_ALL_SKIP = 'viewAllSkipConfirm'
