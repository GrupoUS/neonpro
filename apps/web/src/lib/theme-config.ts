/**
 * TweakCN NEONPRO Theme Configuration
 * Professional healthcare theme settings and utilities
 * Brazilian compliance-aware design system
 */

// TweakCN NEONPRO Color Palette
export const neonproColors = {
  // Base Colors
  background: '#fcfcfc',
  foreground: '#171717',
  card: '#fcfcfc',
  cardForeground: '#171717',
  popover: '#fcfcfc',
  popoverForeground: '#525252',

  // Primary - Medical Green
  primary: '#72e3ad',
  primaryForeground: '#1e2723',

  // Secondary & Accent
  secondary: '#fdfdfd',
  secondaryForeground: '#171717',
  accent: '#ededed',
  accentForeground: '#202020',
  muted: '#ededed',
  mutedForeground: '#202020',

  // Form & Interaction
  border: '#dfdfdf',
  input: '#f6f6f6',
  ring: '#72e3ad',

  // Status & Feedback
  destructive: '#ca3214',
  destructiveForeground: '#fffcfc',

  // Chart & Visualization
  chart: {
    1: '#72e3ad', // Primary data
    2: '#3b82f6', // Information
    3: '#8b5cf6', // Analysis
    4: '#f59e0b', // Attention/Warning
    5: '#10b981', // Success/Positive
  },

  // Sidebar & Navigation
  sidebar: {
    background: '#fcfcfc',
    foreground: '#707070',
    primary: '#72e3ad',
    primaryForeground: '#1e2723',
  },
} as const;

// Dark Mode Color Palette
export const neonproDarkColors = {
  background: '#0a0a0a',
  foreground: '#fafafa',
  card: '#141414',
  cardForeground: '#fafafa',
  popover: '#0a0a0a',
  popoverForeground: '#fafafa',

  primary: '#72e3ad',
  primaryForeground: '#0a0a0a',

  secondary: '#262626',
  secondaryForeground: '#fafafa',
  accent: '#262626',
  accentForeground: '#fafafa',
  muted: '#262626',
  mutedForeground: '#a3a3a3',

  border: '#262626',
  input: '#262626',
  ring: '#72e3ad',

  destructive: '#ef4444',
  destructiveForeground: '#fafafa',

  chart: {
    1: '#72e3ad',
    2: '#60a5fa',
    3: '#a78bfa',
    4: '#fbbf24',
    5: '#34d399',
  },

  sidebar: {
    background: '#0a0a0a',
    foreground: '#a3a3a3',
    primary: '#72e3ad',
    primaryForeground: '#0a0a0a',
  },
} as const;

// Healthcare-Specific Colors
export const healthcareColors = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ca3214',
  info: '#3b82f6',
  critical: '#dc2626',
} as const;

// Brazilian Compliance Colors
export const complianceColors = {
  lgpd: {
    granted: '#10b981',
    pending: '#f59e0b',
    denied: '#ca3214',
    expired: '#9ca3af',
  },
  cfm: {
    active: '#72e3ad',
    suspended: '#f59e0b',
    revoked: '#ca3214',
  },
  anvisa: {
    compliant: '#10b981',
    warning: '#f59e0b',
    nonCompliant: '#ca3214',
  },
} as const;

// Emergency Interface Colors
export const emergencyColors = {
  background: '#ffffff',
  foreground: '#000000',
  critical: '#ff0000',
  contrastRatio: '21:1',
} as const;

// Typography Scale
export const typography = {
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px  
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
  },
} as const;

// Spacing Scale
export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

// Breakpoints for Responsive Design
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Healthcare-Specific Breakpoints
export const healthcareBreakpoints = {
  mobile: '640px',     // Emergency one-thumb navigation
  tablet: '768px',     // Dual-hand operation
  desktop: '1024px',   // Multi-monitor support
  clinic: '1280px',    // Full clinic workspace
} as const;

// Animation Durations
export const animation = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

// Box Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;

// Theme Utilities
export const themeUtils = {
  /**
   * Get color with opacity
   */
  withOpacity: (color: string, opacity: number): string => {
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  },

  /**
   * Convert HSL to RGB
   */
  hslToRgb: (h: number, s: number, l: number): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;

    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / (1/12)) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };

    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  },

  /**
   * Get compliance status color
   */
  getComplianceColor: (type: 'lgpd' | 'cfm' | 'anvisa', status: string): string => {
    const colorMap = complianceColors[type];
    return colorMap[status as keyof typeof colorMap] || colorMap.granted || colorMap.active || colorMap.compliant;
  },

  /**
   * Get healthcare variant color
   */
  getHealthcareColor: (variant: keyof typeof healthcareColors): string => {
    return healthcareColors[variant];
  },

  /**
   * Generate CSS custom properties for theme
   */
  generateCSSProps: (isDark = false) => {
    const colors = isDark ? neonproDarkColors : neonproColors;
    const props: Record<string, string> = {};

    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          props[`--${key}-${subKey}`] = subValue;
        });
      } else {
        props[`--${key}`] = value;
      }
    });

    return props;
  },
} as const;

// Export complete theme configuration
export const neonproTheme = {
  colors: neonproColors,
  darkColors: neonproDarkColors,
  healthcareColors,
  complianceColors,
  emergencyColors,
  typography,
  spacing,
  borderRadius,
  breakpoints,
  healthcareBreakpoints,
  animation,
  shadows,
  utils: themeUtils,
} as const;

export type NeonproTheme = typeof neonproTheme;