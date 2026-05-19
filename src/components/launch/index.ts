/**
 * Phase 10 — Launch UI barrel.
 *
 * Re-exports the React-side launch screen plus the SW update prompt
 * hook so callers can import either from `@components/launch`.
 */

export { LaunchScreen } from './LaunchScreen';
export { useServiceWorkerUpdatePrompt } from './useServiceWorkerUpdatePrompt';
