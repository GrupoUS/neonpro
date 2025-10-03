/**
 * Theme type definitions for NeonPro
 */

export interface ThemeColorPalette {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface ThemeColors {
  primary: ThemeColorPalette
  secondary: ThemeColorPalette
  accent: ThemeColorPalette
  neutral: ThemeColorPalette
}

export interface ThemeFonts {
  primary: string
  secondary: string
  mono: string
}

export interface ThemeBorderRadius {
  sm: string
  md: string
  lg: string
  xl: string
}

export interface ThemeShadows {
  sm: string
  md: string
  lg: string
  xl: string
}

export interface Theme {
  name: string
  colors: ThemeColors
  fonts: ThemeFonts
  borderRadius: ThemeBorderRadius
  shadows: ThemeShadows
}

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemeColorScheme = 'default' | 'high-contrast' | 'colorblind-friendly'

export interface ThemeConfig {
  mode: ThemeMode
  colorScheme: ThemeColorScheme
  customColors?: Partial<ThemeColors>
  reducedMotion: boolean
  highContrast: boolean
}

export interface ThemeContextValue {
  theme: Theme
  config: ThemeConfig
  setMode: (mode: ThemeMode) => void
  setColorScheme: (scheme: ThemeColorScheme) => void
  toggleReducedMotion: () => void
  toggleHighContrast: () => void
  setCustomColors: (colors: Partial<ThemeColors>) => void
}