/**
 * Probes a list of endpoints in parallel to check network reachability.
 *
 * @param {Array<{ label: string, url: string }>} probes
 * @param {number} [timeoutMs=4000]
 * @returns {Promise<Array<{ label: string, ok: boolean }>>}
 */
export async function checkConnectivity(probes, timeoutMs = 4000) {
  const results = await Promise.allSettled(
    probes.map(p =>
      fetch(p.url, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(timeoutMs) })
        .then(() => ({ label: p.label, ok: true }))
        .catch(() => ({ label: p.label, ok: false }))
    )
  )
  return results.map(r => r.value || r.reason)
}
