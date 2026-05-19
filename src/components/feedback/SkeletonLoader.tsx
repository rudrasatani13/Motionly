import type { CSSProperties } from 'react';

import { cn } from '@utils/cn';

/**
 * Shape of the skeleton placeholder.
 *
 * - `line`   — a single text line (default).
 * - `block`  — a rectangular block (e.g. an image / chart placeholder).
 * - `circle` — circular placeholder (e.g. avatar).
 * - `card`   — a tall rectangular card placeholder with rounded corners.
 */
export type SkeletonShape = 'line' | 'block' | 'circle' | 'card';

type SkeletonLoaderProps = {
  /** Placeholder shape. Defaults to `line`. */
  shape?: SkeletonShape;
  /**
   * Tailwind width class (`'w-24'`, `'w-full'`, …) or a raw CSS
   * length passed via `style`. The component accepts both so callers
   * can stay token-friendly or override for one-off layouts.
   */
  width?: string;
  /** Tailwind height class or a raw CSS length passed via `style`. */
  height?: string;
  /**
   * Number of `line` skeletons to render. Only meaningful when
   * `shape === 'line'`. Defaults to `1`.
   */
  lines?: number;
  /** Extra utility classes for the outer wrapper. */
  className?: string;
};

const DEFAULT_HEIGHT_CLASS: Record<SkeletonShape, string> = {
  line: 'h-3',
  block: 'h-24',
  circle: 'h-10',
  card: 'h-32',
};

const DEFAULT_WIDTH_CLASS: Record<SkeletonShape, string> = {
  line: 'w-full',
  block: 'w-full',
  circle: 'w-10',
  card: 'w-full',
};

const SHAPE_RADIUS_CLASS: Record<SkeletonShape, string> = {
  line: 'rounded',
  block: 'rounded-lg',
  circle: 'rounded-full',
  card: 'rounded-2xl',
};

const BASE_CLASS =
  'animate-pulse bg-motionly-neutral-200 dark:bg-motionly-neutral-800 motion-reduce:animate-none';

function resolveDimensionClass(value: string | undefined, fallback: string): string {
  if (value === undefined) {
    return fallback;
  }
  // If the caller passed a Tailwind class (starts with `w-` / `h-`), use it.
  if (value.startsWith('w-') || value.startsWith('h-')) {
    return value;
  }
  return '';
}

function resolveDimensionStyle(width?: string, height?: string): CSSProperties | undefined {
  const style: CSSProperties = {};
  if (width !== undefined && !width.startsWith('w-')) {
    style.width = width;
  }
  if (height !== undefined && !height.startsWith('h-')) {
    style.height = height;
  }
  return Object.keys(style).length > 0 ? style : undefined;
}

/**
 * Loading placeholder skeleton with a token-aware pulse animation.
 *
 * `SkeletonLoader` renders a low-contrast block that shimmers while
 * async content loads. It is **always decorative** — the underlying
 * data is the source of truth and screen readers should not announce
 * the placeholder. The component sets `aria-hidden="true"` accordingly.
 *
 * Animation:
 * - Tailwind's `animate-pulse`. Honors `prefers-reduced-motion` via
 *   `motion-reduce:animate-none` so users with reduced-motion settings
 *   see a static block instead of a pulse.
 *
 * Data rules:
 * - Do not nest fake content (fake user names, fake scores) inside the
 *   skeleton. The placeholder is purely visual.
 * - Do not use this component as a loading spinner — it represents
 *   the *shape* of incoming content, not a generic "loading" state.
 */
export function SkeletonLoader({
  shape = 'line',
  width,
  height,
  lines = 1,
  className,
}: SkeletonLoaderProps): JSX.Element {
  const widthClass = resolveDimensionClass(width, DEFAULT_WIDTH_CLASS[shape]);
  const heightClass = resolveDimensionClass(height, DEFAULT_HEIGHT_CLASS[shape]);
  const style = resolveDimensionStyle(width, height);

  if (shape === 'line' && lines > 1) {
    return (
      <div aria-hidden="true" className={cn('flex flex-col gap-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <span
            key={index}
            className={cn(
              BASE_CLASS,
              SHAPE_RADIUS_CLASS.line,
              heightClass,
              index === lines - 1 ? 'w-2/3' : widthClass,
            )}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'block',
        BASE_CLASS,
        SHAPE_RADIUS_CLASS[shape],
        widthClass,
        heightClass,
        className,
      )}
      style={style}
    />
  );
}
