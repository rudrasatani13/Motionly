import type { LibraryArtworkTone } from '@/types/workout-library';

/**
 * Token-only gradient classes for the abstract artwork tile used on
 * workout and exercise cards. Phase 14 deliberately ships **no**
 * photographic media — every "thumbnail" is a tonal gradient with
 * an icon overlay, so the library never implies fake activity
 * photos.
 *
 * Add a new tone here when introducing artwork variety; do not
 * inline gradient classes at the call site.
 */
export const ARTWORK_GRADIENT_CLASS: Record<LibraryArtworkTone, string> = {
  primary:
    'bg-gradient-to-br from-motionly-primary/30 via-motionly-primary/10 to-motionly-bg-light ' +
    'dark:from-motionly-primary/40 dark:via-motionly-primary/15 dark:to-motionly-neutral-900',
  accent:
    'bg-gradient-to-br from-motionly-accent/30 via-motionly-accent/10 to-motionly-bg-light ' +
    'dark:from-motionly-accent/40 dark:via-motionly-accent/15 dark:to-motionly-neutral-900',
  neutral:
    'bg-gradient-to-br from-motionly-neutral-200 via-motionly-neutral-100 to-motionly-bg-light ' +
    'dark:from-motionly-neutral-800 dark:via-motionly-neutral-900 dark:to-motionly-neutral-900',
  warning:
    'bg-gradient-to-br from-motionly-warning/30 via-motionly-warning/10 to-motionly-bg-light ' +
    'dark:from-motionly-warning/40 dark:via-motionly-warning/15 dark:to-motionly-neutral-900',
  sky:
    'bg-gradient-to-br from-motionly-primary/25 via-motionly-accent/10 to-motionly-bg-light ' +
    'dark:from-motionly-primary/35 dark:via-motionly-accent/15 dark:to-motionly-neutral-900',
  rose:
    'bg-gradient-to-br from-motionly-warning/25 via-motionly-primary/10 to-motionly-bg-light ' +
    'dark:from-motionly-warning/35 dark:via-motionly-primary/15 dark:to-motionly-neutral-900',
};
