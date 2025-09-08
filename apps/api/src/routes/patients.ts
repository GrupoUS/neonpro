/**
 * Patient Management API Routes for NeonPro Healthcare
 * Implements CRUD operations with clinic-level data isolation
 * Healthcare compliance: LGPD + ANVISA + CFM + Multi-tenant security
 */

import { zValidator, } from '@hono/zod-validator'
import { Hono, } from 'hono'
import { z, } from 'zod'
import { db, } from '../lib/database'
import type { AuthenticatedUser, CreatePatientRequest, PatientListParams, } from '../types/api'
import { createErrorResponse, createPaginatedResponse, createSuccessResponse, } from '../types/api'

const patients = new Hono()

// Validation schemas
const createPatientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres',),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos',),
  email: z.string().email('Email inválido',).optional(),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos',).optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD',),
  gender: z.enum(['M', 'F', 'O',], {
    errorMap: () => ({ message: 'Gênero deve ser M, F ou O', }),
  },),
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatória',),
    number: z.string().min(1, 'Número é obrigatório',),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório',),
    city: z.string().min(1, 'Cidade é obrigatória',),
    state: z.string().length(2, 'Estado deve ter 2 caracteres',),
    zip_code: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos',),
  },).optional(),
  emergency_contact: z.object({
    name: z.string().min(1, 'Nome do contato de emergência é obrigatório',),
    phone: z.string().min(10, 'Telefone do contato deve ter pelo menos 10 dígitos',),
    relationship: z.string().min(1, 'Relacionamento é obrigatório',),
  },).optional(),
  medical_history: z.object({
    allergies: z.array(z.string(),).optional(),
    medications: z.array(z.string(),).optional(),
    conditions: z.array(z.string(),).optional(),
    notes: z.string().optional(),
  },).optional(),
},)

const patientListSchema = z.object({
  page: z.string().transform(Number,).pipe(z.number().min(1,),).optional(),
  limit: z.string().transform(Number,).pipe(z.number().min(1,).max(100,),).optional(),
  search: z.string().optional(),
  gender: z.enum(['M', 'F', 'O',],).optional(),
  age_min: z.string().transform(Number,).pipe(z.number().min(0,),).optional(),
  age_max: z.string().transform(Number,).pipe(z.number().max(150,),).optional(),
  created_after: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,).optional(),
  created_before: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,).optional(),
},)

// Helper functions
function calculateAge(birthDate: string,): number {
  const today = new Date()
  const birth = new Date(birthDate,)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

function validateCPF(cpf: string,): boolean {
  // Remove unknown non-digit characters
  const cleanCPF = cpf.replace(/\D/g, '',)

  // Check if it has 11 digits
  if (cleanCPF.length !== 11) return false

  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF,)) return false

  // Validate check digits
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i,),) * (10 - i)
  }
  let checkDigit = 11 - (sum % 11)
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0
  if (checkDigit !== parseInt(cleanCPF.charAt(9,),)) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i,),) * (11 - i)
  }
  checkDigit = 11 - (sum % 11)
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0
  if (checkDigit !== parseInt(cleanCPF.charAt(10,),)) return false

  return true
}

// Routes

/**
 * GET /patients - List patients with filtering and pagination
 */
patients.get('/', zValidator('query', patientListSchema,), async (c,) => {
  try {
    const user = c.get('user',) as AuthenticatedUser
    const params = c.req.valid('query',) as PatientListParams

    const page = params.page || 1
    const limit = params.limit || 20
    const offset = (page - 1) * limit

    // const supabase = db.client; // unused

    // Build query with filters
    let query = db
      .from('patients',)
      .select('*', { count: 'exact', },)
      .eq('clinic_id', user.clinic_id,)
      .range(offset, offset + limit - 1,)

    // Apply filters
    if (params.search) {
      query = query.or(
        `name.ilike.%${params.search}%,cpf.ilike.%${params.search}%,email.ilike.%${params.search}%`,
      )
    }

    if (params.gender) {
      query = query.eq('gender', params.gender,)
    }

    if (params.created_after) {
      query = query.gte('created_at', params.created_after,)
    }

    if (params.created_before) {
      query = query.lte('created_at', params.created_before,)
    }

    const { data, error, count, } = await query

    if (error) {
      console.error('Error fetching patients:', error,)
      return c.json(createErrorResponse('Erro ao buscar pacientes',), 500,)
    }

    // Filter by age if specified
    let filteredData = data || []
    if (params.age_min !== undefined || params.age_max !== undefined) {
      filteredData = filteredData.filter((patient,) => {
        const age = calculateAge(patient.birth_date,)
        if (params.age_min !== undefined && age < params.age_min) return false
        if (params.age_max !== undefined && age > params.age_max) return false
        return true
      },)
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit,)

    const response = createPaginatedResponse(filteredData, {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },)

    return c.json(response,)
  } catch (error) {
    console.error('Unexpected error in GET /patients:', error,)
    return c.json(createErrorResponse('Erro interno do servidor',), 500,)
  }
},)

/**
 * GET /patients/:id - Get patient by ID
 */
patients.get('/:id', async (c,) => {
  try {
    const user = c.get('user',) as AuthenticatedUser
    const patientId = c.req.param('id',)

    if (!patientId) {
      return c.json(createErrorResponse('ID do paciente é obrigatório',), 400,)
    }

    // const supabase = db.client; // unused
    const { data, error, } = await db
      .from('patients',)
      .select('*',)
      .eq('id', patientId,)
      .eq('clinic_id', user.clinic_id,)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json(createErrorResponse('Paciente não encontrado',), 404,)
      }
      console.error('Error fetching patient:', error,)
      return c.json(createErrorResponse('Erro ao buscar paciente',), 500,)
    }

    return c.json(createSuccessResponse(data,),)
  } catch (error) {
    console.error('Unexpected error in GET /patients/:id:', error,)
    return c.json(createErrorResponse('Erro interno do servidor',), 500,)
  }
},)

/**
 * POST /patients - Create new patient
 */
patients.post('/', zValidator('json', createPatientSchema,), async (c,) => {
  try {
    const user = c.get('user',) as AuthenticatedUser
    const patientData = c.req.valid('json',) as CreatePatientRequest

    // Validate CPF
    if (!validateCPF(patientData.cpf,)) {
      return c.json(createErrorResponse('CPF inválido',), 400,)
    }

    // const supabase = db.client; // unused

    // Check if CPF already exists in the clinic
    const { data: existingPatient, } = await db
      .from('patients',)
      .select('id',)
      .eq('cpf', patientData.cpf,)
      .eq('clinic_id', user.clinic_id,)
      .single()

    if (existingPatient) {
      return c.json(createErrorResponse('Paciente com este CPF já existe na clínica',), 409,)
    }

    // Create patient
    const { data, error, } = await db
      .from('patients',)
      .insert({
        ...patientData,
        clinic_id: user.clinic_id,
        created_by: user.id,
      },)
      .select()
      .single()

    if (error) {
      console.error('Error creating patient:', error,)
      return c.json(createErrorResponse('Erro ao criar paciente',), 500,)
    }

    return c.json(createSuccessResponse(data, 'Paciente criado com sucesso',), 201,)
  } catch (error) {
    console.error('Unexpected error in POST /patients:', error,)
    return c.json(createErrorResponse('Erro interno do servidor',), 500,)
  }
},)

export default patients
