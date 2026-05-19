import { ToastProvider } from '@components/feedback';
import { useServiceWorkerUpdatePrompt } from '@components/launch';
import { LaunchGate } from '@/launch';
import { AppRouter } from '@router/AppRouter';

/**
 * Root composition for Motionly.
 *
 * Phase 10 introduced the launch experience: an inline HTML splash
 * paints before React hydrates (`index.html`), the React-side
 * `<LaunchScreen>` takes over after hydration, and the `<LaunchGate>`
 * holds it on screen until the launch decision resolves (minimum
 * brand window + read of the read-only `hasOnboarded` flag + the
 * future-safe auth-state placeholder). Once the gate releases,
 * `<AppRouter>` mounts the routing tree.
 *
 * `<ToastProvider>` wraps the gate so any subtree (Phase 6 layouts,
 * Phase 10 SW update prompt, future product surfaces) can call
 * `useToast()`. `useServiceWorkerUpdatePrompt()` listens for the
 * `motionly:sw` `update-available` event and surfaces the "Refresh to
 * use the latest version." toast with an inline action.
 */
function App(): JSX.Element {
  return (
    <ToastProvider>
      <ServiceWorkerUpdateListener />
      <LaunchGate>
        <AppRouter />
      </LaunchGate>
    </ToastProvider>
  );
}

function ServiceWorkerUpdateListener(): null {
  useServiceWorkerUpdatePrompt();
  return null;
}

export default App;
