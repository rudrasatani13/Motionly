import clsx, { type ClassValue } from 'clsx';

/**
 * Conditionally compose Tailwind/utility class names.
 *
 * Thin re-export around `clsx` so the primitive components have one
 * stable import path for class composition. Keep this file boring —
 * if a real merging concern shows up later (e.g. conflicting Tailwind
 * utilities being passed by callers), introduce `tailwind-merge` here
 * and let every component pick it up for free.
 *
 * @example
 *   <button className={cn('px-3 py-2', isActive && 'bg-motionly-primary')} />
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
