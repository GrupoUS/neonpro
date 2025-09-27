import { format, isValid, parseISO } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { HEALTHCARE_CONSTANTS } from './constants.js'

/**
 * CPF validation utility (Brazilian tax ID)
 */
export function validateCPF(cpf: string): boolean {
  // Remove all non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '')

  // Check if has 11 digits
  if (cleanCPF.length !== HEALTHCARE_CONSTANTS.BRAZIL.CPF_LENGTH) {
    return false
  }

  // Check for known invalid patterns
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false
  }

  // Validate check digits
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]!) * (10 - i)
  }
  let checkDigit1 = 11 - (sum % 11)
  if (checkDigit1 >= 10) checkDigit1 = 0

  if (parseInt(cleanCPF[9]!) !== checkDigit1) {
    return false
  }

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]!) * (11 - i)
  }
  let checkDigit2 = 11 - (sum % 11)
  if (checkDigit2 >= 10) checkDigit2 = 0

  return parseInt(cleanCPF[10]!) === checkDigit2
}

/**
 * Format CPF for display
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '')
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * CEP validation utility (Brazilian postal code)
 */
export function validateCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '')
  return cleanCEP.length === HEALTHCARE_CONSTANTS.BRAZIL.CEP_LENGTH
}

/**
 * Format CEP for display
 */
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '')
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2')
}

/**
 * Phone number validation (Brazilian format)
 */
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '')
  // Mobile: 11 digits (with area code), Landline: 10 digits (with area code)
  return cleanPhone.length === 10 || cleanPhone.length === 11
}

/**
 * Format phone for display
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

/**
 * Email validation utility
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Password strength validation
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < HEALTHCARE_CONSTANTS.LIMITS.PASSWORD_MIN_LENGTH) {
    errors.push(
      `Senha deve ter pelo menos ${HEALTHCARE_CONSTANTS.LIMITS.PASSWORD_MIN_LENGTH} caracteres`
    )
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve ter pelo menos uma letra maiúscula')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve ter pelo menos uma letra minúscula')
  }

  if (!/\d/.test(password)) {
    errors.push('Senha deve ter pelo menos um número')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve ter pelo menos um caractere especial')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Date formatting utilities
 */
export function formatDate(
  date: Date | string,
  formatStr = HEALTHCARE_CONSTANTS.DATE_FORMATS.BR_DATE
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) {
      throw new Error('Invalid date')
    }
    return format(dateObj, formatStr)
  } catch {
    return 'Data inválida'
  }
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, HEALTHCARE_CONSTANTS.DATE_FORMATS.BR_DATETIME as any)
}

/**
 * Text utilities
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function capitalizeWords(text: string): string {
  return text.split(' ').map(capitalize).join(' ')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Utility functions
 */
export function generateId(): string {
  return uuidv4()
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = HEALTHCARE_CONSTANTS.UI.DEBOUNCE_MS
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Array utilities
 */
export function removeDuplicates<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)]
  }
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key])
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}

/**
 * LGPD compliance utilities
 */
export function maskSensitiveData(data: string, maskChar = '*'): string {
  if (data.length <= 4) {
    return maskChar.repeat(data.length)
  }
  const start = data.slice(0, 2)
  const end = data.slice(-2)
  const middle = maskChar.repeat(data.length - 4)
  return start + middle + end
}

export function isMinor(birthDate: Date): boolean {
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 < HEALTHCARE_CONSTANTS.LGPD.MINOR_AGE_THRESHOLD
  }

  return age < HEALTHCARE_CONSTANTS.LGPD.MINOR_AGE_THRESHOLD
}
