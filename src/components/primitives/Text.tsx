import type { CSSProperties, ElementType, ReactNode } from 'react';

import { cn } from '@utils/cn';

/**
 * Visual / typographic intent of a `Text` instance.
 *
 * Maps directly to the Phase 5 Tailwind typography utilities defined in
 * `tailwind.config.ts` (`text-h1` … `text-label`). Each variant ships
 * with a sensible default DOM element (e.g. `h1` for `h1`, `p` for
 * `body`), which callers can override with `as` when the visual style
 * and the heading hierarchy disagree.
 */
export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';

/**
 * Color intent for `Text`. Maps to Motionly neutral / brand tokens so
 * callers avoid hardcoded colors. Use `inherit` to let the parent
 * decide — useful inside buttons, badges, and other recolored surfaces.
 */
export type TextTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'primary'
  | 'accent'
  | 'warning'
  | 'danger'
  | 'inherit';

type TextOwnProps = {
  /** Visual intent. Defaults to `body`. */
  variant?: TextVariant;
  /** Color intent mapped to Motionly tokens. Defaults to `default`. */
  tone?: TextTone;
  /** Override the rendered element (e.g. render an `h2` styled as body). */
  as?: ElementType;
  /** Children — usually plain text. */
  children?: ReactNode;
  /** Extra utility classes; do not pass hardcoded colors here. */
  className?: string;
  /** Optional inline style escape hatch. Avoid for color/typography. */
  style?: CSSProperties;
};

type DefaultElement = 'p';

type TextProps<E extends ElementType = DefaultElement> = TextOwnProps &
  Omit<React.ComponentPropsWithoutRef<E>, keyof TextOwnProps>;

const VARIANT_CLASS: Record<TextVariant, string> = {
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  body: 'text-body',
  caption: 'text-caption',
  label: 'text-label',
};

const DEFAULT_ELEMENT_FOR_VARIANT: Record<TextVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  caption: 'p',
  label: 'span',
};

const TONE_CLASS: Record<TextTone, string> = {
  default: 'text-motionly-neutral-900 dark:text-motionly-neutral-50',
  muted: 'text-motionly-neutral-600 dark:text-motionly-neutral-300',
  subtle: 'text-motionly-neutral-500 dark:text-motionly-neutral-400',
  primary: 'text-motionly-primary',
  accent: 'text-motionly-accent',
  warning: 'text-motionly-warning',
  danger: 'text-motionly-danger',
  inherit: '',
};

/**
 * Typographic primitive aligned to Phase 5 design tokens.
 *
 * Use `Text` for every piece of static copy in product screens so that
 * font-size, line-height, weight, and color stay consistent across the
 * app and respect theming.
 *
 * Variants:
 * - `h1` / `h2` / `h3` — section and page headings. Renders the
 *   matching semantic element by default; override with `as` only when
 *   visual size and heading level genuinely diverge.
 * - `body` — default paragraph copy.
 * - `caption` — small supporting text (timestamps, hints).
 * - `label` — UI labels and chip/badge text.
 *
 * Accessibility:
 * - Callers are responsible for maintaining a valid heading hierarchy
 *   (one `h1` per route, no skipped levels). Visual size and heading
 *   level are independent — choose `variant` for visuals and `as` for
 *   semantics when they need to differ.
 *
 * Not for:
 * - Building paragraphs of rich content with mixed inline styles —
 *   compose multiple `Text` instances or use raw HTML.
 * - Animated number displays (RepCounter, ScoreBadge) — those land in
 *   Phase 9.
 */
export function Text<E extends ElementType = DefaultElement>({
  variant = 'body',
  tone = 'default',
  as,
  className,
  children,
  ...rest
}: TextProps<E>): JSX.Element {
  const Component = (as ?? DEFAULT_ELEMENT_FOR_VARIANT[variant]) as ElementType;
  return (
    <Component className={cn(VARIANT_CLASS[variant], TONE_CLASS[tone], className)} {...rest}>
      {children}
    </Component>
  );
}

type HeadingProps = Omit<TextOwnProps, 'variant'> & {
  /** Heading level. Defaults to `2`. */
  level?: 1 | 2 | 3;
} & Omit<React.ComponentPropsWithoutRef<'h2'>, keyof TextOwnProps>;

/**
 * Convenience wrapper that picks the matching `Text` variant + element
 * for a heading level. Equivalent to `<Text variant="h1" as="h1" />`.
 */
export function Heading({ level = 2, className, children, ...rest }: HeadingProps): JSX.Element {
  const variant: TextVariant = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
  const element: ElementType = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
  return (
    <Text variant={variant} as={element} className={className} {...rest}>
      {children}
    </Text>
  );
}
