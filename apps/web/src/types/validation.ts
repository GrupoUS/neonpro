export interface FormFieldError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
  warnings: FormFieldError[];
}

import { PatientData, HealthcareValidationLevel, BrazilianState } from './healthcare.ts'

// Type-safe form validation
export class HealthcareFormValidator {
  private validationLevel: HealthcareValidationLevel

  constructor(validationLevel: HealthcareValidationLevel = 'strict') {
    this.validationLevel = validationLevel
  }

  validateCPF(cpf: string): FormFieldError | null {
    if (!cpf) return null

    // Remove formatting
    const cleanCPF = cpf.replace(/[^\d]/g, '')

    if (cleanCPF.length !== 11) {
      return {
        field: 'cpf',
        message: 'CPF deve conter 11 dígitos',
        severity: 'error'
      }
    }

    // Basic CPF validation algorithm
    if (this.isSequentialNumber(cleanCPF)) {
      return {
        field: 'cpf',
        message: 'CPF inválido',
        severity: 'error'
      }
    }

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i] || '0') * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0

    if (remainder !== parseInt(cleanCPF[9] || '0')) {
      return {
        field: 'cpf',
        message: 'CPF inválido',
        severity: 'error'
      }
    }

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i] || '0') * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0

    if (remainder !== parseInt(cleanCPF[10] || '0')) {
      return {
        field: 'cpf',
        message: 'CPF inválido',
        severity: 'error'
      }
    }

    return null
  }

  validatePhone(phone: string): FormFieldError | null {
    if (!phone) return null

    const phoneRegex = /^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/
    if (!phoneRegex.test(phone)) {
      return {
        field: 'phone',
        message: 'Telefone deve estar no formato (11) 99999-9999',
        severity: 'error'
      }
    }

    return null
  }

  validateDateOfBirth(dateOfBirth: string): FormFieldError | null {
    if (!dateOfBirth) return null

    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age < 13) {
      return {
        field: 'dateOfBirth',
        message: 'Paciente deve ter pelo menos 13 anos de idade',
        severity: 'error'
      }
    }

    if (age > 120) {
      return {
        field: 'dateOfBirth',
        message: 'Idade inválida',
        severity: 'error'
      }
    }

    return null
  }

  validateZipCode(zipCode: string): FormFieldError | null {
    if (!zipCode) return null

    const zipCodeRegex = /^[0-9]{5}-[0-9]{3}$/
    if (!zipCodeRegex.test(zipCode)) {
      return {
        field: 'zipCode',
        message: 'CEP deve estar no formato 00000-000',
        severity: 'error'
      }
    }

    return null
  }

  validateEmail(email: string): FormFieldError | null {
    if (!email) return null

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        field: 'email',
        message: 'Email inválido',
        severity: 'error'
      }
    }

    return null
  }

  validateRequiredField(value: string, fieldName: string): FormFieldError | null {
    if (!value || value.trim() === '') {
      return {
        field: fieldName,
        message: 'Campo obrigatório',
        severity: 'error'
      }
    }

    return null
  }

  validatePatientData(data: Partial<PatientData>): FormValidationResult {
    const errors: FormFieldError[] = []
    const warnings: FormFieldError[] = []

    // Personal Info Validation
    if (data.personalInfo) {
      const personalInfo = data.personalInfo

      const fullNameError = this.validateRequiredField(personalInfo.fullName, 'personalInfo.fullName')
      if (fullNameError) errors.push(fullNameError)

      const phoneError = this.validatePhone(personalInfo.phone)
      if (phoneError) errors.push(phoneError)

      const dobError = this.validateDateOfBirth(personalInfo.dateOfBirth)
      if (dobError) errors.push(dobError)

      if (personalInfo.cpf) {
        const cpfError = this.validateCPF(personalInfo.cpf)
        if (cpfError) errors.push(cpfError)
      }

      if (personalInfo.email) {
        const emailError = this.validateEmail(personalInfo.email)
        if (emailError) errors.push(emailError)
      }
    }

    // Address Validation
    if (data.address) {
      const address = data.address

      const streetError = this.validateRequiredField(address.street, 'address.street')
      if (streetError) errors.push(streetError)

      const numberError = this.validateRequiredField(address.number, 'address.number')
      if (numberError) errors.push(numberError)

      const neighborhoodError = this.validateRequiredField(address.neighborhood, 'address.neighborhood')
      if (neighborhoodError) errors.push(neighborhoodError)

      const cityError = this.validateRequiredField(address.city, 'address.city')
      if (cityError) errors.push(cityError)

      if (!address.state || !this.isValidBrazilianState(address.state)) {
        errors.push({
          field: 'address.state',
          message: 'Estado inválido',
          severity: 'error'
        })
      }

      const zipCodeError = this.validateZipCode(address.zipCode)
      if (zipCodeError) errors.push(zipCodeError)
    }

    // Emergency Contact Validation
    if (data.emergencyContact) {
      const emergencyContact = data.emergencyContact

      const nameError = this.validateRequiredField(emergencyContact.name, 'emergencyContact.name')
      if (nameError) errors.push(nameError)

      const relationshipError = this.validateRequiredField(emergencyContact.relationship, 'emergencyContact.relationship')
      if (relationshipError) errors.push(relationshipError)

      const phoneError = this.validatePhone(emergencyContact.phone)
      if (phoneError) errors.push(phoneError)
    }

    // Consent Validation
    if (data.consent) {
      const consent = data.consent

      if (!consent.treatmentConsent) {
        errors.push({
          field: 'consent.treatmentConsent',
          message: 'Consentimento de tratamento é obrigatório',
          severity: 'error'
        })
      }

      if (!consent.dataSharingConsent) {
        errors.push({
          field: 'consent.dataSharingConsent',
          message: 'Consentimento de compartilhamento de dados é obrigatório',
          severity: 'error'
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  private isValidBrazilianState(state: string): state is BrazilianState {
    const validStates: BrazilianState[] = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
      'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
      'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ]
    return validStates.includes(state as BrazilianState)
  }

  private isSequentialNumber(number: string): boolean {
    return /^(0{11}|1{11}|2{11}|3{11}|4{11}|5{11}|6{11}|7{11}|8{11}|9{11})$/.test(number)
  }
}

// Type-safe form field change handler
export type FormFieldChangeHandler<T> = (field: keyof T, value: T[keyof T]) => void

// Type-safe form field accessor
export interface FormFieldAccessor<T> {
  getValue: (field: keyof T) => T[keyof T] | undefined
  setValue: (field: keyof T, value: T[keyof T]) => void
  getError: (field: keyof T) => string | undefined
  setError: (field: keyof T, error: string | undefined) => void
  clearError: (field: keyof T) => void
}

// Type-safe form context
export interface FormContext<T> {
  data: Partial<T>
  errors: Record<keyof T, string | undefined>
  touched: Record<keyof T, boolean>
  isSubmitting: boolean
  isValid: boolean
  getFieldAccessor: () => FormFieldAccessor<T>
  handleChange: FormFieldChangeHandler<T>
  handleSubmit: (e: React.FormEvent) => Promise<void>
  resetForm: () => void
}

import * as React from 'react'

// Hook for type-safe form management
export function useHealthcareForm<T extends Record<string, any>>(
  initialValues: Partial<T>,
  onSubmit: (data: T) => Promise<void>,
  validator?: (data: Partial<T>) => FormValidationResult
): FormContext<T> {
  const [data, setData] = React.useState<Partial<T>>(initialValues)
  const [errors, setErrors] = React.useState<Record<keyof T, string | undefined>>({} as Record<keyof T, string | undefined>)
  const [touched, setTouched] = React.useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const getFieldAccessor = (): FormFieldAccessor<T> => ({
    getValue: (field: keyof T) => data[field],
    setValue: (field: keyof T, value: T[keyof T]) => {
      setData(prev => ({ ...prev, [field]: value }))
      setTouched(prev => ({ ...prev, [field]: true }))
    },
    getError: (field: keyof T) => errors[field],
    setError: (field: keyof T, error: string | undefined) => {
      setErrors(prev => ({ ...prev, [field]: error }))
    },
    clearError: (field: keyof T) => {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  })

  const handleChange: FormFieldChangeHandler<T> = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
    setTouched(prev => ({ ...prev, [field]: true }))

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let isValid = true
    let validationErrors: FormFieldError[] = []

    if (validator) {
      const result = validator(data)
      isValid = result.isValid
      validationErrors = result.errors
    }

    if (!isValid) {
      // Convert validation errors to form errors
      const newErrors: Record<keyof T, string | undefined> = {} as Record<keyof T, string | undefined>
      validationErrors.forEach(error => {
        const [section, field] = error.field.split('.')
        if (section && field) {
          newErrors[section as keyof T] = error.message
        }
      })
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(data as T)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setData(initialValues)
    setErrors({} as Record<keyof T, string | undefined>)
    setTouched({} as Record<keyof T, boolean>)
    setIsSubmitting(false)
  }

  return {
    data,
    errors,
    touched,
    isSubmitting,
    isValid: Object.values(errors).every(error => !error),
    getFieldAccessor,
    handleChange,
    handleSubmit,
    resetForm
  }
}
