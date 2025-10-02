// Core UI Components - Healthcare Optimized
export { Button, buttonVariants } from "./components/ui/button";
export type { ButtonProps } from "./components/ui/button";

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
export type { CardProps } from "./components/ui/card";

export { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
export type { AlertProps } from "./components/ui/alert";

export { Badge, badgeVariants } from "./components/ui/badge";
export type { BadgeProps } from "./components/ui/badge";

export { Input } from "./components/ui/input";
export type { InputProps } from "./components/ui/input";

export { Label } from "./components/ui/label";
export type { LabelProps } from "./components/ui/label";

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
  SelectScrollDownButton,
} from "./components/ui/select";

export { Checkbox, CheckboxIndicator } from "./components/ui/checkbox";
export type { CheckboxProps, CheckboxIndicatorProps } from "./components/ui/checkbox";

export { AccessibilityInput } from "./components/ui/accessibility-input";
export type { AccessibilityInputProps } from "./components/ui/accessibility-input";

// Healthcare-specific components
export { EmergencyAlert } from "./components/healthcare/emergency-alert";
export type { EmergencyAlertProps } from "./components/healthcare/emergency-alert";

export { MobileHealthcareButton } from "./components/ui/mobile-healthcare-button";
export type { MobileHealthcareButtonProps, MedicalActionType } from "./components/ui/mobile-healthcare-button";

// Accessibility components
export { KeyboardNavigation } from "./components/accessibility/keyboard-navigation";
export type { KeyboardNavigationProps, FocusTrapProps } from "./components/accessibility/keyboard-navigation";

// Utilities
export { cn } from "./lib/utils";

// Type re-exports for convenience
export type * from "./lib/types";

// Healthcare compliance version
export const UI_VERSION = "1.0.0";
export const HEALTHCARE_COMPLIANCE = {
  WCAG_2_1_AA: true,
  LGPD_COMPLIANT: true,
  ANVISA_COMPLIANT: true,
  EMERGENCY_READY: true,
} as const;