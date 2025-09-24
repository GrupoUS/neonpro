/**
 * Accessibility Configuration
 *
 * Configuration constants for accessibility features
 */

export interface HighContrastTheme {
  primary: string
  secondary: string
  background: string
  text: string
  border: string
  focus: string
  success: string
  warning: string
  error: string
}

export const highContrastTheme: HighContrastTheme = {
  primary: '#000000',
  secondary: '#ffffff',
  background: '#ffffff',
  text: '#000000',
  border: '#000000',
  focus: '#0000ff',
  success: '#008000',
  warning: '#ff8c00',
  error: '#ff0000',
}

export const fontSizeMap = {
  small: '14px',
  medium: '16px',
  large: '18px',
  'x-large': '20px',
}
