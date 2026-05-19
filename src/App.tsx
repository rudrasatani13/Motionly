import { useServiceWorkerStatus } from '@/sw-register';

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

function App(): JSX.Element {
  const swStatus = useServiceWorkerStatus();
  const isLive = swStatus === 'ready' || swStatus === 'update-available';
  const statusDotClassName = isLive
    ? 'h-1.5 w-1.5 shrink-0 rounded-full bg-motionly-accent'
    : 'h-1.5 w-1.5 shrink-0 rounded-full bg-motionly-neutral-400 dark:bg-motionly-neutral-600';

  return (
    <div className="min-h-dvh bg-motionly-bg-light text-motionly-neutral-900 dark:bg-motionly-bg-dark dark:text-motionly-neutral-50">
      <div className="mx-auto grid min-h-dvh max-w-5xl grid-rows-[1fr_auto] px-6 py-6 sm:px-8">
        <main className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="mb-4 h-20 w-20" aria-hidden="true">
            <img
              className="h-full w-full select-none dark:hidden"
              src="/motionly-mark-light-192.png"
              alt=""
              width={80}
              height={80}
              decoding="async"
              draggable={false}
            />
            <img
              className="hidden h-full w-full select-none dark:block dark:mix-blend-screen"
              src="/web-app-manifest-192x192.png"
              alt=""
              width={80}
              height={80}
              decoding="async"
              draggable={false}
            />
          </div>
          <h1 className="text-h1 text-motionly-neutral-900 dark:text-motionly-neutral-50">
            Motionly
          </h1>
          <p className="text-body text-motionly-neutral-500 dark:text-motionly-neutral-400">
            Move Better.
          </p>
        </main>

        <footer className="flex justify-center pt-6">
          <span
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-motionly-neutral-200 bg-motionly-neutral-50 px-3 py-1.5 text-caption text-motionly-neutral-600 dark:border-motionly-neutral-800 dark:bg-motionly-neutral-900 dark:text-motionly-neutral-300"
            role="status"
            aria-live="polite"
          >
            <span className={statusDotClassName} aria-hidden="true" />
            {statusLabel(swStatus)}
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;
