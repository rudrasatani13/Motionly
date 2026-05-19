import { cn } from '@utils/cn';
import { clampScore, scoreTone, type ScoreTone } from '@utils/score';

/** Visual scale of the badge. `md` is the default. */
export type ScoreBadgeSize = 'sm' | 'md' | 'lg';

type ScoreBadgeProps = {
  /**
   * Score value in the canonical `0–100` range. Clamped via
   * `clampScore`; non-finite inputs collapse to `0`.
   */
  score: number;
  /**
   * Visible textual label rendered next to the number (e.g. "Form").
   * Always paired with the score so meaning never depends on color
   * alone.
   */
  label?: string;
  /**
   * Override the accessible label entirely. By default the badge
   * announces "`label`: `score` out of 100" — supply this prop only
   * when the surrounding text already carries the score's meaning.
   */
  'aria-label'?: string;
  /** Hide the numeric score; only renders the `label`. Defaults to `false`. */
  hideValue?: boolean;
  /** Visual scale. Defaults to `md`. */
  size?: ScoreBadgeSize;
  /** Extra utility classes for the outer wrapper. */
  className?: string;
};

/**
 * Tailwind classes per semantic tone. Mirrors the `CircularProgress`
 * palette but on a tinted surface — score badges are typically used in
 * lists where a fully-saturated fill would be visually loud.
 */
const TONE_CLASS: Record<ScoreTone, string> = {
  good: 'bg-motionly-accent/10 text-motionly-accent',
  warning: 'bg-motionly-warning/10 text-motionly-warning',
  danger: 'bg-motionly-danger/10 text-motionly-danger',
};

const SIZE_CLASS: Record<ScoreBadgeSize, string> = {
  sm: 'h-6 px-2 text-caption',
  md: 'h-7 px-2.5 text-label',
  lg: 'h-9 px-3 text-body',
};

/**
 * Compact color-coded numeric score for list rows, summary cards, and
 * any place where the full `CircularProgress` ring is too heavy.
 *
 * Color coding (via Motionly tokens):
 * - `>= 80` → accent (green) ramp
 * - `50–79` → warning (amber) ramp
 * - `< 50`  → danger (red) ramp
 *
 * Accessibility:
 * - The label / score number are always rendered together so color is
 *   never the only signal.
 * - The badge composes its own accessible name as
 *   "`label`: `score` out of 100"; callers may override via
 *   `aria-label` when surrounding context already carries the meaning.
 *
 * Data rules:
 * - Does not invent a score; no animation; no internal computation.
 *   Pass a real measurement or do not render the badge.
 * - Never use medical / injury-risk vocabulary in the `label`.
 */
export function ScoreBadge({
  score,
  label,
  'aria-label': ariaLabel,
  hideValue = false,
  size = 'md',
  className,
}: ScoreBadgeProps): JSX.Element {
  const safe = clampScore(score);
  const tone = scoreTone(safe);
  const rounded = Math.round(safe);
  const composedAriaLabel =
    ariaLabel ?? (label ? `${label}: ${rounded} out of 100` : `${rounded} out of 100`);

  return (
    <span
      role="status"
      aria-label={composedAriaLabel}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold tabular-nums',
        SIZE_CLASS[size],
        TONE_CLASS[tone],
        className,
      )}
    >
      {label ? <span className="font-medium">{label}</span> : null}
      {hideValue ? null : <span>{rounded}</span>}
    </span>
  );
}
