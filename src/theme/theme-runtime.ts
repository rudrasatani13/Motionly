import type { ResolvedTheme, ThemePreference } from './types';

const THEME_STORAGE_KEY = 'motionly.theme';
const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';
const FAVICON_SELECTOR = 'link[data-motionly-favicon]';
const FAVICON_BY_THEME: Record<ResolvedTheme, string> = {
  light: '/favicon-light-96x96.png',
  dark: '/favicon-96x96.png',
};

function canUseDOM(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function readStoredThemePreference(): ThemePreference {
  if (!canUseDOM()) {
    return 'system';
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(storedTheme) ? storedTheme : 'system';
  } catch {
    return 'system';
  }
}

export function writeStoredThemePreference(theme: ThemePreference): void {
  if (!canUseDOM()) {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable in private modes; the in-memory theme still works.
  }
}

export function getSystemResolvedTheme(): ResolvedTheme {
  if (!canUseDOM() || !window.matchMedia) {
    return 'light';
  }

  return window.matchMedia(SYSTEM_DARK_QUERY).matches ? 'dark' : 'light';
}

export function applyResolvedTheme(resolvedTheme: ResolvedTheme): void {
  if (!canUseDOM()) {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle('dark', resolvedTheme === 'dark');
  root.dataset.theme = resolvedTheme;
  root.style.colorScheme = resolvedTheme;

  const favicon = document.querySelector<HTMLLinkElement>(FAVICON_SELECTOR);
  if (favicon) {
    favicon.href = FAVICON_BY_THEME[resolvedTheme];
  }
}

export function subscribeToSystemThemeChange(
  onChange: (resolvedTheme: ResolvedTheme) => void,
): () => void {
  if (!canUseDOM() || !window.matchMedia) {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia(SYSTEM_DARK_QUERY);
  const handleChange = (event: MediaQueryListEvent): void => {
    onChange(event.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handleChange);

  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}
