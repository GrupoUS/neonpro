import * as React from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeProviderProps = React.ComponentProps<'div'> & {
  attribute?: 'class' | 'data-theme';
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

const THEME_STORAGE_KEY = 'neonpro-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyThemeToDocument(theme: Theme, attribute: 'class' | 'data-theme') {
  const root = document.documentElement;
  const resolved = theme === 'system' ? getSystemTheme() : theme;

  if (attribute === 'class') {
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    // Debug: Log theme application
    console.log(`🎨 Theme applied: ${resolved}`, {
      theme,
      resolved,
      classList: Array.from(root.classList),
      hasLight: root.classList.contains('light'),
      hasDark: root.classList.contains('dark'),
    });
  } else {
    root.setAttribute('data-theme', resolved);
  }
}

import { ThemeProviderBridge } from '@neonpro/ui';
export const ThemeProvider: React.FC<ThemeProviderProps> = (_{
  attribute = 'class',_defaultTheme = 'system',_enableSystem = true,_disableTransitionOnChange = true,_children,_...divProps
}) => {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>(
    defaultTheme === 'system'
      ? getSystemTheme()
      : (defaultTheme as 'light' | 'dark'),
  );

  React.useEffect(_() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored) {
      setThemeState(stored);
    } else {
      setThemeState(defaultTheme);
    }
  }, [defaultTheme]);

  React.useEffect(_() => {
    const resolved = theme === 'system' && enableSystem
      ? getSystemTheme()
      : (theme as 'light' | 'dark');
    const restore = disableTransitionOnChange
      ? (_() => {
        const css = document.createElement('style');
        css.appendChild(
          document.createTextNode('*{transition:none !important}'),
        );
        document.head.appendChild(css);
        return () => {
          // force reflow then remove
          void window.getComputedStyle(document.body);
          document.head.removeChild(css);
        };
      })()
      : () => {};

    applyThemeToDocument(theme, attribute);
    setResolvedTheme(resolved);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (theme === 'system' && enableSystem) {
        const sys = getSystemTheme();
        setResolvedTheme(sys);
        applyThemeToDocument('system', attribute);
      }
    };
    mql.addEventListener('change', onChange);

    return () => {
      mql.removeEventListener('change', onChange);
      restore();
    };
  }, [theme, attribute, enableSystem, disableTransitionOnChange]);

  const setTheme = React.useCallback((next: Theme) => setThemeState(next), []);

  const value = React.useMemo(_() => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <div {...divProps}>
      {/* @ts-ignore - provided by local Bridge in @neonpro/ui for shared usage */}
      <ThemeProviderBridge value={value}>{children}</ThemeProviderBridge>
    </div>
  );
};
