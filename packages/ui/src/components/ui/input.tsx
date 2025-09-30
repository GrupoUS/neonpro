import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Healthcare-specific props
  medicalInput?: boolean
  patientData?: boolean
  sensitive?: boolean
  required?: boolean
  validationPattern?: string
  validationMessage?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    medicalInput = false,
    patientData = false,
    sensitive = false,
    required = false,
    validationPattern,
    validationMessage,
    ...props 
  }, ref) => {
    const [isValid, setIsValid] = React.useState(true)
    const [isTouched, setIsTouched] = React.useState(false)

    const handleValidation = (value: string) => {
      if (!isTouched || !validationPattern) return true
      
      const pattern = new RegExp(validationPattern)
      const valid = pattern.test(value)
      setIsValid(valid)
      return valid
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsTouched(true)
      handleValidation(e.target.value)
      if (props.onChange) {
        props.onChange(e)
      }
    }

    const inputClasses = cn(
      // Base styles
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      
      // Healthcare-specific styles
      medicalInput && "border-blue-300 focus:border-blue-500 focus:ring-blue-200",
      patientData && "border-purple-300 focus:border-purple-500 focus:ring-purple-200",
      sensitive && "border-red-300 focus:border-red-500 focus:ring-red-200",
      required && "border-l-4 border-l-orange-500",
      
      // Validation styles
      !isValid && isTouched && "border-red-500 focus:border-red-500 focus:ring-red-200",
      isValid && isTouched && "border-green-500 focus:border-green-500 focus:ring-green-200",
      
      // Accessibility enhancements
      "transition-colors duration-200",
      
      className
    )

    // Generate ARIA attributes
    const ariaAttributes = {
      'aria-invalid': !isValid && isTouched,
      'aria-required': required,
      'aria-describedby': validationMessage ? `${props.id || props.name}-error` : undefined,
      'aria-label': sensitive ? 'Sensitive information field' : props['aria-label'],
    }

    return (
      <div className="relative">
        <input
          type={type}
          className={inputClasses}
          ref={ref}
          onChange={handleChange}
          {...ariaAttributes}
          {...props}
        />
        
        {/* Validation message */}
        {!isValid && isTouched && validationMessage && (
          <div 
            id={`${props.id || props.name}-error`}
            className="text-red-600 text-sm mt-1 flex items-center gap-1"
            role="alert"
          >
            <span>⚠️</span>
            <span>{validationMessage}</span>
          </div>
        )}
        
        {/* Input type indicators */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {medicalInput && (
            <span className="text-blue-500 text-xs" aria-hidden="true">
              🏥
            </span>
          )}
          {patientData && (
            <span className="text-purple-500 text-xs" aria-hidden="true">
              👤
            </span>
          )}
          {sensitive && (
            <span className="text-red-500 text-xs" aria-hidden="true">
              🔒
            </span>
          )}
          {required && (
            <span className="text-orange-500 text-xs" aria-hidden="true">
              *
            </span>
          )}
        </div>
      </div>
    )
  }
)
Input.displayName = "Input"

// Healthcare-specific input components
export const MedicalInput: React.FC<Omit<InputProps, 'medicalInput'>> = (props) => (
  <Input {...props} medicalInput={true} />
)

export const PatientDataInput: React.FC<Omit<InputProps, 'patientData'>> = (props) => (
  <Input {...props} patientData={true} />
)

export const SensitiveInput: React.FC<Omit<InputProps, 'sensitive'>> = (props) => (
  <Input {...props} sensitive={true} type={props.type || 'password'} />
)

// Formatted inputs for healthcare data
export const DateOfBirthInput: React.FC<Omit<InputProps, 'type' | 'validationPattern'>> = (props) => (
  <Input
    {...props}
    type="date"
    validationPattern="^\d{4}-\d{2}-\d{2}$"
    validationMessage="Please enter a valid date (YYYY-MM-DD)"
    medicalInput={true}
    required={true}
  />
)

export const PhoneNumberInput: React.FC<Omit<InputProps, 'type' | 'validationPattern'>> = (props) => (
  <Input
    {...props}
    type="tel"
    validationPattern="^\+?[\d\s\-\(\)]+$"
    validationMessage="Please enter a valid phone number"
    medicalInput={true}
  />
)

export const EmailInput: React.FC<Omit<InputProps, 'type' | 'validationPattern'>> = (props) => (
  <Input
    {...props}
    type="email"
    validationPattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
    validationMessage="Please enter a valid email address"
    patientData={true}
  />
)

export const HealthcareIdInput: React.FC<Omit<InputProps, 'validationPattern'>> = (props) => (
  <Input
    {...props}
    validationPattern="^[A-Z0-9]{6,12}$"
    validationMessage="Please enter a valid healthcare ID (6-12 alphanumeric characters)"
    patientData={true}
    required={true}
  />
)

export { Input }