/**
 * Accessibility Theme Configuration
 *
 * Configurações centralizadas para temas de acessibilidade do NeonPro
 * Extraído de NeonProAccessibility.tsx para melhor organização e reutilização
 */

// High Contrast Theme Interface
export interface HighContrastTheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
  focus: string;
  success: string;
  warning: string;
  error: string;
}

// High Contrast Theme Configuration
export const HIGH_CONTRAST_THEME: HighContrastTheme = {
  primary: '#000000',
  secondary: '#ffffff',
  background: '#ffffff',
  text: '#000000',
  border: '#000000',
  focus: '#0000ff',
  success: '#008000',
  warning: '#ff8c00',
  error: '#ff0000',
};

// Font Size Mapping Configuration
export const FONT_SIZE_MAP = {
  small: '14px',
  medium: '16px',
  large: '18px',
  'x-large': '20px',
} as const;

// Font Size Type
export type FontSize = keyof typeof FONT_SIZE_MAP;

// Accessibility Settings Interface
export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  fontSize: FontSize;
  textToSpeech: boolean;
  keyboardMode: boolean;
  focusVisible: boolean;
  announcementsEnabled: boolean;
}

// Default Accessibility Settings
export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  fontSize: 'medium',
  textToSpeech: false,
  keyboardMode: false,
  focusVisible: true,
  announcementsEnabled: true,
};

// Theme Application Utilities
export const applyHighContrastTheme = (enabled: boolean): void => {
  document.documentElement.classList.toggle('high-contrast', enabled);

  if (enabled) {
    const root = document.documentElement;
    Object.entries(HIGH_CONTRAST_THEME).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  } else {
    const root = document.documentElement;
    Object.keys(HIGH_CONTRAST_THEME).forEach(key => {
      root.style.removeProperty(`--color-${key}`);
    });
  }
};

export const applyFontSize = (fontSize: FontSize): void => {
  document.documentElement.setAttribute('data-font-size', fontSize);
  document.documentElement.style.setProperty('--font-size-base', FONT_SIZE_MAP[fontSize]);
};

export const applyReducedMotion = (enabled: boolean): void => {
  document.documentElement.classList.toggle('reduced-motion', enabled);
};

// CSS Custom Properties for High Contrast Theme
export const HIGH_CONTRAST_CSS_VARIABLES = `
  :root.high-contrast {
    --color-primary: ${HIGH_CONTRAST_THEME.primary};
    --color-secondary: ${HIGH_CONTRAST_THEME.secondary};
    --color-background: ${HIGH_CONTRAST_THEME.background};
    --color-text: ${HIGH_CONTRAST_THEME.text};
    --color-border: ${HIGH_CONTRAST_THEME.border};
    --color-focus: ${HIGH_CONTRAST_THEME.focus};
    --color-success: ${HIGH_CONTRAST_THEME.success};
    --color-warning: ${HIGH_CONTRAST_THEME.warning};
    --color-error: ${HIGH_CONTRAST_THEME.error};
  }
  
  :root[data-font-size="small"] {
    --font-size-base: ${FONT_SIZE_MAP.small};
  }
  
  :root[data-font-size="medium"] {
    --font-size-base: ${FONT_SIZE_MAP.medium};
  }
  
  :root[data-font-size="large"] {
    --font-size-base: ${FONT_SIZE_MAP.large};
  }
  
  :root[data-font-size="x-large"] {
    --font-size-base: ${FONT_SIZE_MAP['x-large']};
  }
  
  :root.reduced-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
`;
