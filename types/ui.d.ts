// UI Components type definitions
import { ReactNode, ComponentProps } from "react";

// Common UI component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}

// Card components
export interface CardProps extends BaseComponentProps {
  variant?: "default" | "outline" | "filled";
  padding?: "none" | "sm" | "md" | "lg";
}

export interface CardHeaderProps extends BaseComponentProps {}
export interface CardContentProps extends BaseComponentProps {}
export interface CardFooterProps extends BaseComponentProps {}
export interface CardTitleProps extends BaseComponentProps {}
export interface CardDescriptionProps extends BaseComponentProps {}

// Button components
export interface ButtonProps extends BaseComponentProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// Input components
export interface InputProps extends Omit<ComponentProps<"input">, "size"> {
  size?: "default" | "sm" | "lg";
  error?: boolean;
  icon?: ReactNode;
}

export interface LabelProps extends BaseComponentProps {
  htmlFor?: string;
  required?: boolean;
}

export interface TextareaProps extends ComponentProps<"textarea"> {
  resize?: boolean;
  error?: boolean;
}

// Select components
export interface SelectProps extends BaseComponentProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface SelectTriggerProps extends BaseComponentProps {}
export interface SelectContentProps extends BaseComponentProps {}
export interface SelectItemProps extends BaseComponentProps {
  value: string;
}
export interface SelectValueProps extends BaseComponentProps {
  placeholder?: string;
}

// Dialog components
export interface DialogProps extends BaseComponentProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DialogTriggerProps extends BaseComponentProps {}
export interface DialogContentProps extends BaseComponentProps {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}
export interface DialogHeaderProps extends BaseComponentProps {}
export interface DialogTitleProps extends BaseComponentProps {}
export interface DialogDescriptionProps extends BaseComponentProps {}
export interface DialogFooterProps extends BaseComponentProps {}

// Badge component
export interface BadgeProps extends BaseComponentProps {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

// Avatar components
export interface AvatarProps extends BaseComponentProps {
  size?: "sm" | "md" | "lg";
}

export interface AvatarImageProps extends ComponentProps<"img"> {}
export interface AvatarFallbackProps extends BaseComponentProps {}

// Calendar component
export interface CalendarProps extends BaseComponentProps {
  mode?: "single" | "multiple" | "range";
  selected?: Date | Date[] | { from: Date; to: Date };
  onSelect?: (date: Date | Date[] | { from: Date; to: Date } | undefined) => void;
  disabled?: (date: Date) => boolean;
  locale?: string;
}

// Tabs components
export interface TabsProps extends BaseComponentProps {
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
}

export interface TabsListProps extends BaseComponentProps {}
export interface TabsTriggerProps extends BaseComponentProps {
  value: string;
  disabled?: boolean;
}
export interface TabsContentProps extends BaseComponentProps {
  value: string;
}

// Loading Spinner
export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
}

// Neon UI specific components
export interface NeonGradientCardProps extends CardProps {
  gradient?: "primary" | "secondary" | "success" | "warning" | "error";
  intensity?: "low" | "medium" | "high";
}

export interface CosmicGlowButtonProps extends ButtonProps {
  glow?: boolean;
  cosmic?: boolean;
  intensity?: "low" | "medium" | "high";
}

// Export component type helpers
export type ComponentVariant<T extends Record<string, any>> = keyof T;
export type ComponentSize = "sm" | "md" | "lg";
export type ComponentColor = "primary" | "secondary" | "success" | "warning" | "error";
