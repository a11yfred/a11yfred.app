import { Badge } from '@ulam/ube'
import { useT } from '../hooks/useTranslate.js'
import { SEVERITY_VARS } from '../data/severityStyles.js'

export default function ResultCardBadges({ entry, archived }) {
  const t = useT()
  const p = SEVERITY_VARS[entry.severity] || SEVERITY_VARS['Best Practice']

  return (
    <span className="result-item__badges">
      <Badge
        variant="severity"
        bg={archived ? undefined : p.bg}
        color={archived ? undefined : p.color}
        prefix={entry.severity !== 'Best Practice' ? t('badge.severity_prefix') : undefined}
      >
        {t(p.key)}
      </Badge>
      {entry.wcagVersion && (
        <Badge variant="wcag">
          {entry.wcagVersion}
        </Badge>
      )}
      {entry.wcagLevel && (
        <Badge variant="wcag-level">
          {entry.wcagLevel}
        </Badge>
      )}
    </span>
  )
}
