import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@utils/cn';

/** Visual scale. `lg` (the default) matches the active-workout HUD. */
export type RepCounterSize = 'md' | 'lg' | 'xl';

type RepCounterProps = {
  /**
   * Current rep count. Caller-supplied — must come from a real rep
   * state machine (Phases 20–24). Non-finite or negative values
   * collapse to `0`.
   */
  reps: number;
  /**
   * Optional target reps (e.g. `10`). When supplied, rendered as
   * `/ target` beneath the current count.
   */
  target?: number;
  /** Optional label rendered above the number (e.g. "Reps"). */
  label?: string;
  /**
   * Animate a brief scale pulse when `reps` increases. Defaults to
   * `true`. The pulse target is < 100 ms per Phase 9 success criteria
   * and is suppressed under `prefers-reduced-motion`.
   */
  animateOnChange?: boolean;
  /** Visual scale. Defaults to `lg`. */
  size?: RepCounterSize;
  /** Extra utility classes for the outer wrapper. */
  className?: string;
};

const VALUE_TEXT_CLASS: Record<RepCounterSize, string> = {
  md: 'text-h1',
  lg: 'text-[3.5rem] leading-[1] font-bold',
  xl: 'text-[5rem] leading-[1] font-bold',
};

const TARGET_TEXT_CLASS: Record<RepCounterSize, string> = {
  md: 'text-body',
  lg: 'text-h3',
  xl: 'text-h2',
};

function safeReps(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
}

/**
 * Large animated rep counter for the active-workout HUD.
 *
 * `RepCounter` is presentational. The component does not increment,
 * decrement, or interpret reps — it renders whatever number the
 * caller (future rep state machine / workout session store) supplies.
 *
 * Animation:
 * - A short scale pulse (`1.0 → 1.1 → 1.0` over ~180 ms) fires when
 *   the rendered value increases. Framer Motion keys the pulse off
 *   the new value so increments feel instant.
 * - Honors `prefers-reduced-motion`: the pulse is replaced with a
 *   subtle color flash equivalent (no scale change).
 *
 * Accessibility:
 * - Wraps the number in `aria-live="polite"` so screen readers
 *   announce each new rep ("Rep 7 of 10") without preempting urgent
 *   form cues (which use `aria-live="assertive"`).
 * - Uses `tabular-nums` to keep the number from jittering between
 *   single- and double-digit values.
 *
 * Data / fake-data rules:
 * - **No internal rep counting.** Do not increment on a timer.
 * - **No ML logic.** The component never decides "this was a rep."
 */
export function RepCounter({
  reps,
  target,
  label,
  animateOnChange = true,
  size = 'lg',
  className,
}: RepCounterProps): JSX.Element {
  const safeCurrent = safeReps(reps);
  const safeTarget =
    target !== undefined && Number.isFinite(target) ? Math.max(0, Math.floor(target)) : undefined;
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animateOnChange && prefersReducedMotion !== true;

  const ariaLabel =
    safeTarget !== undefined ? `Rep ${safeCurrent} of ${safeTarget}` : `Rep ${safeCurrent}`;

  return (
    <div
      className={cn('inline-flex flex-col items-center', className)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={ariaLabel}
    >
      {label ? (
        <span className="mb-1 text-label text-motionly-neutral-600 dark:text-motionly-neutral-300">
          {label}
        </span>
      ) : null}
      <motion.span
        key={shouldAnimate ? safeCurrent : 'static'}
        initial={shouldAnimate ? { scale: 1 } : false}
        animate={shouldAnimate ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={shouldAnimate ? { duration: 0.18, ease: 'easeOut' } : { duration: 0 }}
        className={cn(
          'tabular-nums text-motionly-neutral-900 dark:text-motionly-neutral-50',
          VALUE_TEXT_CLASS[size],
        )}
      >
        {String(safeCurrent).padStart(2, '0')}
      </motion.span>
      {safeTarget !== undefined ? (
        <span
          className={cn(
            'mt-1 tabular-nums text-motionly-neutral-500 dark:text-motionly-neutral-400',
            TARGET_TEXT_CLASS[size],
          )}
          aria-hidden="true"
        >
          / {safeTarget}
        </span>
      ) : null}
    </div>
  );
}
