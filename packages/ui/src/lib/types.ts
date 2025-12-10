/**
 * Core UI Library Types
 *
 * Shared TypeScript types for the NEONPRO UI component library
 */

// Re-export common types from other modules
export type { ButtonProps } from '../components/ui/button'
export type { CardProps } from '../components/ui/card'
export type { AlertProps } from '../components/ui/alert'
export type { BadgeProps } from '../components/ui/badge'
export type { InputProps } from '../components/ui/input'
export type { LabelProps } from '../components/ui/label'
export type { CheckboxProps, CheckboxIndicatorProps } from '../components/ui/checkbox'
export type { AccessibilityInputProps } from '../components/ui/accessibility-input'
export type { EmergencyAlertProps } from '../components/healthcare/emergency-alert'
export type { MobileHealthcareButtonProps, MedicalActionType } from '../components/ui/mobile-healthcare-button'
export type { KeyboardNavigationProps, FocusTrapProps } from '../components/accessibility/keyboard-navigation'

// Registry types
export type { InstallationOptions, InstallationResult } from './registry-utils'

// Common utility types
export type { RegistryComponent, ValidationResult } from '../registry'
