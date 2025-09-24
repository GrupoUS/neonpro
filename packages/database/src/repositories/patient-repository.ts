import { Patient, PatientFilters, PatientRepository as IPatientRepository } from '@neonpro/domain'
import { CreatePatientRequest, UpdatePatientRequest } from '@neonpro/types'
import { SupabaseClient } from '@supabase/supabase-js'
import { databaseLogger, logHealthcareError } from '../../../shared/src/logging/healthcare-logger'
import { PatientQueryOptions, PatientSearchResult } from '../types/index.js'
import { DatabasePatient } from '../types/supabase.js'

/**
 * Supabase implementation of PatientRepository
 * Handles all patient data access operations with proper error handling and validation
 */
export class PatientRepository implements IPatientRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Patient | null> {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .select(
          `
          *,
          clinic:clinics(id, name),
          appointments(count)
        `,
        )
        .eq('id', id)
        .single()

      if (error) {
        logHealthcareError('database', error, { method: 'findById', patientId: id })
        return null
      }

      if (!data) return null

      return this.mapDatabasePatientToDomain(data)
    } catch (error) {
      logHealthcareError('database', error, { method: 'findById', patientId: id })
      return null
    }
  }

  async findByMedicalRecordNumber(
    medicalRecordNumber: string,
  ): Promise<Patient | null> {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .select('*')
        .eq('medical_record_number', medicalRecordNumber)
        .single()

      if (error || !data) return null

      return this.mapDatabasePatientToDomain(data)
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'findByMedicalRecordNumber',
        medicalRecordNumber,
      })
      return null
    }
  }

  async findByCPF(cpf: string): Promise<Patient[]> {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .select('*')
        .eq('cpf', cpf)

      if (error || !data) return []

      return data.map((patient) => this.mapDatabasePatientToDomain(patient))
    } catch (error) {
      logHealthcareError('database', error, { method: 'findByCPF' })
      return []
    }
  }

  async findByClinicId(
    clinicId: string,
    options?: PatientQueryOptions,
  ): Promise<PatientSearchResult> {
    try {
      let query = this.supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .eq('clinic_id', clinicId)

      // Apply filters
      if (options?.status) {
        query = query.eq('status', options.status)
      }

      if (options?.search) {
        query = query.or(
          `full_name.ilike.%${options.search}%,email.ilike.%${options.search}%,cpf.ilike.%${options.search}%`,
        )
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1,
        )
      }

      // Apply sorting
      if (options?.sortBy) {
        const sortOrder = options.sortOrder === 'desc' ? false : true
        query = query.order(options.sortBy, { ascending: sortOrder })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error, count } = await query

      if (error) {
        logHealthcareError('database', error, { method: 'findByClinicId', clinicId })
        return { patients: [], total: 0 }
      }

      const patients = data ? data.map(this.mapDatabasePatientToDomain) : []

      return {
        patients,
        total: count || 0,
        limit: options?.limit || 10,
        offset: options?.offset || 0,
      }
    } catch (error) {
      logHealthcareError('database', error, { method: 'findByClinicId', clinicId })
      return { patients: [], total: 0 }
    }
  }

  async findWithFilter(
    filter: PatientFilters,
    options?: PatientQueryOptions,
  ): Promise<PatientSearchResult> {
    try {
      let query = this.supabase
        .from('patients')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filter.clinicId) {
        query = query.eq('clinic_id', filter.clinicId)
      }

      if (filter.status) {
        query = query.eq('status', filter.status)
      }

      if (filter.gender) {
        query = query.eq('gender', filter.gender)
      }

      if (filter.birthDateFrom && filter.birthDateTo) {
        query = query
          .gte('birth_date', filter.birthDateFrom)
          .lte('birth_date', filter.birthDateTo)
      }

      if (filter.search) {
        query = query.or(
          `full_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,cpf.ilike.%${filter.search}%`,
        )
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1,
        )
      }

      // Apply sorting
      if (options?.sortBy) {
        const sortOrder = options.sortOrder === 'desc' ? false : true
        query = query.order(options.sortBy, { ascending: sortOrder })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error, count } = await query

      if (error) {
        logHealthcareError('database', error, { method: 'findWithFilter' })
        return { patients: [], total: 0 }
      }

      const patients = data ? data.map(this.mapDatabasePatientToDomain) : []

      return {
        patients,
        total: count || 0,
        limit: options?.limit || 10,
        offset: options?.offset || 0,
      }
    } catch (error) {
      logHealthcareError('database', error, { method: 'findWithFilter' })
      return { patients: [], total: 0 }
    }
  }

  async create(patientData: CreatePatientRequest): Promise<Patient> {
    try {
      const dbPatient = this.mapCreateRequestToDatabase(patientData)

      const { data, error } = await this.supabase
        .from('patients')
        .insert(dbPatient)
        .select()
        .single()

      if (error) {
        logHealthcareError('database', error, { method: 'create' })
        throw new Error(`Failed to create patient: ${error.message}`)
      }

      return this.mapDatabasePatientToDomain(data)
    } catch (error) {
      logHealthcareError('database', error, { method: 'create' })
      throw error
    }
  }

  async update(
    id: string,
    patientData: UpdatePatientRequest,
  ): Promise<Patient> {
    try {
      const updateData = this.mapUpdateRequestToDatabase(patientData)

      const { data, error } = await this.supabase
        .from('patients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logHealthcareError('database', error, { method: 'update', patientId: id })
        throw new Error(`Failed to update patient: ${error.message}`)
      }

      return this.mapDatabasePatientToDomain(data)
    } catch (error) {
      logHealthcareError('database', error, { method: 'update', patientId: id })
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('patients')
        .delete()
        .eq('id', id)

      if (error) {
        logHealthcareError('database', error, { method: 'delete', patientId: id })
        return false
      }

      return true
    } catch (error) {
      logHealthcareError('database', error, { method: 'delete', patientId: id })
      return false
    }
  }

  async search(
    _query: string,
    clinicId?: string,
    options?: PatientQueryOptions,
  ): Promise<PatientSearchResult> {
    try {
      let dbQuery = this.supabase
        .from('patients')
        .select('*', { count: 'exact' })

      // Build search query
      const searchCondition =
        `full_name.ilike.%${_query}%,email.ilike.%${_query}%,cpf.ilike.%${_query}%,medical_record_number.ilike.%${_query}%`

      if (clinicId) {
        dbQuery = dbQuery.eq('clinic_id', clinicId)
      }

      dbQuery = dbQuery.or(searchCondition)

      // Apply pagination
      if (options?.limit) {
        dbQuery = dbQuery.limit(options.limit)
      }

      if (options?.offset) {
        dbQuery = dbQuery.range(
          options.offset,
          options.offset + (options.limit || 10) - 1,
        )
      }

      // Apply sorting
      if (options?.sortBy) {
        const sortOrder = options.sortOrder === 'desc' ? false : true
        dbQuery = dbQuery.order(options.sortBy, { ascending: sortOrder })
      } else {
        dbQuery = dbQuery.order('created_at', { ascending: false })
      }

      const { data, error, count } = await dbQuery

      if (error) {
        logHealthcareError('database', error, { method: 'search', query: _query, clinicId })
        return { patients: [], total: 0 }
      }

      const patients = data ? data.map(this.mapDatabasePatientToDomain) : []

      return {
        patients,
        total: count || 0,
        limit: options?.limit || 10,
        offset: options?.offset || 0,
      }
    } catch (error) {
      logHealthcareError('database', error, { method: 'search', query: _query, clinicId })
      return { patients: [], total: 0 }
    }
  }

  async count(filter: PatientFilters): Promise<number> {
    try {
      let query = this.supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })

      if (filter.clinicId) {
        query = query.eq('clinic_id', filter.clinicId)
      }

      if (filter.status) {
        query = query.eq('status', filter.status)
      }

      if (filter.gender) {
        query = query.eq('gender', filter.gender)
      }

      if (filter.birthDateFrom && filter.birthDateTo) {
        query = query
          .gte('birth_date', filter.birthDateFrom)
          .lte('birth_date', filter.birthDateTo)
      }

      const { count, error } = await query

      if (error) {
        logHealthcareError('database', error, { method: 'count' })
        return 0
      }

      return count || 0
    } catch (error) {
      logHealthcareError('database', error, { method: 'count' })
      return 0
    }
  }

  /**
   * Maps database patient to domain patient
   */
  private mapDatabasePatientToDomain(dbPatient: DatabasePatient): Patient {
    return {
      id: dbPatient.id,
      clinicId: dbPatient.clinic_id,
      medicalRecordNumber: dbPatient.medical_record_number,
      externalIds: dbPatient.external_ids || {},
      givenNames: dbPatient.given_names || [],
      familyName: dbPatient.family_name || '',
      fullName: dbPatient.full_name || '',
      preferredName: dbPatient.preferred_name || undefined,
      phonePrimary: dbPatient.phone_primary || undefined,
      phoneSecondary: dbPatient.phone_secondary || undefined,
      email: dbPatient.email || undefined,
      addressLine1: dbPatient.address_line1 || undefined,
      addressLine2: dbPatient.address_line2 || undefined,
      city: dbPatient.city || undefined,
      state: dbPatient.state || undefined,
      postalCode: dbPatient.postal_code || undefined,
      country: dbPatient.country || undefined,
      birthDate: dbPatient.birth_date || undefined,
      gender: dbPatient.gender || undefined,
      maritalStatus: dbPatient.marital_status || undefined,
      isActive: dbPatient.is_active !== false,
      deceasedIndicator: dbPatient.deceased_indicator || false,
      deceasedDate: dbPatient.deceased_date || undefined,
      dataConsentStatus: dbPatient.data_consent_status || undefined,
      dataConsentDate: dbPatient.data_consent_date || undefined,
      dataRetentionUntil: dbPatient.data_retention_until || undefined,
      dataSource: dbPatient.data_source || undefined,
      createdAt: dbPatient.created_at,
      updatedAt: dbPatient.updated_at,
      createdBy: dbPatient.created_by || undefined,
      updatedBy: dbPatient.updated_by || undefined,
      photoUrl: dbPatient.photo_url || undefined,
      cpf: dbPatient.cpf || undefined,
      rg: dbPatient.rg || undefined,
      passportNumber: dbPatient.passport_number || undefined,
      preferredContactMethod: dbPatient.preferred_contact_method || undefined,
      bloodType: dbPatient.blood_type || undefined,
      allergies: dbPatient.allergies || [],
      chronicConditions: dbPatient.chronic_conditions || [],
      currentMedications: dbPatient.current_medications || [],
      insuranceProvider: dbPatient.insurance_provider || undefined,
      insuranceNumber: dbPatient.insurance_number || undefined,
      insurancePlan: dbPatient.insurance_plan || undefined,
      emergencyContactName: dbPatient.emergency_contact_name || undefined,
      emergencyContactPhone: dbPatient.emergency_contact_phone || undefined,
      emergencyContactRelationship: dbPatient.emergency_contact_relationship || undefined,
      lgpdConsentGiven: dbPatient.lgpd_consent_given || false,
    }
  }

  /**
   * Maps create request to database format
   */
  private mapCreateRequestToDatabase(
    request: CreatePatientRequest,
  ): Partial<DatabasePatient> {
    return {
      clinic_id: request.clinicId,
      medical_record_number: request.medicalRecordNumber,
      external_ids: request.externalIds,
      given_names: request.givenNames,
      family_name: request.familyName,
      full_name: request.fullName,
      preferred_name: request.preferredName,
      phone_primary: request.phonePrimary,
      phone_secondary: request.phoneSecondary,
      email: request.email,
      address_line1: request.addressLine1,
      address_line2: request.addressLine2,
      city: request.city,
      state: request.state,
      postal_code: request.postalCode,
      country: request.country,
      birth_date: request.birthDate,
      gender: request.gender,
      marital_status: request.maritalStatus,
      is_active: request.isActive !== false,
      deceased_indicator: request.deceasedIndicator,
      deceased_date: request.deceasedDate,
      data_consent_status: request.dataConsentStatus,
      data_consent_date: request.dataConsentDate,
      data_retention_until: request.dataRetentionUntil,
      data_source: request.dataSource,
      created_by: request.createdBy,
      photo_url: request.photoUrl,
      cpf: request.cpf,
      rg: request.rg,
      passport_number: request.passportNumber,
      preferred_contact_method: request.preferredContactMethod,
      blood_type: request.bloodType,
      allergies: request.allergies,
      chronic_conditions: request.chronicConditions,
      current_medications: request.currentMedications,
      insurance_provider: request.insuranceProvider,
      insurance_number: request.insuranceNumber,
      insurance_plan: request.insurancePlan,
      emergency_contact_name: request.emergencyContactName,
      emergency_contact_phone: request.emergencyContactPhone,
      emergency_contact_relationship: request.emergencyContactRelationship,
      lgpd_consent_given: request.lgpdConsentGiven || false,
    }
  }

  /**
   * Maps update request to database format
   */
  private mapUpdateRequestToDatabase(
    _request: UpdatePatientRequest,
  ): Partial<DatabasePatient> {
    const updateData: Partial<DatabasePatient> = {}

    if (_request.familyName !== undefined) {
      updateData.family_name = _request.familyName
    }
    if (_request.fullName !== undefined) {
      updateData.full_name = _request.fullName
    }
    if (_request.preferredName !== undefined) {
      updateData.preferred_name = _request.preferredName
    }
    if (_request.phonePrimary !== undefined) {
      updateData.phone_primary = _request.phonePrimary
    }
    if (_request.phoneSecondary !== undefined) {
      updateData.phone_secondary = _request.phoneSecondary
    }
    if (_request.email !== undefined) updateData.email = _request.email
    if (_request.addressLine1 !== undefined) {
      updateData.address_line1 = _request.addressLine1
    }
    if (_request.addressLine2 !== undefined) {
      updateData.address_line2 = _request.addressLine2
    }
    if (_request.city !== undefined) updateData.city = _request.city
    if (_request.state !== undefined) updateData.state = _request.state
    if (_request.postalCode !== undefined) {
      updateData.postal_code = _request.postalCode
    }
    if (_request.country !== undefined) updateData.country = _request.country
    if (_request.gender !== undefined) updateData.gender = _request.gender
    if (_request.maritalStatus !== undefined) {
      updateData.marital_status = _request.maritalStatus
    }
    if (_request.isActive !== undefined) {
      updateData.is_active = _request.isActive
    }
    if (_request.deceasedIndicator !== undefined) {
      updateData.deceased_indicator = _request.deceasedIndicator
    }
    if (_request.deceasedDate !== undefined) {
      updateData.deceased_date = _request.deceasedDate
    }
    if (_request.dataConsentStatus !== undefined) {
      updateData.data_consent_status = _request.dataConsentStatus
    }
    if (_request.dataConsentDate !== undefined) {
      updateData.data_consent_date = _request.dataConsentDate
    }
    if (_request.dataRetentionUntil !== undefined) {
      updateData.data_retention_until = _request.dataRetentionUntil
    }
    if (_request.photoUrl !== undefined) {
      updateData.photo_url = _request.photoUrl
    }
    if (_request.rg !== undefined) updateData.rg = _request.rg
    if (_request.passportNumber !== undefined) {
      updateData.passport_number = _request.passportNumber
    }
    if (_request.preferredContactMethod !== undefined) {
      updateData.preferred_contact_method = _request.preferredContactMethod
    }
    if (_request.bloodType !== undefined) {
      updateData.blood_type = _request.bloodType
    }
    if (_request.allergies !== undefined) {
      updateData.allergies = _request.allergies
    }
    if (_request.chronicConditions !== undefined) {
      updateData.chronic_conditions = _request.chronicConditions
    }
    if (_request.currentMedications !== undefined) {
      updateData.current_medications = _request.currentMedications
    }
    if (_request.insuranceProvider !== undefined) {
      updateData.insurance_provider = _request.insuranceProvider
    }
    if (_request.insuranceNumber !== undefined) {
      updateData.insurance_number = _request.insuranceNumber
    }
    if (_request.insurancePlan !== undefined) {
      updateData.insurance_plan = _request.insurancePlan
    }
    if (_request.emergencyContactName !== undefined) {
      updateData.emergency_contact_name = _request.emergencyContactName
    }
    if (_request.emergencyContactPhone !== undefined) {
      updateData.emergency_contact_phone = _request.emergencyContactPhone
    }
    if (_request.emergencyContactRelationship !== undefined) {
      updateData.emergency_contact_relationship = _request.emergencyContactRelationship
    }
    if (_request.lgpdConsentGiven !== undefined) {
      updateData.lgpd_consent_given = _request.lgpdConsentGiven
    }

    return updateData
  }
}
