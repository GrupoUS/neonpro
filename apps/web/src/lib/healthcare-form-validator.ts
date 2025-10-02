// Healthcare Form Validator for Brazilian Aesthetic Clinics
// Comprehensive validation for LGPD compliance and healthcare data standards

export interface HealthcareValidationLevel {
  level: 'basic' | 'strict' | 'enhanced'
  validationRules: ValidationRule[]
}

export interface ValidationRule {
  field: string
  required: boolean
  pattern?: RegExp
  minLength?: number
  maxLength?: number
  customValidator?: (value: any) => boolean
  errorMessage: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  fieldErrors: Record<string, string[]>
}

export class HealthcareFormValidator {
  private validationLevel: HealthcareValidationLevel

  constructor(level: 'basic' | 'strict' | 'enhanced' = 'basic') {
    this.validationLevel = this.getValidationLevel(level)
  }

  private getValidationLevel(level: string): HealthcareValidationLevel {
    const levels = {
      basic: {
        level: 'basic',
        validationRules: [
          {
            field: 'cpf',
            required: true,
            pattern: /^\d{11}$/,
            errorMessage: 'CPF deve ter 11 dígitos'
          },
          {
            field: 'name',
            required: true,
            minLength: 3,
            errorMessage: 'Nome deve ter pelo menos 3 caracteres'
          },
          {
            field: 'email',
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            errorMessage: 'Email inválido'
          }
        ]
      },
      strict: {
        level: 'strict',
        validationRules: [
          {
            field: 'cpf',
            required: true,
            pattern: /^\d{11}$/,
            customValidator: this.validateCPF,
            errorMessage: 'CPF inválido'
          },
          {
            field: 'name',
            required: true,
            minLength: 3,
            maxLength: 100,
            errorMessage: 'Nome deve ter entre 3 e 100 caracteres'
          },
          {
            field: 'email',
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            errorMessage: 'Email inválido'
          },
          {
            field: 'phone',
            required: true,
            pattern: /^\d{10,11}$/,
            errorMessage: 'Telefone inválido'
          },
          {
            field: 'dateOfBirth',
            required: true,
            customValidator: this.validateDateOfBirth,
            errorMessage: 'Data de nascimento inválida'
          }
        ]
      },
      enhanced: {
        level: 'enhanced',
        validationRules: [
          {
            field: 'cpf',
            required: true,
            pattern: /^\d{11}$/,
            customValidator: this.validateCPF,
            errorMessage: 'CPF inválido'
          },
          {
            field: 'name',
            required: true,
            minLength: 3,
            maxLength: 100,
            errorMessage: 'Nome deve ter entre 3 e 100 caracteres'
          },
          {
            field: 'email',
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            errorMessage: 'Email inválido'
          },
          {
            field: 'phone',
            required: true,
            pattern: /^\d{10,11}$/,
            errorMessage: 'Telefone inválido'
          },
          {
            field: 'dateOfBirth',
            required: true,
            customValidator: this.validateDateOfBirth,
            errorMessage: 'Data de nascimento inválida'
          },
          {
            field: 'zipCode',
            required: true,
            pattern: /^\d{8}$/,
            errorMessage: 'CEP inválido'
          }
        ]
      }
    }

    return levels[level as keyof typeof levels] || levels.basic
  }

