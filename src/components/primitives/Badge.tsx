import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@utils/cn';

/**
 * Color intent of a `Badge`. Maps to Motionly token classes.
 *
 * - `neutral` — default category label.
 * - `primary` — Motionly brand emphasis.
 * - `accent` — positive / success leaning.
 * - `warning` — non-blocking caution.
 * - `danger` — destructive or error state.
 */
export type BadgeVariant = 'neutral' | 'primary' | 'accent' | 'warning' | 'danger';

export type BadgeSize = 'sm' | 'md';

type BadgeProps = {
  /** Color intent. Defaults to `neutral`. */
  variant?: BadgeVariant;
  /** Size token. Defaults to `md`. */
  size?: BadgeSize;
  /** Children — typically a short label. */
  children?: ReactNode;
  /** Extra utility classes. Do not pass hardcoded colors. */
  className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'children'>;

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  neutral:
    'bg-motionly-neutral-100 text-motionly-neutral-700 ' +
    'dark:bg-motionly-neutral-800 dark:text-motionly-neutral-200',
  primary: 'bg-motionly-primary/10 text-motionly-primary',
  accent: 'bg-motionly-accent/10 text-motionly-accent',
  warning: 'bg-motionly-warning/10 text-motionly-warning',
  danger: 'bg-motionly-danger/10 text-motionly-danger',
};

const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 text-caption',
  md: 'h-6 px-2.5 text-label',
};

/**
 * Small color-coded label used to annotate or categorize content.
 *
 * Use for status pills, category tags, and counts. The token-based
 * palette ensures `Badge` matches the rest of Motionly in light and
 * dark modes without hardcoded colors.
 *
 * Accessibility:
 * - Color is **not** the only signal — the label text carries the
 *   meaning. Do not rely on color alone (e.g. "warning" badges still
 *   read the word "Warning").
 *
 * Not for:
 * - Interactive selection chips — use `Chip` for that.
 * - The Phase 9 `ScoreBadge`, which has its own color-coded numeric
 *   palette and animation rules.
 */
export function Badge({
  variant = 'neutral',
  size = 'md',
  className,
  children,
  ...rest
}: BadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
