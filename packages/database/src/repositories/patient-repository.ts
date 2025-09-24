import { Patient, PatientFilters, PatientRepository } from '@neonpro/domain'
import { UpdatePatientRequest } from '@neonpro/types'
import { SupabaseClient } from '@supabase/supabase-js'
import { databaseLogger, logHealthcareError } from '../../../shared/src/logging/healthcare-logger'
import { PatientQueryOptions, PatientSearchResult } from '../types/index.js'
import { DatabasePatient } from '../types/supabase.js'

/**
 * Supabase implementation of PatientRepository
 * Handles all patient data access operations with proper error handling and validation
 */
export class PatientRepository implements PatientRepository {
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

      return data.map(patient => this.mapDatabasePatientToDomain(patient))
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

  async create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    try {
      const dbPatient = this.mapCreateRequestToDatabase(patient)

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

  async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    try {
      const updateData = this.mapUpdateRequestToDatabase(updates)

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

  async delete(id: string, deletedBy: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('patients')
        .update({
          is_active: false,
          updated_by: deletedBy,
          updated_at: new Date().toISOString(),
        })
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
   * Find active patients
   */
  async findActive(
    clinicId: string,
    limit?: number,
    offset?: number,
  ): Promise<Patient[]> {
    try {
      let query = this.supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)

      if (limit) {
        query = query.limit(limit)
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        logHealthcareError('database', error, { method: 'findActive', clinicId })
        return []
      }

      return data ? data.map(this.mapDatabasePatientToDomain) : []
    } catch (error) {
      logHealthcareError('database', error, { method: 'findActive', clinicId })
      return []
    }
  }

  /**
   * Count patients by clinic
   */
  async countByClinic(clinicId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)

      if (error) {
        logHealthcareError('database', error, { method: 'countByClinic', clinicId })
        return 0
      }

      return count || 0
    } catch (error) {
      logHealthcareError('database', error, { method: 'countByClinic', clinicId })
      return 0
    }
  }

  /**
   * Check if medical record number exists
   */
  async medicalRecordNumberExists(
    medicalRecordNumber: string,
    clinicId: string,
    excludePatientId?: string,
  ): Promise<boolean> {
    try {
      let query = this.supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('medical_record_number', medicalRecordNumber)
        .eq('clinic_id', clinicId)

      if (excludePatientId) {
        query = query.neq('id', excludePatientId)
      }

      const { count, error } = await query

      if (error) {
        logHealthcareError('database', error, { method: 'medicalRecordNumberExists' })
        return false
      }

      return (count || 0) > 0
    } catch (error) {
      logHealthcareError('database', error, { method: 'medicalRecordNumberExists' })
      return false
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
   * Maps create patient data to database format
   */
  private mapCreateRequestToDatabase(
    patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>,
  ): Partial<DatabasePatient> {
    return {
      clinic_id: patient.clinicId,
      medical_record_number: patient.medicalRecordNumber,
      external_ids: patient.externalIds,
      given_names: patient.givenNames,
      family_name: patient.familyName,
      full_name: patient.fullName,
      preferred_name: patient.preferredName,
      phone_primary: patient.phonePrimary,
      phone_secondary: patient.phoneSecondary,
      email: patient.email,
      address_line1: patient.addressLine1,
      address_line2: patient.addressLine2,
      city: patient.city,
      state: patient.state,
      postal_code: patient.postalCode,
      country: patient.country,
      birth_date: patient.birthDate,
      gender: patient.gender,
      marital_status: patient.maritalStatus,
      is_active: patient.isActive !== false,
      deceased_indicator: patient.deceasedIndicator,
      deceased_date: patient.deceasedDate,
      data_consent_status: patient.dataConsentStatus,
      data_consent_date: patient.dataConsentDate,
      data_retention_until: patient.dataRetentionUntil,
      data_source: patient.dataSource,
      created_by: patient.createdBy,
      photo_url: patient.photoUrl,
      cpf: patient.cpf,
      rg: patient.rg,
      passport_number: patient.passportNumber,
      preferred_contact_method: patient.preferredContactMethod,
      blood_type: patient.bloodType,
      allergies: patient.allergies,
      chronic_conditions: patient.chronicConditions,
      current_medications: patient.currentMedications,
      insurance_provider: patient.insuranceProvider,
      insurance_number: patient.insuranceNumber,
      insurance_plan: patient.insurancePlan,
      emergency_contact_name: patient.emergencyContactName,
      emergency_contact_phone: patient.emergencyContactPhone,
      emergency_contact_relationship: patient.emergencyContactRelationship,
      lgpd_consent_given: patient.lgpdConsentGiven || false,
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