  validateCPF(cpf: string): boolean {
    // Remove non-numeric characters
    const cleanCPF = cpf.replace(/\D/g, '')
    
    if (cleanCPF.length !== 11) return false
    
    // Check if all digits are the same
    if (/^(\d)\1+$/.test(cleanCPF)) return false
    
    // Calculate first verification digit
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    const digit1 = remainder === 10 ? 0 : remainder
    
    if (parseInt(cleanCPF[9]) !== digit1) return false
    
    // Calculate second verification digit
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i)
    }
    remainder = (sum * 10) % 11
    const digit2 = remainder === 10 ? 0 : remainder
    
    return parseInt(cleanCPF[10]) === digit2
  }

  validateDateOfBirth(dateString: string): boolean {
    const date = new Date(dateString)
    const now = new Date()
    
    // Check if date is valid
    if (isNaN(date.getTime())) return false
    
    // Check if date is not in the future
    if (date > now) return false
    
    // Check if person is not too old (reasonable limit for healthcare)
    const maxAge = 150
    const minDate = new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate())
    if (date < minDate) return false
    
    return true
  }

  validatePatientData(data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fieldErrors: {}
    }

    this.validationLevel.validationRules.forEach(rule => {
      const value = data[rule.field]
      const fieldErrors: string[] = []

      // Check if required field is present
      if (rule.required && (value === undefined || value === null || value === '')) {
        const error = `${rule.field} é obrigatório`
        fieldErrors.push(error)
        result.errors.push(error)
        result.isValid = false
        return
      }

      // Skip validation if field is not required and empty
      if (!rule.required && (value === undefined || value === null || value === '')) {
        return
      }

      // Check minimum length
      if (rule.minLength && value.length < rule.minLength) {
        const error = `${rule.field} deve ter pelo menos ${rule.minLength} caracteres`
        fieldErrors.push(error)
        result.errors.push(error)
        result.isValid = false
      }

      // Check maximum length
      if (rule.maxLength && value.length > rule.maxLength) {
        const error = `${rule.field} deve ter no máximo ${rule.maxLength} caracteres`
        fieldErrors.push(error)
        result.errors.push(error)
        result.isValid = false
      }

      // Check pattern
      if (rule.pattern && !rule.pattern.test(value)) {
        const error = rule.errorMessage
        fieldErrors.push(error)
        result.errors.push(error)
        result.isValid = false
      }

      // Check custom validator
      if (rule.customValidator && !rule.customValidator(value)) {
        const error = rule.errorMessage
        fieldErrors.push(error)
        result.errors.push(error)
        result.isValid = false
      }

      if (fieldErrors.length > 0) {
        result.fieldErrors[rule.field] = fieldErrors
      }
    })

    return result
  }

  validateLGPDCompliance(data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fieldErrors: {}
    }

    // Check for LGPD consent
    if (!data.lgpdConsent) {
      const error = 'Consentimento LGPD é obrigatório'
      result.errors.push(error)
      result.isValid = false
    }

    // Check for data retention policy
    if (!data.dataRetentionPeriod) {
      const warning = 'Período de retenção de dados não especificado'
      result.warnings.push(warning)
    }

    // Check for purpose specification
    if (!data.dataPurpose) {
      const error = 'Propósito do tratamento de dados não especificado'
      result.errors.push(error)
      result.isValid = false
    }

    return result
  }

  validateConsent(consentData: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fieldErrors: {}
    }

    // Check consent timestamp
    if (!consentData.timestamp) {
      const error = 'Timestamp do consentimento é obrigatório'
      result.errors.push(error)
      result.isValid = false
    }

    // Check consent version
    if (!consentData.version) {
      const warning = 'Versão do consentimento não especificada'
      result.warnings.push(warning)
    }

    // Check consent IP address
    if (!consentData.ipAddress) {
      const warning = 'Endereço IP do consentimento não registrado'
      result.warnings.push(warning)
    }

    return result
  }

  validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length >= 10 && cleanPhone.length <= 11
  }

  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

  validateZipCode(zipCode: string): boolean {
    const cleanZipCode = zipCode.replace(/\D/g, '')
    return cleanZipCode.length === 8
  }

  // Static method for easy access
  static validatePatientData(data: any): ValidationResult {
    const validator = new HealthcareFormValidator()
    return validator.validatePatientData(data)
  }

  static validateLGPDCompliance(data: any): ValidationResult {
    const validator = new HealthcareFormValidator()
    return validator.validateLGPDCompliance(data)
  }

  static validateConsent(data: any): ValidationResult {
    const validator = new HealthcareFormValidator()
    return validator.validateConsent(data)
  }
}

// Export singleton instance for convenience
export const healthcareFormValidator = new HealthcareFormValidator()