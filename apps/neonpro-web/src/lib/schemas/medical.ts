import { z } from 'zod'

// Schema para CPF brasileiro
export const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF deve estar no formato 000.000.000-00 ou conter 11 dígitos')
  .refine((cpf) => {
    // Remove pontos e traços
    const numbers = cpf.replace(/[.-]/g, '')
    
    // Verifica se tem 11 dígitos
    if (numbers.length !== 11) return false
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(numbers)) return false
    
    // Validação do CPF
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers[9])) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers[10])) return false
    
    return true
  }, 'CPF inválido')

// Schema para telefone brasileiro
export const phoneSchema = z
  .string()
  .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/, 'Telefone deve estar no formato (11) 99999-9999')

// Schema para email médico
export const medicalEmailSchema = z
  .string()
  .email('Email inválido')
  .min(1, 'Email é obrigatório')

// Schema para dados pessoais básicos
export const personalDataSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  email: medicalEmailSchema,
  phone: phoneSchema,
  cpf: cpfSchema,
  birthDate: z.string().refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    return age >= 0 && age <= 120
  }, 'Data de nascimento inválida'),
  address: z.object({
    street: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, 'Bairro é obrigatório'),
    city: z.string().min(2, 'Cidade é obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 caracteres'),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000')
  })
})

// Schema para informações médicas sensíveis
export const medicalInfoSchema = z.object({
  allergies: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  medicalHistory: z.array(z.string()).default([]),
  emergencyContact: z.object({
    name: z.string().min(2, 'Nome do contato de emergência é obrigatório'),
    phone: phoneSchema,
    relationship: z.string().min(2, 'Parentesco é obrigatório')
  }),
  healthInsurance: z.object({
    provider: z.string().optional(),
    planNumber: z.string().optional(),
    validUntil: z.string().optional()
  }).optional()
})

// Schema para consentimento LGPD
export const consentSchema = z.object({
  dataProcessing: z.boolean().refine(val => val === true, 'Consentimento para processamento de dados é obrigatório'),
  marketingCommunication: z.boolean().default(false),
  dataSharing: z.boolean().default(false),
  consentDate: z.date().default(() => new Date()),
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'IP inválido').optional(),
  userAgent: z.string().optional()
})

// Schema para auditoria médica
export const medicalAuditSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['create', 'read', 'update', 'delete', 'export']),
  resourceType: z.enum(['patient', 'appointment', 'treatment', 'medical_record']),
  resourceId: z.string(),
  timestamp: z.date().default(() => new Date()),
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'IP inválido'),
  userAgent: z.string(),
  details: z.record(z.any()).optional()
})

// Schema para dados de tratamento estético
export const treatmentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Nome do tratamento é obrigatório'),
  category: z.enum(['facial', 'corporal', 'capilar', 'preventivo', 'reparador']),
  description: z.string().optional(),
  duration: z.number().min(15, 'Duração mínima de 15 minutos').max(480, 'Duração máxima de 8 horas'),
  price: z.number().min(0, 'Preço deve ser positivo'),
  requiresConsent: z.boolean().default(true),
  contraindications: z.array(z.string()).default([]),
  postTreatmentCare: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

// Schema para validação de dados financeiros
export const financialDataSchema = z.object({
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  currency: z.string().length(3, 'Moeda deve ter 3 caracteres').default('BRL'),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'pix', 'cash', 'bank_transfer']),
  installments: z.number().min(1).max(12).default(1),
  dueDate: z.date().optional(),
  description: z.string().min(5, 'Descrição é obrigatória'),
  category: z.enum(['treatment', 'consultation', 'product', 'other']),
  taxId: z.string().optional() // Para nota fiscal
})

export type PersonalData = z.infer<typeof personalDataSchema>
export type MedicalInfo = z.infer<typeof medicalInfoSchema>
export type Consent = z.infer<typeof consentSchema>
export type MedicalAudit = z.infer<typeof medicalAuditSchema>
export type Treatment = z.infer<typeof treatmentSchema>
export type FinancialData = z.infer<typeof financialDataSchema>
