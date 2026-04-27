import { useState, useCallback } from 'react'
import {
  loadContributions,
  submitContribution as _submit,
  updateContributionStatus as _updateStatus,
  deleteContribution as _delete,
  clearContributions as _clear,
  exportContributionsJson,
  pendingContributionCount,
  CONTRIBUTION_STATUS,
} from '../services/contributionService.js'

export { EDIT_TARGET, EDIT_SCOPE, CONTRIBUTION_STATUS } from '../services/contributionService.js'

/**
 * useContributionQueue
 *
 * Reactive wrapper around contributionService. Intended for:
 *   - The edit flow dialogs (submit a contribution after the user confirms)
 *   - A future maintainer review panel (list, approve, reject, export)
 *
 * Returns:
 *   contributions        — full list (all statuses)
 *   pendingContributions — filtered to status: "pending"
 *   pendingCount         — number
 *   submitContribution   — (findingId, locale, scope, localeFields, enFields?) → contribution
 *   approveContribution  — (id) → contribution | null
 *   rejectContribution   — (id) → contribution | null
 *   deleteContribution   — (id) → void
 *   clearContributions   — () → void
 *   exportJson           — () → string  (JSON string, ready to copy or download)
 */
export default function useContributionQueue() {
  const [contributions, setContributions] = useState(() => loadContributions())

  const refresh = () => setContributions(loadContributions())

  const submitContribution = useCallback((findingId, locale, scope, localeFields, enFields = null) => {
    const c = _submit(findingId, locale, scope, localeFields, enFields)
    refresh()
    return c
  }, [])

  const approveContribution = useCallback((id) => {
    const c = _updateStatus(id, CONTRIBUTION_STATUS.APPROVED)
    refresh()
    return c
  }, [])

  const rejectContribution = useCallback((id) => {
    const c = _updateStatus(id, CONTRIBUTION_STATUS.REJECTED)
    refresh()
    return c
  }, [])

  const deleteContribution = useCallback((id) => {
    _delete(id)
    refresh()
  }, [])

  const clearContributions = useCallback(() => {
    _clear()
    refresh()
  }, [])

  const exportJson = useCallback(() => exportContributionsJson(), [])

  const pendingContributions = contributions.filter(c => c.status === CONTRIBUTION_STATUS.PENDING)

  return {
    contributions,
    pendingContributions,
    pendingCount: pendingContributionCount(),
    submitContribution,
    approveContribution,
    rejectContribution,
    deleteContribution,
    clearContributions,
    exportJson,
  }
}
