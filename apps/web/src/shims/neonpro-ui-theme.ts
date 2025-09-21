import { useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia
        && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return theme;
}

export function useThemeBridge() {
  const [theme, setThemeState] = useState<Theme>(_() => {
    try {
      return (localStorage.getItem('neonpro-theme') as Theme) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const resolvedTheme = useMemo(_() => resolveTheme(theme), [theme]);

  useEffect(_() => {
    try {
      localStorage.setItem('neonpro-theme', theme);
    } catch {}
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [theme, resolvedTheme]);

  const setTheme = (next: Theme) => setThemeState(next);

  return { theme, resolvedTheme, setTheme } as const;
}
