import type { ReactNode } from 'react';

import { Card } from '@components/primitives';
import { cn } from '@utils/cn';

type EmptyStateProps = {
  /**
   * Title rendered as the empty-state heading. Use plain, honest
   * language — never fabricate a benefit ("You've earned 0 streaks!").
   */
  title: string;
  /** Optional supporting description below the title. */
  description?: string;
  /**
   * Optional illustration / icon slot. Pass a real graphic node — the
   * component does not generate one. Wrappers are responsible for
   * sizing.
   */
  illustration?: ReactNode;
  /** Primary call-to-action (typically a `<Button variant="primary">`). */
  action?: ReactNode;
  /** Secondary action (typically a ghost / link). */
  secondaryAction?: ReactNode;
  /**
   * Override the heading element. Defaults to `h2`, matching most
   * places empty states appear (under a page heading).
   */
  headingAs?: 'h1' | 'h2' | 'h3';
  /** Extra utility classes for the outer wrapper. */
  className?: string;
};

const HEADING_CLASS: Record<NonNullable<EmptyStateProps['headingAs']>, string> = {
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
};

/**
 * Friendly empty-state primitive for "no data yet" and onboarding gaps.
 *
 * Use `EmptyState` whenever a section has nothing to render and the
 * cause is not an error. Pair the title with an honest description
 * and a single primary CTA that performs the action that will fill
 * the section.
 *
 * Composition:
 * - Wraps content in an outlined `Card` so empty states look
 *   intentional rather than blank.
 * - Uses Phase 8 primitives for the action slots — callers pass real
 *   buttons / links; this component does not invent CTAs.
 *
 * Accessibility:
 * - Renders the title as a heading (default `h2`). Callers must keep
 *   the document heading hierarchy honest by selecting the right
 *   `headingAs`.
 *
 * Data / fake-data rules:
 * - **No fake stats.** Empty states must not invent placeholder
 *   numbers ("0 workouts so far!") that imply data exists.
 * - **No marketing copy.** Trust over hype — describe what will
 *   populate the section once real data exists.
 */
export function EmptyState({
  title,
  description,
  illustration,
  action,
  secondaryAction,
  headingAs = 'h2',
  className,
}: EmptyStateProps): JSX.Element {
  const HeadingTag = headingAs;
  return (
    <Card
      variant="outlined"
      padding="lg"
      className={cn('flex flex-col items-center text-center', className)}
    >
      {illustration ? (
        <div
          className="mb-4 text-motionly-neutral-500 dark:text-motionly-neutral-400"
          aria-hidden="true"
        >
          {illustration}
        </div>
      ) : null}
      <HeadingTag
        className={cn(
          'font-semibold text-motionly-neutral-900 dark:text-motionly-neutral-50',
          HEADING_CLASS[headingAs],
        )}
      >
        {title}
      </HeadingTag>
      {description ? (
        <p className="mt-2 max-w-md text-body text-motionly-neutral-600 dark:text-motionly-neutral-300">
          {description}
        </p>
      ) : null}
      {action || secondaryAction ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          {action ? <div>{action}</div> : null}
          {secondaryAction ? <div>{secondaryAction}</div> : null}
        </div>
      ) : null}
    </Card>
  );
}
