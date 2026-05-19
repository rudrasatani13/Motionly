import type { HTMLAttributes } from 'react';

import { cn } from '@utils/cn';

type DividerProps = {
  /** Orientation of the rule. Defaults to `horizontal`. */
  orientation?: 'horizontal' | 'vertical';
  /** Extra utility classes. Do not pass hardcoded colors. */
  className?: string;
} & Omit<HTMLAttributes<HTMLHRElement | HTMLSpanElement>, 'className' | 'role'>;

/**
 * Thin separator line between content blocks.
 *
 * Renders a semantic `<hr>` for the horizontal default, and a
 * decorative `<span role="separator" aria-orientation="vertical">` for
 * the vertical orientation. Color is the Motionly neutral border
 * token in both themes.
 *
 * Accessibility:
 * - The horizontal variant is meaningful and is announced by screen
 *   readers as a "separator".
 * - The vertical variant is rendered with `role="separator"` and
 *   `aria-orientation="vertical"` for assistive tech.
 *
 * Not for:
 * - Visual emphasis (use a heading or spacing instead).
 */
export function Divider({
  orientation = 'horizontal',
  className,
  ...rest
}: DividerProps): JSX.Element {
  if (orientation === 'vertical') {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={cn(
          'inline-block h-full w-px self-stretch bg-motionly-neutral-200 dark:bg-motionly-neutral-800',
          className,
        )}
        {...(rest as HTMLAttributes<HTMLSpanElement>)}
      />
    );
  }

  return (
    <hr
      className={cn(
        'm-0 h-px w-full border-0 bg-motionly-neutral-200 dark:bg-motionly-neutral-800',
        className,
      )}
      {...(rest as HTMLAttributes<HTMLHRElement>)}
    />
  );
}
