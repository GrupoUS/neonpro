// "Beleza Inteligente Brasileira" Design System
// Brazilian healthcare-optimized design tokens

export const colors = {
  // Primary colors - inspired by Brazilian nature and trust
  primary: {
    50: "#E6F7FF", // Light sky blue - trust and clarity
    100: "#BAE7FF",
    200: "#91D5FF",
    300: "#69C0FF",
    400: "#40A9FF",
    500: "#1890FF", // Main primary - professional blue
    600: "#096DD9", // Darker for better contrast
    700: "#0050B3",
    800: "#003A8C",
    900: "#002766", // Darkest for text on light backgrounds
  },

  // Secondary colors - warm Brazilian tones
  secondary: {
    50: "#FFF7E6", // Warm cream
    100: "#FFE7BA",
    200: "#FFD591",
    300: "#FFC069",
    400: "#FFAB40",
    500: "#FF9500", // Brazilian sunset orange
    600: "#D68400",
    700: "#AD6B00",
    800: "#8A5500",
    900: "#614000",
  },

  // Healthcare-specific colors
  health: {
    emergency: "#FF4D4F", // Critical red
    warning: "#FAAD14", // Attention yellow
    success: "#52C41A", // Health green
    info: "#1890FF", // Information blue
    cardiac: "#E91E63", // Heart-related pink
    mental: "#9C27B0", // Mental health purple
    pediatric: "#FF9800", // Child-friendly orange
    geriatric: "#795548", // Elder care brown
  },

  // LGPD compliance colors
  privacy: {
    public: "#52C41A", // Green - safe to share
    internal: "#1890FF", // Blue - internal only
    confidential: "#FAAD14", // Yellow - confidential
    restricted: "#FF4D4F", // Red - highly restricted
  },

  // Accessibility colors (WCAG 2.1 AA+ compliant)
  text: {
    primary: "#262626", // High contrast for body text
    secondary: "#595959", // Medium contrast for secondary text
    disabled: "#BFBFBF", // Disabled state
    inverse: "#FFFFFF", // Text on dark backgrounds
  },

  background: {
    primary: "#FFFFFF", // Main background
    secondary: "#FAFAFA", // Light gray background
    tertiary: "#F5F5F5", // Darker gray for sections
    overlay: "rgba(0, 0, 0, 0.45)", // Modal overlays
  },

  // Regional connectivity indicators
  connectivity: {
    excellent: "#52C41A", // 5G/strong wifi
    good: "#1890FF", // 4G
    fair: "#FAAD14", // 3G
    poor: "#FF4D4F", // 2G/weak signal
  },
} as const;

export const typography = {
  // Font families optimized for Portuguese
  fontFamily: {
    primary: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
    secondary: "Source Sans Pro, Arial, sans-serif",
    monospace:
      'JetBrains Mono, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },

  // Font sizes with Brazilian accessibility standards
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px - minimum for accessibility
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "4rem", // 64px
  },

  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
} as const;
export const spacing = {
  // Spacing scale optimized for touch targets on tablets
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px - minimum touch target
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px - recommended touch target
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
} as const;

export const shadows = {
  // Subtle shadows for Brazilian light conditions
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  none: "0 0 #0000",
} as const;

export const borderRadius = {
  none: "0",
  sm: "0.125rem", // 2px
  base: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
} as const;

// Responsive breakpoints optimized for Brazilian device usage
export const breakpoints = {
  sm: "640px", // Mobile landscape / small tablets
  md: "768px", // Tablets
  lg: "1024px", // Small laptops / large tablets
  xl: "1280px", // Desktops
  "2xl": "1536px", // Large desktops
} as const;

// Animation durations for smooth interactions
export const animation = {
  duration: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },
  easing: {
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;

// Z-index scale for proper layering
export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Complete theme object
export const brazilianHealthcareTheme = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  breakpoints,
  animation,
  zIndex,
} as const;

export type BrazilianHealthcareTheme = typeof brazilianHealthcareTheme;
