import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ThemeContext } from './theme-context';
import {
  applyResolvedTheme,
  getSystemResolvedTheme,
  readStoredThemePreference,
  subscribeToSystemThemeChange,
  writeStoredThemePreference,
} from './theme-runtime';
import type { ResolvedTheme, ThemeContextValue, ThemePreference } from './types';

export type { ResolvedTheme, ThemeContextValue, ThemePreference } from './types';

type ThemeProviderProps = {
  children: ReactNode;
};

function resolveTheme(theme: ThemePreference, systemTheme: ResolvedTheme): ResolvedTheme {
  return theme === 'system' ? systemTheme : theme;
}

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [theme, setThemeState] = useState<ThemePreference>(readStoredThemePreference);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemResolvedTheme);
  const resolvedTheme = resolveTheme(theme, systemTheme);

  useEffect(() => {
    return subscribeToSystemThemeChange(setSystemTheme);
  }, []);

  useEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((nextTheme: ThemePreference): void => {
    setThemeState(nextTheme);
    writeStoredThemePreference(nextTheme);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
