import React from 'react'
import { Input } from './input'
import { Label } from './label'
import { AlertCircle } from 'lucide-react'

interface AccessibilityInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  required?: boolean
  id: string
}

export const AccessibilityInput: React.FC<AccessibilityInputProps> = ({
  label,
  error,
  helperText,
  required = false,
  id,
  ...props
}) => {
  const hasError = !!error

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={hasError ? 'text-destructive' : ''}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className={hasError ? 'border-destructive focus-visible:ring-destructive' : ''}
        {...props}
      />
      {hasError && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span id={`${id}-error`}>{error}</span>
        </div>
      )}
      {helperText && !hasError && (
        <p id={`${id}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  )
}
