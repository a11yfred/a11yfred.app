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

/**
 * Reactive wrapper around contributionService.
 *
 * @returns {{
 *   contributions: Array,            full list across all statuses
 *   pendingContributions: Array,     filtered to status "pending"
 *   pendingCount: number,
 *   submitContribution: (findingId: string, locale: string, scope: string, localeFields: object, enFields?: object) => object,
 *   approveContribution: (id: string) => object|null,
 *   rejectContribution:  (id: string) => object|null,
 *   deleteContribution:  (id: string) => void,
 *   clearContributions:  () => void,
 *   exportJson:          () => string,  JSON string ready to copy or download
 * }}
 */
export default function useContributionQueue() {
  const [contributions, setContributions] = useState(() => loadContributions())

  const refresh = useCallback(() => setContributions(loadContributions()), [])

  const submitContribution = useCallback((findingId, locale, scope, localeFields, enFields = null) => {
    const c = _submit(findingId, locale, scope, localeFields, enFields)
    refresh()
    return c
  }, [refresh])

  const approveContribution = useCallback((id) => {
    const c = _updateStatus(id, CONTRIBUTION_STATUS.APPROVED)
    refresh()
    return c
  }, [refresh])

  const rejectContribution = useCallback((id) => {
    const c = _updateStatus(id, CONTRIBUTION_STATUS.REJECTED)
    refresh()
    return c
  }, [refresh])

  const deleteContribution = useCallback((id) => {
    _delete(id)
    refresh()
  }, [refresh])

  const clearContributions = useCallback(() => {
    _clear()
    refresh()
  }, [refresh])

  const exportJson = exportContributionsJson

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
