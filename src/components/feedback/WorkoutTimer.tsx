import { cn } from '@utils/cn';
import { formatDurationMs, formatDurationSeconds } from '@utils/formatDuration';

/** Display mode of the timer. */
export type WorkoutTimerMode = 'elapsed' | 'countdown';

/** Visual scale. `md` is the default. */
export type WorkoutTimerSize = 'sm' | 'md' | 'lg' | 'xl';

type WorkoutTimerProps = {
  /**
   * Current time value supplied by the caller. Interpret as seconds
   * (default) or milliseconds via `unit`. The component never starts,
   * runs, or ticks — it formats whatever the caller passes.
   */
  value: number;
  /** Unit of `value`. Defaults to `seconds`. */
  unit?: 'seconds' | 'milliseconds';
  /**
   * Mode is purely informational — it does not change formatting. It
   * is exposed so the accessible label reads "elapsed" vs. "remaining"
   * appropriately and screen-reader users get the right context.
   * Defaults to `elapsed`.
   */
  mode?: WorkoutTimerMode;
  /**
   * Optional status label rendered next to the time (e.g. "Resting",
   * "Active set"). Caller-controlled — the component does not infer
   * a status from the value.
   */
  status?: string;
  /**
   * Visual scale. Defaults to `md`. `compact` is the `sm` equivalent
   * suitable for the top HUD.
   */
  size?: WorkoutTimerSize;
  /**
   * Force the `h:mm:ss` format even when the value is under one hour.
   * Useful for long-session UIs that need a stable layout.
   */
  forceHours?: boolean;
  /** Override the accessible label. */
  'aria-label'?: string;
  /** Extra utility classes for the outer wrapper. */
  className?: string;
};

const SIZE_TEXT_CLASS: Record<WorkoutTimerSize, string> = {
  sm: 'text-label',
  md: 'text-h3',
  lg: 'text-h2',
  xl: 'text-h1',
};

/**
 * Presentational countdown / elapsed-time readout.
 *
 * `WorkoutTimer` formats a numeric value (seconds or milliseconds)
 * supplied by the caller into a `m:ss` or `h:mm:ss` string. It does
 * **not** start an internal interval — every tick is the caller's
 * responsibility (typically a future `useWorkoutTimer` hook backed by
 * the workout session store).
 *
 * Modes:
 * - `elapsed`   — caller sends a monotonically increasing value.
 * - `countdown` — caller sends a monotonically decreasing value.
 *
 * Either way the formatting is identical; `mode` only changes the
 * accessible label.
 *
 * Accessibility:
 * - `role="timer"` + `aria-live="off"` so screen readers do not
 *   announce every second (which would be deafening). Caller is
 *   expected to surface explicit milestones via separate live regions
 *   (Phase 27 — e.g. "10 seconds remaining").
 * - `aria-label` describes the mode by default ("Elapsed time:" /
 *   "Remaining time:") so screen readers have a meaningful prefix.
 *
 * Data / fake-data rules:
 * - **No internal timer.** Do not run a `setInterval` here.
 * - **No fake tracking.** Pass real workout-session state only.
 */
export function WorkoutTimer({
  value,
  unit = 'seconds',
  mode = 'elapsed',
  status,
  size = 'md',
  forceHours = false,
  'aria-label': ariaLabelProp,
  className,
}: WorkoutTimerProps): JSX.Element {
  const formatted =
    unit === 'milliseconds'
      ? formatDurationMs(value, { forceHours })
      : formatDurationSeconds(value, { forceHours });

  const ariaPrefix = mode === 'countdown' ? 'Remaining time' : 'Elapsed time';
  const ariaLabel = ariaLabelProp ?? `${ariaPrefix}: ${formatted}`;

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={ariaLabel}
      className={cn('inline-flex flex-col items-center gap-1', className)}
    >
      {status ? (
        <span className="text-label uppercase tracking-wide text-motionly-neutral-500 dark:text-motionly-neutral-400">
          {status}
        </span>
      ) : null}
      <span
        className={cn(
          'tabular-nums font-semibold text-motionly-neutral-900 dark:text-motionly-neutral-50',
          SIZE_TEXT_CLASS[size],
        )}
      >
        {formatted}
      </span>
    </div>
  );
}
