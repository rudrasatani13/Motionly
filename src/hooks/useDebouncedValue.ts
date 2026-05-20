import { useEffect, useState } from 'react';

/**
 * Debounce any value so downstream computations (filtering, search,
 * effect dependencies) only update once the value has settled.
 *
 * Used in Phase 14 by the exercise search input so the catalog
 * filter does not re-run on every keystroke. Generic over the value
 * type so it can be reused by future search/filter UIs without
 * casting.
 *
 * - Default delay (200ms) keeps the search feel instant on the
 *   small MVP catalog while still collapsing rapid typing.
 * - Has no dependencies; just `setTimeout` + `clearTimeout`.
 */
export function useDebouncedValue<T>(value: T, delayMs: number = 200): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      window.clearTimeout(handle);
    };
  }, [value, delayMs]);

  return debounced;
}
