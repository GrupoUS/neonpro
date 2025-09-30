// Common utilities for aesthetic clinic management
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Date formatting utilities
export const formatDate = (date: Date, formatStr: string = 'dd/MM/yyyy'): string => {
  return format(date, formatStr, { locale: ptBR })
}

export const formatDateTime = (date: Date): string => {
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm', { locale: ptBR })
}

// Currency formatting (Brazilian Real)
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Phone number formatting
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  
  return phone
}

// CPF formatting
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
}

// CNPJ formatting
export const formatCNPJ = (cnpj: string): string => {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return cnpj
  
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
}

// CEP formatting
export const formatCEP = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, '')
  if (cleaned.length !== 8) return cep
  
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
}

// Validation utilities
export const isValidCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return false
  
  // Basic CPF validation (can be enhanced with full algorithm)
  return !/^(\d)\1{10}$/.test(cleaned)
}

export const isValidCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return false
  
  // Basic CNPJ validation (can be enhanced with full algorithm)
  return !/^(\d)\1{13}$/.test(cleaned)
}

export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

// Clinical utilities
export const calculateAge = (birthDate: Date): number => {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export const getTreatmentDurationText = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours === 0) {
    return `${remainingMinutes} minutos`
  } else if (remainingMinutes === 0) {
    return `${hours} hora${hours > 1 ? 's' : ''}`
  } else {
    return `${hours}h${remainingMinutes}min`
  }
}