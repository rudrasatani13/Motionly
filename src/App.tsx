import { AppRouter } from '@router/AppRouter';

/**
 * Root component. Phase 6 hands routing entirely to `AppRouter`; layouts own
 * the per-route chrome (PWA status pill, bottom tab bar) so this file stays
 * a single composition point.
 */
function App(): JSX.Element {
  return <AppRouter />;
}

export default App;
