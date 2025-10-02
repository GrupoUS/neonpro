// Healthcare components export index
export { EmergencyAlert } from './emergency-alert'
export type { EmergencyAlertProps } from './emergency-alert'

export { HealthcareThemeProvider, useHealthcareTheme } from './healthcare-theme-provider'
export type { HealthcareThemeProviderProps, HealthcareThemeContextType } from './healthcare-theme-provider'

// LGPD compliance components
export { LgpdConsentBanner } from './lgpd-consent-banner'
export type { LgpdConsentBannerProps, LgpdConsentType, LgpdDataCategory } from './lgpd-consent-banner'

// Data masking and privacy
export { DataMaskingInput } from './lgpd-compliance/data-masking-input'
export type { DataMaskingInputProps, DataSensitivityLevel } from './lgpd-compliance/data-masking-input'

// Healthcare validation utilities
export { validateHealthcareData, validateEmergencyData, classifyHealthcareData } from '../../utils/healthcare-validation'
export type { HealthcareValidationResult, DataSensitivity } from '../../utils/healthcare-validation'

// Accessibility utilities
export { announceToScreenReader, createScreenReaderDescription, HealthcarePriority } from '../../utils/accessibility'
export type { HealthcareA11yContext, WCAGLevel } from '../../utils/accessibility'

// Emergency response system
export const EMERGENCY_RESPONSE_VERSION = '1.0.0'
export const EMERGENCY_FEATURES = {
  CRITICAL_ALERTS: true,
  PATIENT_SAFETY_CHECKS: true,
  EMERGENCY_NOTIFICATIONS: true,
  CRITICAL_CARE_INTEGRATION: true,
} as const