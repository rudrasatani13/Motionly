import type { LucideIcon } from 'lucide-react';

import { cn } from '@utils/cn';

/** Visual scale of the icon. */
export type IconSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Color intent. Maps to Motionly tokens via `currentColor` on the SVG.
 *
 * - `default` — inherits from the surrounding text color.
 * - `muted` / `subtle` — secondary or tertiary neutral.
 * - `primary` / `accent` / `warning` / `danger` — Motionly tokens.
 */
export type IconTone = 'default' | 'muted' | 'subtle' | 'primary' | 'accent' | 'warning' | 'danger';

type IconProps = {
  /** Lucide icon component to render. */
  icon: LucideIcon;
  /** Visual scale. Defaults to `md` (1.25rem). */
  size?: IconSize;
  /** Color intent. Defaults to `default` (inherit). */
  tone?: IconTone;
  /**
   * Accessible label. **Required when the icon conveys meaning** that
   * is not otherwise present in the surrounding text. When omitted,
   * the icon is treated as decorative and marked `aria-hidden`.
   */
  label?: string;
  /** Extra utility classes. Do not pass hardcoded colors. */
  className?: string;
  /** Override the icon's `strokeWidth`. */
  strokeWidth?: number;
};

const SIZE_CLASS: Record<IconSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

const TONE_CLASS: Record<IconTone, string> = {
  default: '',
  muted: 'text-motionly-neutral-600 dark:text-motionly-neutral-300',
  subtle: 'text-motionly-neutral-500 dark:text-motionly-neutral-400',
  primary: 'text-motionly-primary',
  accent: 'text-motionly-accent',
  warning: 'text-motionly-warning',
  danger: 'text-motionly-danger',
};

/**
 * Token-aware wrapper around any `lucide-react` icon.
 *
 * Use `Icon` in product screens instead of importing the raw Lucide
 * component so size + color tokens stay consistent and so tree-shaking
 * works the same everywhere. The actual icon is passed in by the
 * caller (`icon={Eye}`), keeping the bundle to only the icons each
 * screen uses.
 *
 * Accessibility:
 * - Decorative icons (no `label`) are rendered with `aria-hidden="true"`
 *   and `focusable="false"` so assistive tech skips them.
 * - Meaningful icons must pass `label`. The wrapper exposes it via
 *   `role="img"` + `aria-label` and also as a visually-hidden `<title>`
 *   inside the SVG via the `aria-label` attribute on the SVG itself.
 *
 * Not for:
 * - Bulk-importing every Lucide icon up-front (defeats tree shaking).
 * - Custom illustrations or brand marks — those belong in
 *   `src/assets/` once they exist.
 */
export function Icon({
  icon: IconComponent,
  size = 'md',
  tone = 'default',
  label,
  className,
  strokeWidth,
}: IconProps): JSX.Element {
  const decorative = label === undefined;
  return (
    <IconComponent
      className={cn(SIZE_CLASS[size], TONE_CLASS[tone], className)}
      strokeWidth={strokeWidth}
      aria-hidden={decorative ? true : undefined}
      focusable={decorative ? false : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
    />
  );
}
