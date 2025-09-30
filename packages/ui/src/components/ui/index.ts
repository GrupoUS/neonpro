// Core UI Components - Healthcare Optimized
export { Button, buttonVariants, type ButtonProps } from './button'
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card'
export { Input, MedicalInput, PatientDataInput, SensitiveInput, DateOfBirthInput, PhoneNumberInput, EmailInput, HealthcareIdInput, type InputProps } from './input'
export { Alert, AlertDescription, AlertTitle, EmergencyAlert, MedicalAlert, LgpdAlert, alertVariants } from './alert'
export { MobileHealthcareButton, EmergencyButton, MedicalActionButton, type MobileHealthcareButtonProps } from './mobile-healthcare-button'

// Healthcare-specific components  
export { EmergencyAlertManager, type EmergencyAlertProps } from '../healthcare/emergency-alert'

// Accessibility components
export { 
  KeyboardNavigation, 
  FocusTrap, 
  SkipLinks, 
  ScreenReaderAnnouncer, 
  HighContrastMode, 
  KeyboardHelp,
  type KeyboardNavigationProps,
  type FocusTrapProps
} from '../accessibility/keyboard-navigation'

// Re-export commonly used types and utilities
export type { VariantProps } from 'class-variance-authority'

// Version info for compatibility tracking
export const UI_COMPONENTS_VERSION = '1.0.0-healthcare'

// Healthcare compliance indicators
export const HEALTHCARE_COMPLIANCE = {
  WCAG_2_1_AA_PLUS: true,
  LGPD_COMPLIANT: true,
  ANVISA_COMPLIANT: true,
  CFM_COMPLIANT: true,
  EMERGENCY_READY: true,
  ACCESSIBILITY_ENHANCED: true,
} as const