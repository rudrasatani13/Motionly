import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@utils/cn';

type TagProps = {
  /**
   * Whether the tag should render in its "selected" tonal style. Use
   * for static metadata that reflects a stored selection (e.g. a
   * filter that was applied earlier). For interactive selection, use
   * `Chip` instead.
   */
  selected?: boolean;
  /** Children — typically a short label. */
  children?: ReactNode;
  /** Extra utility classes. Do not pass hardcoded colors. */
  className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'children'>;

/**
 * Static metadata label.
 *
 * `Tag` is a non-interactive label used to display attributes of an
 * item (e.g. "Beginner", "10 min", "Lower body"). It looks similar to
 * `Badge` but is intended for catalog metadata rather than status.
 *
 * Accessibility:
 * - Renders a plain `<span>`. If a `Tag` becomes interactive in a
 *   future design, switch to `Chip`.
 *
 * Not for:
 * - Interactive selection — use `Chip`.
 * - Status / category pills — use `Badge`.
 */
export function Tag({ selected = false, className, children, ...rest }: TagProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-label font-medium',
        selected
          ? 'border-motionly-primary bg-motionly-primary/10 text-motionly-primary'
          : 'border-motionly-neutral-200 bg-transparent text-motionly-neutral-700 ' +
              'dark:border-motionly-neutral-800 dark:text-motionly-neutral-200',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
