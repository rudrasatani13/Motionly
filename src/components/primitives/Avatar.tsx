import { User } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@utils/cn';

/** Visual scale of the avatar. */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = {
  /** Optional image source. If missing or broken, the fallback shows. */
  src?: string;
  /**
   * Alt text for the image. **Required when `src` is provided.** When
   * the avatar represents the current user / a specific person, pass
   * a descriptive alt (e.g. their display name). When purely
   * decorative, pass an empty string.
   */
  alt?: string;
  /**
   * Optional initials shown when no image is available. The caller
   * computes these from real data — the primitive does not derive
   * initials from `alt`, so it cannot accidentally render fake names.
   */
  initials?: string;
  /** Size token. Defaults to `md`. */
  size?: AvatarSize;
  /** Extra utility classes. Do not pass hardcoded colors. */
  className?: string;
};

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-caption',
  md: 'h-10 w-10 text-label',
  lg: 'h-14 w-14 text-body',
  xl: 'h-20 w-20 text-h3',
};

const ICON_SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
  xl: 'h-10 w-10',
};

/**
 * Round avatar primitive with a graceful fallback chain.
 *
 * Resolution order:
 *   1. `src` (if provided and loads successfully) → renders `<img>`.
 *   2. `initials` (if provided) → renders text on a neutral disc.
 *   3. Otherwise → renders a generic neutral disc with a Lucide
 *      `User` glyph.
 *
 * Privacy / fake-data rules:
 * - The primitive does **not** invent initials, names, or images. The
 *   caller passes only what it has from real user data; absent data
 *   simply renders the generic fallback.
 *
 * Accessibility:
 * - When `src` is set, `alt` is required and forwarded to the `<img>`.
 *   Pass an empty string when the avatar is purely decorative (e.g.
 *   adjacent to a visible name).
 * - The initials fallback exposes the same `alt` via `aria-label` on
 *   the container so screen readers can still identify the avatar.
 * - The icon fallback uses `aria-hidden` because the generic glyph
 *   carries no person-specific information.
 */
export function Avatar({ src, alt, initials, size = 'md', className }: AvatarProps): JSX.Element {
  const [imageFailed, setImageFailed] = useState(false);
  const canShowImage = Boolean(src) && !imageFailed;
  const showInitials = !canShowImage && Boolean(initials);
  const ariaLabel = showInitials && alt ? alt : undefined;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-motionly-neutral-100 text-motionly-neutral-700',
        'dark:bg-motionly-neutral-800 dark:text-motionly-neutral-200',
        SIZE_CLASS[size],
        className,
      )}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    >
      {canShowImage && src ? (
        <img
          src={src}
          alt={alt ?? ''}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : showInitials ? (
        <span className="font-medium uppercase tracking-wide">{initials}</span>
      ) : (
        <User aria-hidden="true" className={cn(ICON_SIZE_CLASS[size])} />
      )}
    </span>
  );
}
