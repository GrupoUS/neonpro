import {
  Patient,
  PatientAlreadyExistsError,
  PatientFilters as PatientFilter,
  PatientNotFoundError,
  PatientNotFoundError as PatientEntityValidationError,
  PatientValidationError,
} from '@neonpro/domain'
import type { PatientRepository as IPatientRepository } from '@neonpro/domain'

/**
 * Application service for patient management
 * Uses repository pattern with proper dependency injection
 * Implements business logic while keeping domain layer pure
 */
export class PatientService {
  constructor(private patientRepository: IPatientRepository) {}

  /**
   * Create a new patient with validation
   */
  async createPatient(request: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    try {
      // Validate required fields
      this.validateCreateRequest(request)

      // Check for duplicate CPF instead (since medicalRecordNumber doesn't exist in API)
      const existingPatients = await this.patientRepository.findByCPF(
        request.cpf!,
      )
      if (existingPatients.length > 0) {
        throw new PatientValidationError(['Patient with this CPF already exists'])
      }

      // Validate CPF (required field)
      if (!this.validateCPF(request.cpf!)) {
        throw new PatientValidationError(['Invalid CPF format'])
      }

      // Create patient (need to adapt API request to domain format)
      const domainPatient = this.adaptApiRequestToDomain(request)
      const patient = await this.patientRepository.create(domainPatient)

      return patient
    } catch (error) {
      if (error instanceof PatientValidationError) {
        throw error
      }
      throw new PatientAlreadyExistsError(
        request.cpf || 'unknown',
        'cpf',
      )
    }
  }

  /**
   * Update an existing patient
   */
  async updatePatient(
    id: string,
    request: Partial<Patient>,
  ): Promise<Patient> {
    try {
      // Check if patient exists
      const existingPatient = await this.patientRepository.findById(id)
      if (!existingPatient) {
        throw new PatientValidationError(['Patient not found'])
      }

      // Validate CPF if provided
      if (request.cpf && !this.validateCPF(request.cpf)) {
        throw new PatientValidationError(['Invalid CPF format'])
      }

      // Update patient
      const updatedPatient = await this.patientRepository.update(id, request)

      return updatedPatient
    } catch (error) {
      if (error instanceof PatientEntityValidationError) {
        throw error
      }
      throw new PatientAlreadyExistsError(
        id || 'unknown',
        'cpf',
      )
    }
  }

  /**
   * Get patient by ID
   */
  async getPatient(id: string): Promise<Patient | null> {
    try {
      return await this.patientRepository.findById(id)
    } catch {
      throw new PatientNotFoundError(id)
    }
  }

  /**
   * Get patients by clinic with filtering and pagination
   */
  async getPatientsByClinic(
    clinicId: string,
    options?: { search?: string; offset?: number; limit?: number },
  ): Promise<{ patients: Patient[]; total: number; limit: number; offset: number }> {
    try {
      const patients = await this.patientRepository.findByClinicId(clinicId)

      // Apply simple filtering (this is a basic implementation)
      let filteredPatients = patients

      if (options?.search) {
        const searchLower = options.search.toLowerCase()
        filteredPatients = filteredPatients.filter(
          p =>
            p.fullName.toLowerCase().includes(searchLower) ||
            p.email?.toLowerCase().includes(searchLower) ||
            p.cpf?.includes(searchLower),
        )
      }

      // Apply pagination
      const offset = options?.offset || 0
      const limit = options?.limit || 20
      const paginatedPatients = filteredPatients.slice(offset, offset + limit)

      return {
        patients: paginatedPatients,
        total: filteredPatients.length,
        limit,
        offset,
      }
    } catch {
      throw new PatientNotFoundError('unknown')
    }
  }

  /**
   * Search patients by query string
   */
  async searchPatients(
    query: string,
    clinicId?: string,
    options?: { search?: string; offset?: number; limit?: number },
  ): Promise<{ patients: Patient[]; total: number; limit: number; offset: number }> {
    try {
      let patients: Patient[]

      if (clinicId) {
        patients = await this.patientRepository.findByClinicId(clinicId)
      } else {
        // For now, return empty array when no clinicId is provided
        // In a real implementation, you might want to search across all clinics
        patients = []
      }

      // Apply search filtering
      const searchLower = query.toLowerCase()
      const filteredPatients = patients.filter(
        p =>
          p.fullName.toLowerCase().includes(searchLower) ||
          p.email?.toLowerCase().includes(searchLower) ||
          p.cpf?.includes(searchLower) ||
          p.medicalRecordNumber.toLowerCase().includes(searchLower),
      )

      // Apply pagination
      const offset = options?.offset || 0
      const limit = options?.limit || 20
      const paginatedPatients = filteredPatients.slice(offset, offset + limit)

      return {
        patients: paginatedPatients,
        total: filteredPatients.length,
        limit,
        offset,
      }
    } catch {
      throw new PatientNotFoundError('unknown')
    }
  }

