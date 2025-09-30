// Core types for aesthetic clinic management
import { z } from 'zod'

// Base entity interface
export interface BaseEntity {
  id: string
  created_at: Date
  updated_at: Date
}

// Clinic information
export interface Clinic extends BaseEntity {
  name: string
  cnpj: string
  phone: string
  email: string
  address: Address
  settings: ClinicSettings
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
}

export interface ClinicSettings {
  timezone: string
  currency: 'BRL'
  language: 'pt-BR'
  appointment_duration: number // default in minutes
  cancellation_policy_hours: number
}

// Common validation schemas
export const clinicSchema = z.object({
  name: z.string().min(1, 'Nome da clínica é obrigatório'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ inválido'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  email: z.string().email('E-mail inválido'),
})

export const addressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado inválido'),
  zip_code: z.string().regex(/^\d{8}$/, 'CEP inválido'),
})