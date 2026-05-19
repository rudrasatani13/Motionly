import { useEffect, useRef } from 'react';

import { useToast } from '@components/feedback';

/**
 * Phase 10 — Service worker update prompt.
 *
 * Listens for the `motionly:sw` custom event dispatched from
 * `@/sw-register` and surfaces a toast inviting the user to refresh
 * to load the newly-available build. The hook never auto-reloads;
 * the user must tap "Refresh" so any in-flight work (e.g. a future
 * onboarding answer) is never lost without consent.
 *
 * Behavior:
 * - Only fires for the `update-available` status. Other lifecycle
 *   statuses (`ready`, `error`, …) are ignored — they're surfaced by
 *   the Phase 6 `ServiceWorkerStatusPill`.
 * - De-duplicates: a second `update-available` event during the same
 *   session is ignored once the toast has been shown. The toast
 *   itself is sticky (`durationMs: 0`) and dismisses only via the
 *   action or the close button.
 * - Only attaches the listener in environments where service workers
 *   make sense (`PROD`). In dev no SW registers (`sw-register` bails
 *   early on `import.meta.env.PROD`), so the prompt cannot surface.
 *
 * Mount this hook once inside `<ToastProvider>`. The recommended
 * mount point is the root composition near `<LaunchGate>`.
 */
export function useServiceWorkerUpdatePrompt(): void {
  const { show } = useToast();
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    if (import.meta.env.PROD !== true) {
      return undefined;
    }

    const handler = (event: Event): void => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail !== 'update-available') {
        return;
      }
      if (hasShownRef.current === true) {
        return;
      }
      hasShownRef.current = true;
      show({
        tone: 'info',
        title: 'Update available',
        message: 'Refresh to use the latest version.',
        durationMs: 0,
        action: {
          label: 'Refresh',
          ariaLabel: 'Refresh to load the latest Motionly build',
          onPress: () => {
            window.location.reload();
          },
        },
      });
    };

    window.addEventListener('motionly:sw', handler);
    return () => {
      window.removeEventListener('motionly:sw', handler);
    };
  }, [show]);
}
