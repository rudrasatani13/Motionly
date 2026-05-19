import { useServiceWorkerStatus } from '@/sw-register';

/**
 * Small, honest status pill that reflects PWA / service worker readiness.
 *
 * Lifted out of `App.tsx` in Phase 6 so it can sit inside the routing layouts.
 * It is the only piece of always-visible chrome the app ships today — and it
 * describes real infrastructure state (registered / updating / unsupported),
 * not any fabricated product status.
 */
function statusLabel(status: ReturnType<typeof useServiceWorkerStatus>): string {
  switch (status) {
    case 'ready':
      return 'PWA foundation initialized · offline ready';
    case 'update-available':
      return 'PWA update available — reload to apply';
    case 'registering':
      return 'PWA foundation initializing…';
    case 'error':
      return 'PWA foundation initialized · service worker unavailable';
    case 'unsupported':
    default:
      return 'PWA foundation initialized';
  }
}

export function ServiceWorkerStatusPill(): JSX.Element {
  const swStatus = useServiceWorkerStatus();
  const isLive = swStatus === 'ready' || swStatus === 'update-available';
  const statusDotClassName = isLive
    ? 'h-1.5 w-1.5 shrink-0 rounded-full bg-motionly-accent'
    : 'h-1.5 w-1.5 shrink-0 rounded-full bg-motionly-neutral-400 dark:bg-motionly-neutral-600';

  return (
    <span
      className="inline-flex max-w-full items-center gap-2 rounded-full border border-motionly-neutral-200 bg-motionly-neutral-50 px-3 py-1.5 text-caption text-motionly-neutral-600 dark:border-motionly-neutral-800 dark:bg-motionly-neutral-900 dark:text-motionly-neutral-300"
      role="status"
      aria-live="polite"
    >
      <span className={statusDotClassName} aria-hidden="true" />
      {statusLabel(swStatus)}
    </span>
  );
}
