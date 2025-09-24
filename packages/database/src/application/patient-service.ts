import {
  CreatePatientRequest,
  Patient,
  PatientEntityValidationError,
  PatientError,
  PatientFilter,
  PatientQueryOptions,
  PatientRepository as IPatientRepository,
  PatientSearchResult,
  UpdatePatientRequest,
} from '@neonpro/domain'

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
  async createPatient(_request: CreatePatientRequest): Promise<Patient> {
    try {
      // Validate required fields
      this.validateCreateRequest(_request)

      // Check for duplicate CPF instead (since medicalRecordNumber doesn't exist in API)
      const existingPatients = await this.patientRepository.findByCPF(
        _request.cpf,
      )
      if (existingPatients.length > 0) {
        throw new PatientEntityValidationError([
          'Patient with this CPF already exists',
        ])
      }

      // Validate CPF (required field)
      if (!this.validateCPF(_request.cpf)) {
        throw new PatientValidationError(['Invalid CPF format'])
      }

      // Create patient (need to adapt API request to domain format)
      const domainPatient = this.adaptApiRequestToDomain(_request)
      const patient = await this.patientRepository.create(domainPatient)

      return patient
    } catch (error) {
      if (error instanceof PatientEntityValidationError) {
        throw error
      }
      throw new PatientError(
        `Failed to create patient: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PATIENT_CREATE_ERROR',
        500,
      )
    }
  }

  /**
   * Update an existing patient
   */
  async updatePatient(
    id: string,
    _request: UpdatePatientRequest,
  ): Promise<Patient> {
    try {
      // Check if patient exists
      const existingPatient = await this.patientRepository.findById(id)
      if (!existingPatient) {
        throw new PatientEntityValidationError(['Patient not found'])
      }

      // Validate CPF if provided
      if (_request.cpf && !this.validateCPF(_request.cpf)) {
        throw new PatientValidationError(['Invalid CPF format'])
      }

      // Update patient
      const updatedPatient = await this.patientRepository.update(id, _request)

      return updatedPatient
    } catch (error) {
      if (error instanceof PatientEntityValidationError) {
        throw error
      }
      throw new PatientError(
        `Failed to update patient: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PATIENT_UPDATE_ERROR',
        500,
      )
    }
  }

  /**
   * Get patient by ID
   */
  async getPatient(id: string): Promise<Patient | null> {
    try {
      return await this.patientRepository.findById(id)
    } catch (error) {
      throw new PatientError(
        `Failed to get patient: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PATIENT_GET_ERROR',
        500,
      )
    }
  }

  /**
   * Get patients by clinic with filtering and pagination
   */
  async getPatientsByClinic(
    clinicId: string,
    options?: PatientQueryOptions,
  ): Promise<PatientSearchResult> {
    try {
      const patients = await this.patientRepository.findByClinicId(clinicId)

      // Apply simple filtering (this is a basic implementation)
      let filteredPatients = patients

      if (options?.search) {
        const searchLower = options.search.toLowerCase()
        filteredPatients = filteredPatients.filter(
          (p) =>
            p.fullName.toLowerCase().includes(searchLower)
            || p.email?.toLowerCase().includes(searchLower)
            || p.cpf?.includes(searchLower),
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
    } catch (error) {
      throw new PatientError(
        `Failed to get patients: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PATIENT_LIST_ERROR',
        500,
      )
    }
  }

  /**
   * Search patients by query string
   */
  async searchPatients(
    _query: string,
    clinicId?: string,
    options?: PatientQueryOptions,
  ): Promise<PatientSearchResult> {
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
      const searchLower = _query.toLowerCase()
      const filteredPatients = patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(searchLower)
          || p.email?.toLowerCase().includes(searchLower)
          || p.cpf?.includes(searchLower)
          || p.medicalRecordNumber.toLowerCase().includes(searchLower),
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
    } catch (error) {
      throw new PatientError(
        `Failed to search patients: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PATIENT_SEARCH_ERROR',
        500,
      )
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
        throw new PatientEntityValidationError(['Patient not found'])
      }

      return await this.patientRepository.delete(id)
    } catch (error) {
      if (error instanceof PatientEntityValidationError) {
        throw error
      }
      throw new PatientError(
        `Failed to delete patient: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PATIENT_DELETE_ERROR',
        500,
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
          (p) => p.isActive === filter.isActive,
        )
      }

      if (filter.gender) {
        filteredPatients = filteredPatients.filter(
          (p) => p.gender === filter.gender,
        )
      }

      if (filter.birthDateFrom && filter.birthDateTo) {
        filteredPatients = filteredPatients.filter((p) => {
          if (!p.birthDate) return false
          const birthDate = new Date(p.birthDate)
          const fromDate = new Date(filter.birthDateFrom)
          const toDate = new Date(filter.birthDateTo)
          return birthDate >= fromDate && birthDate <= toDate
        })
      }

      return filteredPatients.length
    } catch (error) {
      throw new PatientError(
        `Failed to count patients: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PATIENT_COUNT_ERROR',
        500,
      )
    }
  }

  /**
   * Validate patient creation request
   */
  private validateCreateRequest(_request: CreatePatientRequest): void {
    if (!_request.clinicId) {
      throw new PatientEntityValidationError(['Clinic ID is required'])
    }

    if (!_request.fullName) {
      throw new PatientEntityValidationError(['Full name is required'])
    }

    if (!_request.cpf) {
      throw new PatientEntityValidationError(['CPF is required'])
    }

    if (!_request.dateOfBirth) {
      throw new PatientEntityValidationError(['Date of birth is required'])
    }

    if (!_request.lgpdConsent) {
      throw new PatientEntityValidationError(['LGPD consent is required'])
    }

    // Validate birth date
    const birthDate = new Date(_request.dateOfBirth)
    const now = new Date()

    if (isNaN(birthDate.getTime())) {
      throw new PatientEntityValidationError(['Invalid birth date format'])
    }

    if (birthDate > now) {
      throw new PatientEntityValidationError([
        'Birth date cannot be in the future',
      ])
    }

    // Check if person is reasonably old (not older than 150 years)
    const maxAge = 150
    const minDate = new Date(
      now.getFullYear() - maxAge,
      now.getMonth(),
      now.getDate(),
    )
    if (birthDate < minDate) {
      throw new PatientEntityValidationError([
        'Birth date is too far in the past',
      ])
    }

    // Validate phone number if provided
    if (_request.phone && !this.validateBrazilianPhone(_request.phone)) {
      throw new PatientEntityValidationError(['Invalid phone number format'])
    }

    // Validate email if provided
    if (_request.email && !this.validateEmail(_request.email)) {
      throw new PatientEntityValidationError(['Invalid email format'])
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
    request: CreatePatientRequest,
  ): Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> {
    const names = request.fullName.split(' ')
    const givenNames = names.slice(0, -1)
    const familyName = names[names.length - 1]

    return {
      clinicId: request.clinicId,
      medicalRecordNumber: `MRN-${Date.now()}`, // Generate one since API doesn't provide it
      givenNames: givenNames.length > 0
        ? givenNames
        : [givenNames.join(' ') || 'Unknown'],
      familyName: familyName || 'Unknown',
      fullName: request.fullName,
      cpf: request.cpf,
      birthDate: request.dateOfBirth,
      email: request.email,
      phonePrimary: request.phone,
      lgpdConsentGiven: request.lgpdConsent,
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      isActive: true,
    }
  }
}
