import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@utils/cn';

/** Cross-axis alignment for `Row`/`Column`. Maps to Tailwind `items-*`. */
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/** Main-axis distribution. Maps to Tailwind `justify-*`. */
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/**
 * Gap scale. Maps to Tailwind `gap-*` tokens on the default spacing
 * scale; keep options narrow to discourage one-off spacing decisions.
 */
export type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type FlexProps = {
  /** Cross-axis alignment. Defaults to `stretch`. */
  align?: FlexAlign;
  /** Main-axis distribution. Defaults to `start`. */
  justify?: FlexJustify;
  /** Gap between children. Defaults to `md` (16px). */
  gap?: FlexGap;
  /** Allow children to wrap onto the next line. Defaults to `false`. */
  wrap?: boolean;
  /** Override the rendered element. Defaults to `div`. */
  as?: ElementType;
  /** Extra utility classes. */
  className?: string;
  /** Children to lay out. */
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>;

export const FLEX_ALIGN_CLASS: Record<FlexAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

export const FLEX_JUSTIFY_CLASS: Record<FlexJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const FLEX_GAP_CLASS: Record<FlexGap, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-10',
};

export function composeFlexClassName({
  align = 'stretch',
  justify = 'start',
  gap = 'md',
  wrap = false,
  className,
  direction,
}: FlexProps & { direction: 'row' | 'column' }): string {
  return cn(
    'flex',
    direction === 'row' ? 'flex-row' : 'flex-col',
    FLEX_ALIGN_CLASS[align],
    FLEX_JUSTIFY_CLASS[justify],
    FLEX_GAP_CLASS[gap],
    wrap && 'flex-wrap',
    className,
  );
}
