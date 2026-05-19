import { cn } from '@utils/cn';

/**
 * Spacing scale for `Spacer`. Maps to the Tailwind default spacing
 * scale so the primitive stays predictable.
 */
export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type SpacerProps = {
  /** Spacing token. Defaults to `md` (≈16px). */
  size?: SpacerSize;
  /** Axis the spacer expands along. Defaults to `vertical`. */
  axis?: 'vertical' | 'horizontal';
  /** Optional extra classes. */
  className?: string;
};

const HORIZONTAL_CLASS: Record<SpacerSize, string> = {
  xs: 'w-1',
  sm: 'w-2',
  md: 'w-4',
  lg: 'w-6',
  xl: 'w-10',
};

const VERTICAL_CLASS: Record<SpacerSize, string> = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
  xl: 'h-10',
};

/**
 * Decorative spacing primitive.
 *
 * Prefer `gap-*` on `Row` / `Column` (or Tailwind utilities) for
 * spacing between siblings. Reach for `Spacer` only when a one-off
 * vertical or horizontal gap is clearer than restructuring the parent.
 *
 * Accessibility:
 * - Marked `aria-hidden="true"`; the spacer carries no semantics.
 *
 * Not for:
 * - Replacing layout primitives. If you find yourself stacking
 *   spacers, switch to `Column` with `gap`.
 */
export function Spacer({ size = 'md', axis = 'vertical', className }: SpacerProps): JSX.Element {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block shrink-0',
        axis === 'horizontal' ? HORIZONTAL_CLASS[size] : VERTICAL_CLASS[size],
        className,
      )}
    />
  );
}
