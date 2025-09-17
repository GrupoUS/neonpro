/**
 * Healthcare Components Index
 * 
 * Exports all healthcare-specific components and utilities
 */

export { HealthcareThemeProvider, useHealthcareTheme } from './healthcare-theme-provider';
export { LGPDConsentBanner, useLGPDConsent } from './lgpd-consent-banner';

export type {
  HealthcareThemeProviderProps,
  HealthcareThemeConfig as HealthcareTheme,
  HealthcareThemeContextValue as HealthcareThemeContextType,
} from './healthcare-theme-provider';

export type {
  LGPDConsentBannerProps,
} from './lgpd-consent-banner';