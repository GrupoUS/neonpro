// Core UI Components
export { Button, buttonVariants } from './button'
export type { ButtonProps } from './button'

// Enhanced Accessibility Components
export { 
  AccessibilityInput, 
  BrazilianHealthcareInputProps,
  type AccessibilityInputProps 
} from './accessibility-input'

export { 
  AccessibilityButton, 
  HealthcareButtons, 
  buttonVariants as accessibilityButtonVariants,
  type AccessibilityButtonProps 
} from './accessibility-button'

export { AccessibilityLabel } from './accessibility-label'

// Enhanced Accessibility System
export {
  AccessibilityProvider,
  useAccessibility,
  useFocusManagement,
  useScreenReaderAnnouncer,
  useKeyboardShortcuts,
  withAccessibility,
  type AccessibilityPreferences,
  type LGPDAccessibilitySettings,
  type HealthcareAccessibility,
  type AccessibilityContextType,
} from './accessibility-provider'

// Healthcare-specific Components
export { HealthcareFormGroup, type HealthcareFormGroupProps } from './healthcare-form-group'
export { HealthcareLoading, HealthcareFormLoading } from './healthcare-loading'
export { HealthcareFieldError, HealthcareErrorBoundary } from './healthcare-error-boundary'

// Form Components
export { Textarea } from './textarea'
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

// Navigation Components
export { KeyboardNavigationProvider, useKeyboardNavigation } from './keyboard-navigation'

// Screen Reader Components
export { useScreenReaderAnnouncer, ScreenReaderAnnouncer } from './screen-reader-announcer'

// Layout Components
export { Card, CardContent, CardHeader, CardTitle } from './card'
export { Badge } from './badge'
export { Progress } from './progress'
export { Alert, AlertDescription } from './alert'
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

// Healthcare-specific Types and Validation
export type {
  PatientData,
  BrazilianPersonalInfo,
  BrazilianAddress,
  EmergencyContact,
  MedicalHistory,
  LGPDConsent,
  HealthcareContext,
  HealthcareValidationLevel,
  BrazilianState,
  HealthcareComponentProps,
  HealthcareInputProps,
  HealthcareSelectProps,
  HealthcareFormGroupProps,
  FormFieldType,
  FormFieldConfig,
  FormStep,
  LGPDDataAccess,
  LGPDConsentRecord,
  AestheticTreatment,
  TreatmentSession,
} from '@/types/healthcare'

export {
  HealthcareFormValidator,
  FormFieldError,
  FormValidationResult,
  FormFieldChangeHandler,
  FormFieldAccessor,
  FormContext,
  useHealthcareForm,
  HEALTHCARE_VALIDATION_PATTERNS,
} from '@/types/validation'

// Re-exports for convenience
export { cn } from '@/lib/utils'

// Version info for package management
export const UI_COMPONENTS_VERSION = '2.0.0'

// Component composition utilities
export const HealthcareUI = {
  // Forms
  Input: AccessibilityInput,
  Button: AccessibilityButton,
  Select,
  Textarea,
  FormGroup: HealthcareFormGroup,
  
  // Layout
  Card,
  Badge,
  Progress,
  Alert,
  
  // Accessibility
  Provider: AccessibilityProvider,
  useAccessibility,
  useFocusManagement,
  useScreenReaderAnnouncer,
  
  // Healthcare-specific
  Loading: HealthcareLoading,
  ErrorBoundary: HealthcareErrorBoundary,
  
  // Validation
  Validator: HealthcareFormValidator,
  useHealthcareForm,
}

// Common healthcare component patterns
export const HealthcarePatterns = {
  // Emergency buttons
  Emergency: HealthcareButtons.Emergency,
  Medical: HealthcareButtons.Medical,
  Success: HealthcareButtons.Success,
  Warning: HealthcareButtons.Warning,
  Info: HealthcareButtons.Info,
  
  // LGPD compliance
  LGPD: HealthcareButtons.LGPD,
  
  // Form layouts
  PatientRegistration: (props: any) => {
    // This would be a composite component for patient registration
    return React.createElement('div', { className: 'healthcare-form' }, props.children)
  },
  
  TreatmentForm: (props: any) => {
    // This would be a composite component for treatment forms
    return React.createElement('div', { className: 'treatment-form' }, props.children)
  },
}

// Default export for convenience
export default HealthcareUI