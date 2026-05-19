import { useId } from 'react';

import { cn } from '@utils/cn';
import { clampProgress } from '@utils/score';

/**
 * Semantic tone of a `LinearProgress` bar. Used for the filled portion
 * — the track is always neutral.
 *
 * - `primary` — Motionly brand emphasis (workout / session progress).
 * - `accent`  — positive / success leaning (clean reps).
 * - `warning` — non-blocking caution (e.g. close to a free-tier limit).
 * - `danger`  — destructive / failing state (very low form sub-score).
 * - `neutral` — color-free progress used when there is no semantic
 *   meaning attached to the value (e.g. set N of M position).
 */
export type LinearProgressTone = 'primary' | 'accent' | 'warning' | 'danger' | 'neutral';

/** Visual scale of the bar. `md` is the default; `lg` for emphasis. */
export type LinearProgressSize = 'sm' | 'md' | 'lg';

type LinearProgressProps = {
  /**
   * Progress value in the canonical `0–100` range. Clamped via
   * `clampProgress`; non-finite inputs collapse to `0`.
   */
  value: number;
  /**
   * Accessible label. Either supply `label` (rendered visibly above
   * the bar **and** used as `aria-label`) or `aria-label` directly.
   */
  label?: string;
  /** Override the `aria-label` when no visible label is rendered. */
  'aria-label'?: string;
  /** Show the numeric value next to the label. Defaults to `false`. */
  showValue?: boolean;
  /** Optional helper text rendered under the bar. */
  helperText?: string;
  /** Visual scale. Defaults to `md`. */
  size?: LinearProgressSize;
  /** Semantic tone of the filled portion. Defaults to `primary`. */
  tone?: LinearProgressTone;
  /** Extra utility classes for the outer wrapper. */
  className?: string;
};

const HEIGHT_CLASS: Record<LinearProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

const TONE_FILL_CLASS: Record<LinearProgressTone, string> = {
  primary: 'bg-motionly-primary',
  accent: 'bg-motionly-accent',
  warning: 'bg-motionly-warning',
  danger: 'bg-motionly-danger',
  neutral: 'bg-motionly-neutral-500 dark:bg-motionly-neutral-300',
};

/**
 * Horizontal linear progress bar for workout, rep, and session
 * progress.
 *
 * `LinearProgress` is presentational: the caller is responsible for
 * computing `value` from a real source (rep state machine, session
 * store, free-tier counter). The bar does not animate "by itself" — it
 * uses a CSS width transition so the future caller can update `value`
 * frame-by-frame without re-mounting.
 *
 * Accessibility:
 * - `role="progressbar"` with `aria-valuemin=0`, `aria-valuemax=100`,
 *   `aria-valuenow` set to the clamped value.
 * - When `label` is provided it doubles as the visible label and
 *   `aria-label`. Otherwise, `aria-label` must be passed by the caller.
 * - Honors `prefers-reduced-motion` via Tailwind's
 *   `motion-reduce:transition-none` modifier.
 *
 * Data rules:
 * - No internal progress generation. Do not animate from `0` to `100`
 *   on a timer to "look alive."
 *
 * Not for:
 * - Indeterminate spinners — pair with `Button`'s loading state.
 * - Score-style ring readouts — use `CircularProgress` instead.
 */
export function LinearProgress({
  value,
  label,
  'aria-label': ariaLabelProp,
  showValue = false,
  helperText,
  size = 'md',
  tone = 'primary',
  className,
}: LinearProgressProps): JSX.Element {
  const safeValue = clampProgress(value);
  const labelId = useId();
  const helperId = useId();
  const hasVisibleLabel = label !== undefined;
  const ariaLabel = ariaLabelProp ?? (hasVisibleLabel ? undefined : label);
  const showRounded = showValue ? Math.round(safeValue) : null;

  return (
    <div className={cn('w-full', className)}>
      {hasVisibleLabel || showValue ? (
        <div className="mb-1 flex items-center justify-between gap-2">
          {hasVisibleLabel ? (
            <span
              id={labelId}
              className="text-label font-medium text-motionly-neutral-700 dark:text-motionly-neutral-200"
            >
              {label}
            </span>
          ) : null}
          {showValue ? (
            <span className="text-caption tabular-nums text-motionly-neutral-600 dark:text-motionly-neutral-300">
              {showRounded}%
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
        aria-label={ariaLabel}
        aria-labelledby={hasVisibleLabel ? labelId : undefined}
        aria-describedby={helperText ? helperId : undefined}
        className={cn(
          'w-full overflow-hidden rounded-full bg-motionly-neutral-200 dark:bg-motionly-neutral-800',
          HEIGHT_CLASS[size],
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none',
            TONE_FILL_CLASS[tone],
          )}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      {helperText ? (
        <p
          id={helperId}
          className="mt-1 text-caption text-motionly-neutral-600 dark:text-motionly-neutral-300"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
