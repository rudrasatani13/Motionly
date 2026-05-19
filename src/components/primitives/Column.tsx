import type { ElementType } from 'react';

import { composeFlexClassName, type FlexProps } from './flex';

/**
 * Vertical flex layout primitive.
 *
 * Use for stacks of related items (form rows, list sections, page
 * content blocks). Provides `align`, `justify`, and `gap` so callers
 * don't sprinkle ad-hoc Tailwind flex utilities across the codebase.
 *
 * Not for:
 * - Page-level grid layouts — reach for explicit Tailwind grid
 *   utilities in pages.
 */
export function Column({
  align = 'stretch',
  justify = 'start',
  gap = 'md',
  wrap = false,
  as,
  className,
  children,
  ...rest
}: FlexProps): JSX.Element {
  const Component = (as ?? 'div') as ElementType;
  return (
    <Component
      className={composeFlexClassName({
        align,
        justify,
        gap,
        wrap,
        className,
        direction: 'column',
      })}
      {...rest}
    >
      {children}
    </Component>
  );
}
