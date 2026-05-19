import { motion, useReducedMotion } from 'framer-motion';

/**
 * Phase 10 React-side animated launch screen.
 *
 * Shown by `<LaunchGate>` after React hydrates, while the launch
 * orchestration layer resolves the launch decision (`hasOnboarded`
 * read, future auth rehydration) and waits out the minimum brand
 * window. The wordmark scales `0.9 → 1.0` with fade-in and the
 * "Move Better." tagline fades in shortly after, then the gate
 * hands off to the destination route.
 *
 * Visuals deliberately match the inline HTML splash painted by
 * `index.html` so there is no white flash between the pre-React
 * paint and the React-rendered launch screen.
 *
 * The component is presentational only. It owns no real data, no
 * real auth state, no real onboarding state, and renders no fake
 * "loading AI / analyzing movement / connecting" copy. The brand
 * reveal is exactly the wordmark plus the tagline.
 *
 * Accessibility notes:
 * - The wordmark is the only `<h1>` so screen readers receive a
 *   clear, single heading on launch.
 * - The decorative tagline / animation does not use `aria-live`;
 *   the launch screen is a brand moment, not a status announcement.
 * - Focus is not trapped — the destination route owns focus
 *   handoff once `<LaunchGate>` completes.
 * - `prefers-reduced-motion` collapses the scale animation; only a
 *   minimal opacity fade remains so the launch still feels smooth
 *   without animating movement.
 */
export function LaunchScreen(): JSX.Element {
  const prefersReducedMotion = useReducedMotion();

  const wordmarkInitial =
    prefersReducedMotion === true ? { opacity: 0 } : { opacity: 0, scale: 0.9 };
  const wordmarkAnimate = prefersReducedMotion === true ? { opacity: 1 } : { opacity: 1, scale: 1 };
  const wordmarkTransition =
    prefersReducedMotion === true
      ? { duration: 0.2, ease: 'easeOut' as const }
      : { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

  const taglineInitial = { opacity: 0 };
  const taglineAnimate = { opacity: 1 };
  const taglineTransition =
    prefersReducedMotion === true
      ? { duration: 0.2, ease: 'easeOut' as const, delay: 0.1 }
      : { duration: 0.6, ease: 'easeOut' as const, delay: 0.2 };

  return (
    <div
      className="fixed inset-0 z-0 flex flex-col items-center justify-center gap-2 bg-motionly-bg-dark text-motionly-neutral-50"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingRight: 'env(safe-area-inset-right)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
      }}
      data-testid="motionly-launch-screen"
    >
      <motion.h1
        className="m-0 text-h1 tracking-tight"
        initial={wordmarkInitial}
        animate={wordmarkAnimate}
        transition={wordmarkTransition}
      >
        Motionly
      </motion.h1>
      <motion.p
        className="m-0 text-body text-motionly-neutral-400"
        initial={taglineInitial}
        animate={taglineAnimate}
        transition={taglineTransition}
        aria-hidden="true"
      >
        Move Better.
      </motion.p>
    </div>
  );
}
