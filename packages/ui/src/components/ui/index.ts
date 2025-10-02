// Core UI Components - Healthcare Optimized
export { Button, buttonVariants, type ButtonProps } from './button'
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card'
export { Input, type InputProps } from './input'
export { Alert, AlertDescription, AlertTitle } from './alert'
export { MobileHealthcareButton, type MobileHealthcareButtonProps } from './mobile-healthcare-button'
export { Progress } from './progress'
export { Avatar, AvatarFallback, AvatarImage } from './avatar'
export { Badge, badgeVariants } from './badge'
export { Label, type LabelProps } from './label'
export { Checkbox, CheckboxIndicator, type CheckboxProps, type CheckboxIndicatorProps } from './checkbox'
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton
} from './select'

// NEONPRO Premium UI Components - Aesthetic Clinic Optimized
export { GradientButton } from './gradient-button/gradient-button'
export { HoverBorderGradientButton } from './hover-border-gradient-button/hover-border-gradient-button'
export { MagicCard } from './magic-card/magic-card'
export { ShineBorder } from './shine-border/shine-border'
export { Sidebar } from './sidebar/sidebar'
export { AnimatedThemeToggler } from './theme-toggler/animated-theme-toggler'
export { TiltedCard } from './tilted-card/tilted-card'

// Healthcare-specific components
export { EmergencyAlert } from '../healthcare/emergency-alert'

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