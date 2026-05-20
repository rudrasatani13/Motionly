import { Lock } from 'lucide-react';

import { Icon, Row, Text } from '@components/primitives';
import { cn } from '@utils/cn';

type LockedContentBadgeProps = {
  /** Override the visible label. Defaults to `"Pro"`. */
  label?: string;
  /** Extra utility classes for layout tweaks. */
  className?: string;
};

/**
 * Phase 14 — Inline "Pro" lock indicator used on locked workout
 * and exercise cards.
 *
 * The lock icon makes the status visible without relying on color
 * alone (a hard rule from the wireframe and coding standards) and
 * the label spells out the tier in text so assistive tech does not
 * have to interpret the icon.
 *
 * Phase 14 does **not** implement real subscription state — this
 * badge surfaces the canonical content tier from the catalog.
 */
export function LockedContentBadge({
  label = 'Pro',
  className,
}: LockedContentBadgeProps): JSX.Element {
  return (
    <Row
      align="center"
      gap="xs"
      className={cn(
        'inline-flex rounded-full border border-motionly-warning/40 bg-motionly-warning/10 px-2 py-0.5',
        className,
      )}
      aria-label={`${label} — locked`}
    >
      <Icon icon={Lock} size="sm" tone="warning" />
      <Text variant="caption" tone="warning">
        {label}
      </Text>
    </Row>
  );
}
