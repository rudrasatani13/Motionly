/**
 * Haptics platform adapter (Phase 8).
 *
 * Wraps the browser `navigator.vibrate` API behind a tiny, safe interface
 * so feature code (e.g. `Button`) never touches `navigator.*` directly.
 *
 * Behavior:
 * - Returns `false` and no-ops when the API is unavailable (Safari, iOS,
 *   some embedded WebViews) or when called outside a browser environment.
 * - Catches and swallows any runtime errors — vibration is a progressive
 *   enhancement, not a contract.
 * - Does not request permissions. The Vibration API has no permission
 *   prompt; user-agent settings may still silently suppress it.
 *
 * The future Capacitor swap (`@capacitor/haptics`) will replace this
 * implementation in place; consumers keep importing the same function.
 */

const SHORT_PULSE_MS = 10;

function isVibrationSupported(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return typeof navigator.vibrate === 'function';
}

/**
 * Trigger a short (~10ms) haptic pulse on supported devices (primarily
 * Android Chrome). Safe to call from any environment; returns `true` when
 * the underlying API accepted the request, `false` otherwise.
 */
export function triggerLightHaptic(): boolean {
  if (!isVibrationSupported()) {
    return false;
  }
  try {
    return navigator.vibrate(SHORT_PULSE_MS);
  } catch {
    return false;
  }
}
