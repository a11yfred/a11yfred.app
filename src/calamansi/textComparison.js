/**
 * Levenshtein edit distance between two strings.
 */
function editDistance(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i])
  for (let j = 1; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

const DEFAULT_THRESHOLD = 0.7

/**
 * Returns true if `current` has diverged significantly from `original`,
 * measured as edit distance / original length exceeding `threshold`.
 *
 * Useful for detecting when a user has substantially rewritten a text field
 * vs. made minor corrections.
 *
 * @param {string} original
 * @param {string} current
 * @param {number} [threshold=0.7]
 */
export function isSignificantlyChanged(original, current, threshold = DEFAULT_THRESHOLD) {
  if (!original || original === current) return false
  return editDistance(original, current) / original.length > threshold
}