  /**
   * Delete a patient
   */
  async deletePatient(id: string): Promise<boolean> {
    try {
      // Check if patient exists
      const existingPatient = await this.patientRepository.findById(id)
      if (!existingPatient) {
        throw new PatientValidationError(['Patient not found'])
      }

      return await this.patientRepository.delete(id, 'system')
    } catch (error) {
      if (error instanceof PatientEntityValidationError) {
        throw error
      }
      throw new PatientAlreadyExistsError(
        id || 'unknown',
        'cpf',
      )
    }
  }

  /**
   * Count patients with optional filtering
   */
  async countPatients(filter: PatientFilter): Promise<number> {
    try {
      let patients: Patient[]

      if (filter.clinicId) {
        patients = await this.patientRepository.findByClinicId(filter.clinicId)
      } else {
        patients = []
      }

      // Apply additional filters
      let filteredPatients = patients

      if (filter.isActive !== undefined) {
        filteredPatients = filteredPatients.filter(
          p => p.isActive === filter.isActive,
        )
      }

      if (filter.gender) {
        filteredPatients = filteredPatients.filter(
          p => p.gender === filter.gender,
        )
      }

      if (filter.birthDateFrom && filter.birthDateTo) {
        filteredPatients = filteredPatients.filter(p => {
          if (!p.birthDate) return false
          const birthDate = new Date(p.birthDate)
          const fromDate = new Date(filter.birthDateFrom!)
          const toDate = new Date(filter.birthDateTo!)
          return birthDate >= fromDate && birthDate <= toDate
        })
      }

      return filteredPatients.length
    } catch {
      throw new PatientNotFoundError('unknown')
    }
  }

  /**
   * Validate patient creation request
   */
  private validateCreateRequest(request: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): void {
    if (!request.clinicId) {
      throw new PatientValidationError(['Clinic ID is required'])
    }

    if (!request.fullName) {
      throw new PatientValidationError(['Full name is required'])
    }

    if (!request.cpf) {
      throw new PatientValidationError(['CPF is required'])
    }

    if (!request.birthDate) {
      throw new PatientValidationError(['Date of birth is required'])
    }

    if (!request.lgpdConsentGiven) {
      throw new PatientValidationError(['LGPD consent is required'])
    }

    // Validate birth date
    const birthDate = new Date(request.birthDate)
    const now = new Date()

    if (isNaN(birthDate.getTime())) {
      throw new PatientValidationError(['Invalid birth date format'])
    }

    if (birthDate > now) {
      throw new PatientValidationError(['Birth date cannot be in the future'])
    }

    // Check if person is reasonably old (not older than 150 years)
    const maxAge = 150
    const minDate = new Date(
      now.getFullYear() - maxAge,
      now.getMonth(),
      now.getDate(),
    )
    if (birthDate < minDate) {
      throw new PatientValidationError(['Birth date is too far in the past'])
    }

    // Validate phone number if provided
    if (request.phonePrimary && !this.validateBrazilianPhone(request.phonePrimary)) {
      throw new PatientValidationError(['Invalid phone number format'])
    }

    // Validate email if provided
    if (request.email && !this.validateEmail(request.email)) {
      throw new PatientValidationError(['Invalid email format'])
    }
  }

  /**
   * Validate CPF using Brazilian rules
   */
  private validateCPF(cpf: string): boolean {
    // Remove formatting
    const cleanCPF = cpf.replace(/[^\d]/g, '')

    // Check length
    if (cleanCPF.length !== 11) return false

    // Check for known invalid CPFs
    const invalidCPFs = [
      '00000000000',
      '11111111111',
      '22222222222',
      '33333333333',
      '44444444444',
      '55555555555',
      '66666666666',
      '77777777777',
      '88888888888',
      '99999999999',
    ]

    if (invalidCPFs.includes(cleanCPF)) return false

    // Validate check digits
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
    }

    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
    }

    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false

    return true
  }

  /**
   * Validate Brazilian phone number
   */
  private validateBrazilianPhone(phone: string): boolean {
    // Remove formatting
    const cleanPhone = phone.replace(/[^\d]/g, '')

    // Check length (10 or 11 digits)
    if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false

    // Check area code (11-99)
    const areaCode = parseInt(cleanPhone.substring(0, 2))
    if (areaCode < 11 || areaCode > 99) return false

    // Check mobile number format (9 digits starting with 9)
    if (cleanPhone.length === 11) {
      const firstDigit = parseInt(cleanPhone.charAt(2))
      if (firstDigit !== 9) return false
    }

    return true
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Adapt API request to domain format
   */
  private adaptApiRequestToDomain(
    request: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>,
  ): Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> {
    const names = request.fullName.split(' ')
    const givenNames = names.slice(0, -1)
    const familyName = names[names.length - 1]

    return {
      ...request,
      givenNames: givenNames.length > 0
        ? givenNames
        : [givenNames.join(' ') || 'Unknown'],
      familyName: familyName || 'Unknown',
      allergies: request.allergies || [],
      chronicConditions: request.chronicConditions || [],
      currentMedications: request.currentMedications || [],
      isActive: request.isActive ?? true,
    }
  }
}
