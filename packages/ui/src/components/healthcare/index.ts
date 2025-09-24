/**
 * Healthcare Components Index
 *
 * Exports all healthcare-specific components and utilities
 */

export { HealthcareThemeProvider, useHealthcareTheme } from './healthcare-theme-provider'
export { LGPDConsentBanner, useLGPDConsent } from './lgpd-consent-banner'

export type {
  HealthcareThemeConfig as HealthcareTheme,
  HealthcareThemeContextValue as HealthcareThemeContextType,
  HealthcareThemeProviderProps,
} from './healthcare-theme-provider'

export type { LGPDConsentBannerProps } from './lgpd-consent-banner'
