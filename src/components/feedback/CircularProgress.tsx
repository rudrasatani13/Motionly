import { motion, useReducedMotion } from 'framer-motion';
import { useId } from 'react';

import { cn } from '@utils/cn';
import { clampScore, scoreTone, type ScoreTone } from '@utils/score';

/**
 * Visual scale of the ring. `md` (160 px) is the dashboard / summary
 * default; `lg` is reserved for the post-workout hero moment.
 */
export type CircularProgressSize = 'sm' | 'md' | 'lg';

type CircularProgressProps = {
  /**
   * Score / progress value in the canonical `0–100` range. Values
   * outside the range are clamped by `clampScore`; non-finite inputs
   * collapse to `0` so the ring never renders garbage geometry.
   */
  value: number;
  /**
   * Accessible label describing what the ring represents (e.g.
   * "Average form score"). Used as `aria-label` on the progressbar.
   * Required because the ring is always announced numerically.
   */
  label: string;
  /** Visually rendered caption under the number (e.g. "form score"). */
  caption?: string;
  /** Show the numeric value in the center. Defaults to `true`. */
  showValue?: boolean;
  /** Visual scale. Defaults to `md`. */
  size?: CircularProgressSize;
  /**
   * Stroke width of the ring in px. Defaults to a size-appropriate
   * value; supply only to deliberately tweak emphasis.
   */
  strokeWidth?: number;
  /** Extra utility classes for the outer wrapper. */
  className?: string;
};

const PIXEL_SIZE: Record<CircularProgressSize, number> = {
  sm: 96,
  md: 160,
  lg: 224,
};

const DEFAULT_STROKE: Record<CircularProgressSize, number> = {
  sm: 8,
  md: 12,
  lg: 16,
};

const VALUE_TEXT_CLASS: Record<CircularProgressSize, string> = {
  sm: 'text-h3',
  md: 'text-h1',
  lg: 'text-h1',
};

const CAPTION_TEXT_CLASS: Record<CircularProgressSize, string> = {
  sm: 'text-caption',
  md: 'text-caption',
  lg: 'text-body',
};

/**
 * Tailwind text-color classes per tone. We use `currentColor` on the
 * SVG so the same class drives stroke + numeric label, keeping the
 * token boundary in `tailwind.config.ts`.
 */
const TONE_TEXT_CLASS: Record<ScoreTone, string> = {
  good: 'text-motionly-accent',
  warning: 'text-motionly-warning',
  danger: 'text-motionly-danger',
};

/**
 * Animated SVG progress ring for form / progress scores.
 *
 * `CircularProgress` is presentational: the caller passes a numeric
 * `value` from a future form-scoring or session pipeline (Phase 21+,
 * Phase 28). The component clamps the value, picks a tone via
 * {@link scoreTone}, and renders the ring + an optional center value.
 *
 * Data ownership:
 * - Never invents a score. A missing measurement should render the
 *   component with `value={0}` only if the caller has a real reason
 *   to display zero; otherwise omit the ring entirely.
 *
 * Color coding (via Motionly tokens):
 * - `>= 80` → `motionly-accent` (green / good)
 * - `50–79` → `motionly-warning` (amber)
 * - `< 50`  → `motionly-danger` (red)
 *
 * Accessibility:
 * - Exposes `role="progressbar"` with `aria-valuemin=0`,
 *   `aria-valuemax=100`, and the clamped `aria-valuenow`.
 * - `aria-label` is the caller-provided `label`. The numeric value
 *   is also rendered as visible text for sighted users — colour is
 *   never the only signal.
 * - Honors `prefers-reduced-motion`: the dash offset jumps to its
 *   final value instead of sweeping.
 *
 * Not for:
 * - Medical / injury-risk readouts (Design Principle 6).
 * - Indeterminate "spinning" states — pair with `Button`'s loading
 *   spinner for those.
 */
export function CircularProgress({
  value,
  label,
  caption,
  showValue = true,
  size = 'md',
  strokeWidth,
  className,
}: CircularProgressProps): JSX.Element {
  const safeValue = clampScore(value);
  const tone = scoreTone(safeValue);

  const px = PIXEL_SIZE[size];
  const stroke = strokeWidth ?? DEFAULT_STROKE[size];
  const radius = (px - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  const prefersReducedMotion = useReducedMotion();
  const titleId = useId();

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      aria-describedby={caption ? titleId : undefined}
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: px, height: px }}
    >
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        className={cn('rotate-[-90deg]', TONE_TEXT_CLASS[tone])}
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: prefersReducedMotion === true ? offset : circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={
            prefersReducedMotion === true
              ? { duration: 0 }
              : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          }
        />
      </svg>
      {showValue ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              'font-semibold tabular-nums',
              VALUE_TEXT_CLASS[size],
              TONE_TEXT_CLASS[tone],
            )}
          >
            {Math.round(safeValue)}
          </span>
          {caption ? (
            <span
              id={titleId}
              className={cn(
                'mt-1 text-motionly-neutral-600 dark:text-motionly-neutral-300',
                CAPTION_TEXT_CLASS[size],
              )}
            >
              {caption}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
