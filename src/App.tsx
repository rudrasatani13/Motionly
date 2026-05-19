import '@/App.css';
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

  return (
    <div className="app-shell">
      <main className="app-shell__main">
        <img
          className="app-shell__mark"
          src="/web-app-manifest-192x192.png"
          alt=""
          width={96}
          height={96}
          decoding="async"
        />
        <h1 className="app-shell__brand">Motionly</h1>
        <p className="app-shell__tagline">Move Better.</p>
      </main>

      <footer className="app-shell__footer">
        <span className="app-shell__status" role="status" aria-live="polite">
          <span
            className={'app-shell__status-dot' + (isLive ? '' : ' app-shell__status-dot--idle')}
            aria-hidden="true"
          />
          {statusLabel(swStatus)}
        </span>
      </footer>
    </div>
  );
}

export default App;
