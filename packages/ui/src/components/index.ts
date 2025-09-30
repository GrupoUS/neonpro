// NeonPro Aesthetic Clinic UI Components Library
// WCAG 2.1 AA+ Compliant | LGPD/ANVISA Ready | Premium Aesthetic Experience

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
  ClientDataInput,
  SensitiveInput,
  DateOfBirthInput,
  PhoneNumberInput,
  EmailInput,
  ClientIdInput,
  type InputProps,
  Alert,
  AlertDescription,
  AlertTitle,
  AestheticConsultationAlert,
  ClientAlert,
  LgpdAlert,
  alertVariants,
  MobileAestheticButton,
  ConsultationButton,
  ClientActionButton,
  type MobileAestheticButtonProps,
} from './ui'

// Import for internal use
import {
  Button as ButtonComponent,
  Card as CardComponent,
  Input as InputComponent,
  Alert as AlertComponent,
  AestheticConsultationAlert as AestheticConsultationAlertComponent,
  MobileAestheticButton as MobileAestheticButtonComponent,
  ConsultationButton as ConsultationButtonComponent,
  KeyboardNavigation as KeyboardNavigationComponent,
  ConsultationNotificationManager as ConsultationNotificationManagerComponent,
  FocusTrap as FocusTrapComponent,
  SkipLinks as SkipLinksComponent,
  ScreenReaderAnnouncer as ScreenReaderAnnouncerComponent,
  HighContrastMode as HighContrastModeComponent,
  KeyboardHelp as KeyboardHelpComponent,
} from './ui'

// Aesthetic-Specific Components
export {
  ConsultationNotificationManager,
  type ConsultationNotificationProps,
} from './aesthetic/consultation/consultation-notification'

export {
  VIPClientStatus,
  type VIPClientStatusProps,
} from './aesthetic/client/client-vip-status'

export {
  TreatmentProgress,
  type TreatmentProgressProps,
  type TreatmentStep,
} from './aesthetic/treatments/treatment-progress'

export {
  WellnessTracker,
  type WellnessTrackerProps,
  type WellnessMetrics,
  type WellnessGoal,
  type WellnessReminder,
} from './aesthetic/wellness/wellness-tracker'

// Export all aesthetic components
export * from './aesthetic'

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
export const AestheticUI = {
  // Core components
  Button: ButtonComponent,
  Card: CardComponent,
  Input: InputComponent,
  Alert: AlertComponent,
  
  // Aesthetic-specific
  AestheticConsultationAlert: AestheticConsultationAlertComponent,
  MobileAestheticButton: MobileAestheticButtonComponent,
  ConsultationNotificationManager: ConsultationNotificationManagerComponent,
  
  // Accessibility
  KeyboardNavigation: KeyboardNavigationComponent,
} as const

export const AestheticClinicUI = {
  AestheticConsultationAlert: AestheticConsultationAlertComponent,
  ConsultationNotificationManager: ConsultationNotificationManagerComponent,
  ConsultationButton: ConsultationButtonComponent,
  MobileAestheticButton: MobileAestheticButtonComponent,
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
export const NEONPRO_UI_VERSION = '1.0.0-aesthetic'
export const UI_AESTHETIC_COMPLIANCE = {
  WCAG_2_1_AA_PLUS: true,
  LGPD_COMPLIANT: true,
  ANVISA_COMPLIANT: true,
  AESTHETIC_CLINIC_READY: true,
  PREMIUM_EXPERIENCE: true,
  ACCESSIBILITY_ENHANCED: true,
  MOBILE_OPTIMIZED: true,
  TABLET_OPTIMIZED: true,
  SCREEN_READER_COMPATIBLE: true,
  KEYBOARD_NAVIGABLE: true,
  HIGH_CONTRAST_AVAILABLE: true,
  BRAZILIAN_PORTUGUESE: true,
} as const

// Aesthetic Clinic configuration
export const AESTHETIC_UI_CONFIG = {
  touchTargetSize: 44, // Minimum touch target size in pixels for tablet use
  consultationResponseTime: 2000, // Maximum consultation response time in ms
  colorContrastRatio: 4.5, // Minimum WCAG contrast ratio
  animationDuration: 300, // Gentle animation duration for premium feel
  focusVisibleIndicator: true, // Show focus indicators
  screenReaderAnnouncements: true, // Enable screen reader announcements
  tabletOptimized: true, // Optimized for tablet clinical environments
  brazilianPortuguese: true, // Brazilian Portuguese localization
} as const

// Feature flags for aesthetic clinic environments
export const AestheticFeatures = {
  CONSULTATION_NOTIFICATIONS: true,
  CLIENT_DATA_PROTECTION: true,
  LGPD_COMPLIANCE: true,
  ACCESSIBILITY_ENHANCEMENTS: true,
  MOBILE_AESTHETIC_MODE: true,
  TABLET_CLINIC_MODE: true,
  VIP_CLIENT_MANAGEMENT: true,
  TREATMENT_PROGRESS_TRACKING: true,
  WELLNESS_MONITORING: true,
  AUDIT_TRAIL_LOGGING: true,
  CONSENT_MANAGEMENT: true,
  ROLE_BASED_ACCESS: true,
  BRAZILIAN_AESTHETIC_STANDARDS: true,
  PREMIUM_EXPERIENCE: true,
} as const

// Development utilities
export const isAestheticClinicEnvironment = () => {
  if (typeof window !== 'undefined') {
    return process.env?.NODE_ENV === 'production' || 
           process.env?.AESTHETIC_ENVIRONMENT === 'true' ||
           window.location.hostname.includes('aesthetic') ||
           window.location.hostname.includes('clinic') ||
           window.location.hostname.includes('beleza')
  }
  return false
}

export const isVIPMode = () => {
  if (typeof window !== 'undefined') {
    return process.env?.VIP_MODE === 'true' || 
           window.location.search.includes('vip=true')
  }
  return false
}

// CSS classes for aesthetic clinic styling
export const AestheticCSSClasses = {
  consultation: 'bg-purple-50 border-purple-500 text-purple-900',
  treatment: 'bg-blue-50 border-blue-500 text-blue-900',
  vip: 'bg-yellow-50 border-yellow-500 text-yellow-900',
  wellness: 'bg-green-50 border-green-500 text-green-900',
  success: 'bg-emerald-50 border-emerald-500 text-emerald-900',
  info: 'bg-gray-50 border-gray-500 text-gray-900',
  clientData: 'bg-amber-50 border-amber-500 text-amber-900',
  sensitive: 'bg-red-25 border-red-300 text-red-700',
  accessible: 'min-h-[44px] min-w-[44px]', // WCAG 2.1 AA+ touch targets
  highContrast: 'border-2 border-black bg-white text-black',
  focusVisible: 'outline-2 outline-purple-500 outline-offset-2',
  tabletOptimized: 'md:p-4 lg:p-6', // Tablet-specific padding
  premium: 'shadow-lg border-2 border-amber-300', // Premium visual styling
} as const

// Default export for convenience
export default AestheticUI