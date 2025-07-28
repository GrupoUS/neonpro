import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for healthcare/clinic management
export function formatCpf(cpf: string): string {
  const cleanCpf = cpf.replace(/\D/g, '')
  return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR').format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(d)
}

// LGPD compliance helpers
export function anonymizeData(data: string, showLast: number = 4): string {
  if (data.length <= showLast) return '*'.repeat(data.length)
  return '*'.repeat(data.length - showLast) + data.slice(-showLast)
}

// Medical/aesthetic specific utilities
export function calculateAge(birthDate: Date | string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export function getAppointmentStatus(date: Date | string): 'upcoming' | 'today' | 'past' {
  const appointmentDate = new Date(date)
  const today = new Date()
  
  appointmentDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  if (appointmentDate > today) return 'upcoming'
  if (appointmentDate.getTime() === today.getTime()) return 'today'
  return 'past'
}

// Color utilities for medical status
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    scheduled: 'text-blue-600 bg-blue-50 border-blue-200',
    confirmed: 'text-green-600 bg-green-50 border-green-200',
    in_progress: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    completed: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    cancelled: 'text-red-600 bg-red-50 border-red-200',
    no_show: 'text-gray-600 bg-gray-50 border-gray-200',
  }
  
  return statusColors[status] || 'text-gray-600 bg-gray-50 border-gray-200'
}

// Validation helpers
export function isValidCpf(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, '')
  
  if (cleanCpf.length !== 11 || /^(\d)\1+$/.test(cleanCpf)) {
    return false
  }
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
  }
  
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
  }
  
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  
  return remainder === parseInt(cleanCpf.charAt(10))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '')
  return cleanPhone.length >= 10 && cleanPhone.length <= 11
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}