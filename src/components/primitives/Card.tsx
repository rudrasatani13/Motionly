import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@utils/cn';

/**
 * Visual variant of a `Card`.
 *
 * - `default` — flat tonal surface that sits on the app background.
 * - `elevated` — soft shadow for cards that should pop forward.
 * - `outlined` — transparent fill with a 1px border for low-emphasis
 *   groupings (e.g. list rows).
 */
export type CardVariant = 'default' | 'elevated' | 'outlined';

/** Internal padding scale. `md` is the default. */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

type CardProps = {
  /** Visual variant. Defaults to `default`. */
  variant?: CardVariant;
  /** Internal padding token. Defaults to `md`. */
  padding?: CardPadding;
  /** Override the rendered element (e.g. `article`, `section`). */
  as?: ElementType;
  /** Card contents. */
  children?: ReactNode;
  /** Extra utility classes. Do not pass hardcoded colors. */
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'>;

const VARIANT_CLASS: Record<CardVariant, string> = {
  default:
    'bg-motionly-neutral-50 text-motionly-neutral-900 ' +
    'dark:bg-motionly-neutral-900 dark:text-motionly-neutral-50',
  elevated:
    'bg-motionly-bg-light text-motionly-neutral-900 shadow-sm ' +
    'dark:bg-motionly-neutral-900 dark:text-motionly-neutral-50',
  outlined:
    'border border-motionly-neutral-200 bg-transparent text-motionly-neutral-900 ' +
    'dark:border-motionly-neutral-800 dark:text-motionly-neutral-50',
};

const PADDING_CLASS: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

/**
 * Motionly content container primitive.
 *
 * `Card` is the standard surface for grouping related content (workout
 * cards, list rows, modal bodies). It carries the surface color and
 * padding; spacing _between_ children is the caller's responsibility
 * via `Row` / `Column` / Tailwind utilities.
 *
 * Variants/usage:
 * - `default` for tonal grouping on the page background.
 * - `elevated` for emphasis (e.g. "Today's workout").
 * - `outlined` for compact lists where shadows would be visual noise.
 *
 * Accessibility:
 * - Defaults to a `<div>` for visual grouping. Promote to `<section>` /
 *   `<article>` via `as` when the card represents a self-contained
 *   region with its own heading.
 *
 * Not for:
 * - Decorative wrappers around a single `Button` — use the button
 *   directly.
 * - Modals / dialogs — those will compose `Card` inside the eventual
 *   modal primitive (not in Phase 8).
 */
export function Card({
  variant = 'default',
  padding = 'md',
  as,
  className,
  children,
  ...rest
}: CardProps): JSX.Element {
  const Component = (as ?? 'div') as ElementType;
  return (
    <Component
      className={cn('rounded-2xl', VARIANT_CLASS[variant], PADDING_CLASS[padding], className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
