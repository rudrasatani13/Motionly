import type { ElementType } from 'react';

import { composeFlexClassName, type FlexProps } from './flex';

/**
 * Horizontal flex layout primitive.
 *
 * Use for groups of items that flow left-to-right (toolbars, button
 * rows, badges). Provides `align`, `justify`, `gap`, and `wrap` props
 * so callers don't sprinkle ad-hoc Tailwind flex utilities across the
 * codebase.
 *
 * Not for:
 * - Page-level grid layouts — reach for explicit Tailwind grid
 *   utilities in pages.
 * - Replacing `Card` as a content container.
 */
export function Row({
  align = 'center',
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
        direction: 'row',
      })}
      {...rest}
    >
      {children}
    </Component>
  );
}
