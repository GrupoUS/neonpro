import { z } from 'zod'
import { personalDataSchema, medicalInfoSchema, consentSchema } from './medical'

// Schema completo para paciente
export const patientSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Dados pessoais (obrigatórios)
  personalData: personalDataSchema,
  
  // Informações médicas (opcionais para criação, obrigatórias para tratamento)
  medicalInfo: medicalInfoSchema.optional(),
  
  // Consentimento LGPD (obrigatório)
  consent: consentSchema,
  
  // Status do paciente
  status: z.enum(['active', 'inactive', 'blocked']).default('active'),
  
  // Preferências do paciente
  preferences: z.object({
    preferredContactMethod: z.enum(['email', 'phone', 'whatsapp']).default('email'),
    reminderEnabled: z.boolean().default(true),
    marketingOptIn: z.boolean().default(false),
    language: z.enum(['pt-BR', 'en-US']).default('pt-BR')
  }).default({}),
  
  // Informações de relacionamento com a clínica
  clinicInfo: z.object({
    registrationDate: z.date().default(() => new Date()),
    lastVisit: z.date().optional(),
    totalVisits: z.number().min(0).default(0),
    totalSpent: z.number().min(0).default(0),
    referredBy: z.string().optional(),
    notes: z.string().max(1000, 'Notas não podem exceder 1000 caracteres').optional()
  }).default({}),
  
  // Metadados
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional()
})

// Schema para atualização de paciente (todos os campos opcionais exceto ID)
export const updatePatientSchema = patientSchema.partial().extend({
  id: z.string().uuid(),
  updatedAt: z.date().default(() => new Date()),
  updatedBy: z.string().uuid()
})

// Schema para listagem de pacientes com filtros
export const patientFiltersSchema = z.object({
  status: z.enum(['active', 'inactive', 'blocked']).optional(),
  search: z.string().optional(), // Busca por nome, email ou CPF
  registrationDateFrom: z.date().optional(),
  registrationDateTo: z.date().optional(),
  lastVisitFrom: z.date().optional(),
  lastVisitTo: z.date().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'registrationDate', 'lastVisit', 'totalSpent']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

// Schema para validação de busca de pacientes
export const patientSearchSchema = z.object({
  query: z.string().min(2, 'Busca deve ter pelo menos 2 caracteres'),
  searchFields: z.array(z.enum(['name', 'email', 'cpf', 'phone'])).default(['name', 'email']),
  limit: z.number().min(1).max(50).default(10)
})

// Schema para histórico médico do paciente
export const patientMedicalHistorySchema = z.object({
  patientId: z.string().uuid(),
  entries: z.array(z.object({
    id: z.string().uuid().optional(),
    date: z.date(),
    type: z.enum(['consultation', 'treatment', 'procedure', 'follow_up', 'emergency']),
    title: z.string().min(5, 'Título é obrigatório'),
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
    treatmentId: z.string().uuid().optional(),
    professionalId: z.string().uuid(),
    attachments: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      type: z.enum(['image', 'document', 'video']),
      url: z.string().url(),
      uploadedAt: z.date().default(() => new Date())
    })).default([]),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date())
  }))
})

// Schema para consentimento específico de tratamento
export const treatmentConsentSchema = z.object({
  patientId: z.string().uuid(),
  treatmentId: z.string().uuid(),
  consentType: z.enum(['informed_consent', 'photo_consent', 'data_sharing', 'marketing']),
  granted: z.boolean(),
  consentDate: z.date().default(() => new Date()),
  documnetPath: z.string().url().optional(), // PDF do consentimento assinado
  witnessId: z.string().uuid().optional(), // Profissional que testemunhou
  notes: z.string().max(500).optional(),
  validUntil: z.date().optional(), // Para consentimentos temporários
  revoked: z.boolean().default(false),
  revokedAt: z.date().optional(),
  revokedReason: z.string().optional()
})

// Schema para dados de emergência do paciente
export const patientEmergencyDataSchema = z.object({
  patientId: z.string().uuid(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).optional(),
  allergies: z.array(z.object({
    allergen: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']),
    reaction: z.string(),
    verifiedDate: z.date().optional()
  })).default([]),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    prescribedBy: z.string(),
    startDate: z.date(),
    endDate: z.date().optional()
  })).default([]),
  conditions: z.array(z.object({
    condition: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']),
    diagnosedDate: z.date().optional(),
    notes: z.string().optional()
  })).default([]),
  emergencyContacts: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
    isPrimary: z.boolean().default(false)
  })).min(1, 'Pelo menos um contato de emergência é obrigatório')
})

export type Patient = z.infer<typeof patientSchema>
export type UpdatePatient = z.infer<typeof updatePatientSchema>
export type PatientFilters = z.infer<typeof patientFiltersSchema>
export type PatientSearch = z.infer<typeof patientSearchSchema>
export type PatientMedicalHistory = z.infer<typeof patientMedicalHistorySchema>
export type TreatmentConsent = z.infer<typeof treatmentConsentSchema>
export type PatientEmergencyData = z.infer<typeof patientEmergencyDataSchema>
