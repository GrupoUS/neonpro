// NeonPro Healthcare UI Components Library
// WCAG 2.1 AA+ Compliant | LGPD/ANVISA/CFM Ready | Emergency Response Enabled

// Core UI Components
export {
  Button,
  buttonVariants,
  type ButtonProps,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  MedicalInput,
  PatientDataInput,
  SensitiveInput,
  DateOfBirthInput,
  PhoneNumberInput,
  EmailInput,
  HealthcareIdInput,
  type InputProps,
  Alert,
  AlertDescription,
  AlertTitle,
  EmergencyAlert,
  MedicalAlert,
  LgpdAlert,
  alertVariants,
  MobileHealthcareButton,
  EmergencyButton,
  MedicalActionButton,
  type MobileHealthcareButtonProps,
} from './ui'

// Import for internal use
import {
  Button as ButtonComponent,
  Card as CardComponent,
  Input as InputComponent,
  Alert as AlertComponent,
  EmergencyAlert as EmergencyAlertComponent,
  MobileHealthcareButton as MobileHealthcareButtonComponent,
  EmergencyButton as EmergencyButtonComponent,
  KeyboardNavigation as KeyboardNavigationComponent,
  EmergencyAlertManager as EmergencyAlertManagerComponent,
  FocusTrap as FocusTrapComponent,
  SkipLinks as SkipLinksComponent,
  ScreenReaderAnnouncer as ScreenReaderAnnouncerComponent,
  HighContrastMode as HighContrastModeComponent,
  KeyboardHelp as KeyboardHelpComponent,
} from './ui'

// Healthcare-Specific Components
export {
  EmergencyAlertManager,
  type EmergencyAlertProps,
} from './healthcare/emergency-alert'

// Accessibility & Compliance Components
export {
  KeyboardNavigation,
  FocusTrap,
  SkipLinks,
  ScreenReaderAnnouncer,
  HighContrastMode,
  KeyboardHelp,
  type KeyboardNavigationProps,
  type FocusTrapProps,
} from './accessibility/keyboard-navigation'

// Utility exports
export type { VariantProps } from 'class-variance-authority'

// Component collections for easy import
export const HealthcareUI = {
  // Core components
  Button: ButtonComponent,
  Card: CardComponent,
  Input: InputComponent,
  Alert: AlertComponent,
  
  // Healthcare-specific
  EmergencyAlert: EmergencyAlertComponent,
  MobileHealthcareButton: MobileHealthcareButtonComponent,
  
  // Accessibility
  KeyboardNavigation: KeyboardNavigationComponent,
} as const

export const EmergencyResponseUI = {
  EmergencyAlert: EmergencyAlertComponent,
  EmergencyAlertManager: EmergencyAlertManagerComponent,
  EmergencyButton: EmergencyButtonComponent,
  MobileHealthcareButton: MobileHealthcareButtonComponent,
} as const

export const AccessibilityUI = {
  KeyboardNavigation: KeyboardNavigationComponent,
  FocusTrap: FocusTrapComponent,
  SkipLinks: SkipLinksComponent,
  ScreenReaderAnnouncer: ScreenReaderAnnouncerComponent,
  HighContrastMode: HighContrastModeComponent,
  KeyboardHelp: KeyboardHelpComponent,
} as const

// Version and compliance information
export const NEONPRO_UI_VERSION = '1.0.0-healthcare'
export const UI_HEALTHCARE_COMPLIANCE = {
  WCAG_2_1_AA_PLUS: true,
  LGPD_COMPLIANT: true,
  ANVISA_COMPLIANT: true,
  CFM_COMPLIANT: true,
  EMERGENCY_READY: true,
  ACCESSIBILITY_ENHANCED: true,
  MOBILE_OPTIMIZED: true,
  SCREEN_READER_COMPATIBLE: true,
  KEYBOARD_NAVIGABLE: true,
  HIGH_CONTRAST_AVAILABLE: true,
} as const

// Healthcare-specific configuration
export const HEALTHCARE_UI_CONFIG = {
  touchTargetSize: 44, // Minimum touch target size in pixels
  emergencyResponseTime: 1500, // Maximum emergency response time in ms
  colorContrastRatio: 4.5, // Minimum WCAG contrast ratio
  animationDuration: 200, // Maximum animation duration in ms
  focusVisibleIndicator: true, // Show focus indicators
  screenReaderAnnouncements: true, // Enable screen reader announcements
} as const

// Feature flags for healthcare environments
export const HealthcareFeatures = {
  EMERGENCY_ALERTS: true,
  PATIENT_DATA_PROTECTION: true,
  LGPD_COMPLIANCE: true,
  ACCESSIBILITY_ENHANCEMENTS: true,
  MOBILE_HEALTHCARE_MODE: true,
  CLINICAL_WORKFLOW_OPTIMIZATION: true,
  EMERGENCY_RESPONSE_PROTOCOL: true,
  AUDIT_TRAIL_LOGGING: true,
  CONSENT_MANAGEMENT: true,
  ROLE_BASED_ACCESS: true,
} as const

// Development utilities
export const isHealthcareEnvironment = () => {
  if (typeof window !== 'undefined') {
    return process.env?.NODE_ENV === 'production' || 
           process.env?.HEALTHCARE_ENVIRONMENT === 'true' ||
           window.location.hostname.includes('healthcare') ||
           window.location.hostname.includes('clinic')
  }
  return false
}

export const isEmergencyMode = () => {
  if (typeof window !== 'undefined') {
    return process.env?.EMERGENCY_MODE === 'true' || 
           window.location.search.includes('emergency=true')
  }
  return false
}

// CSS classes for healthcare-specific styling
export const HealthcareCSSClasses = {
  emergency: 'bg-red-50 border-red-500 text-red-900',
  medical: 'bg-blue-50 border-blue-500 text-blue-900',
  warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
  success: 'bg-green-50 border-green-500 text-green-900',
  info: 'bg-gray-50 border-gray-500 text-gray-900',
  patientData: 'bg-purple-50 border-purple-500 text-purple-900',
  sensitive: 'bg-red-25 border-red-300 text-red-700',
  accessible: 'min-h-[44px] min-w-[44px]', // WCAG 2.1 AA+ touch targets
  highContrast: 'border-2 border-black bg-white text-black',
  focusVisible: 'outline-2 outline-blue-500 outline-offset-2',
} as const

// Default export for convenience
export default HealthcareUI