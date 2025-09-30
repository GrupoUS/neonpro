import * as React from "react"
import { cn } from "@/lib/utils"

export interface AccessibilityInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  // Accessibility-specific props
  label?: string
  error?: string
  description?: string
  required?: boolean
  healthcare?: boolean
  sensitive?: boolean
  // Screen reader announcements
  ariaDescribedBy?: string
  ariaErrorMessage?: string
  // LGPD compliance for sensitive data
  dataMasking?: boolean
  validationPattern?: string
  // Visual accessibility
  highContrast?: boolean
  largeText?: boolean
  // Size variants for accessibility
  size?: "sm" | "default" | "lg" | "xl"
}

const AccessibilityInput = React.forwardRef<HTMLInputElement, AccessibilityInputProps>(
  ({
    className,
    type = "text",
    label,
    error,
    description,
    required = false,
    healthcare = false,
    sensitive = false,
    dataMasking = false,
    validationPattern,
    highContrast = false,
    largeText = false,
    size = "default",
    id,
    placeholder,
    ...props
  }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${React.useId()}`
    const errorId = error ? `${inputId}-error` : undefined
    const descriptionId = description ? `${inputId}-description` : undefined

    // Size-based classes
    const sizeClasses = {
      sm: "h-8 text-sm px-2",
      default: "h-10 px-3", 
      lg: "h-12 text-lg px-4",
      xl: "h-14 text-xl px-5"
    }

    // Healthcare-specific attributes
    const healthcareProps = healthcare ? {
      "data-healthcare": "true",
      "data-sensitive": sensitive.toString(),
      "aria-required": required,
      "autocomplete": sensitive ? "off" : props.autoComplete,
    } : {}

    // Input masking for sensitive data
    const inputType = dataMasking && sensitive ? "password" : type

    return (
      <div className={cn("space-y-1.5", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium leading-none",
              highContrast && "text-foreground font-bold",
              largeText && "text-base"
            )}
          >
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        
        {description && (
          <p
            id={descriptionId}
            className={cn(
              "text-xs",
              highContrast && "text-foreground",
              largeText && "text-sm"
            )}
          >
            {description}
          </p>
        )}

        <input
          ref={ref}
          type={inputType}
          id={inputId}
          placeholder={placeholder}
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            sizeClasses[size],
            error && "border-destructive focus-visible:ring-destructive",
            highContrast && "border-2 font-bold",
            healthcare && sensitive && "font-mono"
          )}
          aria-invalid={!!error}
          aria-describedby={cn(
            errorId,
            descriptionId
          )}
          aria-errormessage={errorId}
          pattern={validationPattern}
          {...healthcareProps}
          {...props}
        />

        {error && (
          <p
            id={errorId}
            className={cn(
              "text-xs text-destructive",
              highContrast && "font-bold",
              largeText && "text-sm"
            )}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

AccessibilityInput.displayName = "AccessibilityInput"

export { AccessibilityInput }