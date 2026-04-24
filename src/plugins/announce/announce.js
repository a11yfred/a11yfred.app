/**
 * Module-level pub/sub that bridges the imperative announce() call to
 * whatever React component is currently mounted as the Announcer.
 *
 * Using a module singleton (not context) means announce() can be called
 * from anywhere: event handlers, async callbacks, service files, etc.
 * The Announcer component subscribes on mount and drives the live region.
 */

const _listeners = new Set()

/**
 * Push a message into the page's ARIA live region.
 *
 * @param {string} message   - The text to announce.
 * @param {{ priority?: 'polite' | 'assertive' }} [options]
 *   - 'polite'    (default) waits for a natural pause before reading.
 *   - 'assertive' interrupts the current utterance immediately.
 *     Reserve for errors and time-sensitive alerts.
 */
export function announce(message, { priority = 'polite' } = {}) {
  _listeners.forEach(fn => fn(message, priority))
}

/** @internal — used only by Announcer.jsx */
export function _subscribe(fn) {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}
