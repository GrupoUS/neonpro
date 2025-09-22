import { 
  PatientRepository as IPatientRepository,
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientFilter,
  PatientSearchResult,
  PatientQueryOptions,
  PatientError,
  PatientEntityValidationError
} from "@neonpro/domain";

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
  async createPatient(request: CreatePatientRequest): Promise<Patient> {
    try {
      // Validate required fields
      this.validateCreateRequest(request);

      // Check for duplicate medical record number
      const existingPatient = await this.patientRepository.findByMedicalRecordNumber(request.medicalRecordNumber);
      if (existingPatient) {
        throw new PatientValidationError("Medical record number already exists");
      }

      // Validate CPF if provided
      if (request.cpf && !this.validateCPF(request.cpf)) {
        throw new PatientValidationError("Invalid CPF format");
      }

      // Create patient
      const patient = await this.patientRepository.create(request);

      return patient;
    } catch (error) {
      if (error instanceof PatientValidationError) {
        throw error;
      }
      throw new PatientError(`Failed to create patient: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing patient
   */
  async updatePatient(id: string, request: UpdatePatientRequest): Promise<Patient> {
    try {
      // Check if patient exists
      const existingPatient = await this.patientRepository.findById(id);
      if (!existingPatient) {
        throw new PatientValidationError("Patient not found");
      }

      // Validate CPF if provided
      if (request.cpf && !this.validateCPF(request.cpf)) {
        throw new PatientValidationError("Invalid CPF format");
      }

      // Update patient
      const updatedPatient = await this.patientRepository.update(id, request);

      return updatedPatient;
    } catch (error) {
      if (error instanceof PatientValidationError) {
        throw error;
      }
      throw new PatientError(`Failed to update patient: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get patient by ID
   */
  async getPatient(id: string): Promise<Patient | null> {
    try {
      return await this.patientRepository.findById(id);
    } catch (error) {
      throw new PatientError(`Failed to get patient: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get patients by clinic with filtering and pagination
   */
  async getPatientsByClinic(
    clinicId: string, 
    options?: PatientQueryOptions
  ): Promise<PatientSearchResult> {
    try {
      const filter: PatientFilter = { clinicId };
      return await this.patientRepository.findWithFilter(filter, options);
    } catch (error) {
      throw new PatientError(`Failed to get patients: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search patients by query string
   */
  async searchPatients(
    query: string, 
    clinicId?: string, 
    options?: PatientQueryOptions
  ): Promise<PatientSearchResult> {
    try {
      return await this.patientRepository.search(query, clinicId, options);
    } catch (error) {
      throw new PatientError(`Failed to search patients: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a patient
   */
  async deletePatient(id: string): Promise<boolean> {
    try {
      // Check if patient exists
      const existingPatient = await this.patientRepository.findById(id);
      if (!existingPatient) {
        throw new PatientValidationError("Patient not found");
      }

      return await this.patientRepository.delete(id);
    } catch (error) {
      if (error instanceof PatientValidationError) {
        throw error;
      }
      throw new PatientError(`Failed to delete patient: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Count patients with optional filtering
   */
  async countPatients(filter: PatientFilter): Promise<number> {
    try {
      return await this.patientRepository.count(filter);
    } catch (error) {
      throw new PatientError(`Failed to count patients: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate patient creation request
   */
  private validateCreateRequest(request: CreatePatientRequest): void {
    if (!request.clinicId) {
      throw new PatientValidationError("Clinic ID is required");
    }

    if (!request.medicalRecordNumber) {
      throw new PatientValidationError("Medical record number is required");
    }

    if (!request.givenNames || request.givenNames.length === 0) {
      throw new PatientValidationError("At least one given name is required");
    }

    if (!request.familyName) {
      throw new PatientValidationError("Family name is required");
    }

    if (!request.fullName) {
      throw new PatientValidationError("Full name is required");
    }

    // Validate birth date if provided
    if (request.birthDate) {
      const birthDate = new Date(request.birthDate);
      const now = new Date();
      
      if (isNaN(birthDate.getTime())) {
        throw new PatientValidationError("Invalid birth date format");
      }

      if (birthDate > now) {
        throw new PatientValidationError("Birth date cannot be in the future");
      }

      // Check if person is reasonably old (not older than 150 years)
      const maxAge = 150;
      const minDate = new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate());
      if (birthDate < minDate) {
        throw new PatientValidationError("Birth date is too far in the past");
      }
    }

    // Validate phone numbers if provided
    if (request.phonePrimary && !this.validateBrazilianPhone(request.phonePrimary)) {
      throw new PatientValidationError("Invalid primary phone number format");
    }

    if (request.phoneSecondary && !this.validateBrazilianPhone(request.phoneSecondary)) {
      throw new PatientValidationError("Invalid secondary phone number format");
    }

    // Validate email if provided
    if (request.email && !this.validateEmail(request.email)) {
      throw new PatientValidationError("Invalid email format");
    }
  }

  /**
   * Validate CPF using Brazilian rules
   */
  private validateCPF(cpf: string): boolean {
    // Remove formatting
    const cleanCPF = cpf.replace(/[^\d]/g, "");

    // Check length
    if (cleanCPF.length !== 11) return false;

    // Check for known invalid CPFs
    const invalidCPFs = [
      "00000000000", "11111111111", "22222222222", "33333333333",
      "44444444444", "55555555555", "66666666666", "77777777777",
      "88888888888", "99999999999"
    ];

    if (invalidCPFs.includes(cleanCPF)) return false;

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }

    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  }

  /**
   * Validate Brazilian phone number
   */
  private validateBrazilianPhone(phone: string): boolean {
    // Remove formatting
    const cleanPhone = phone.replace(/[^\d]/g, "");

    // Check length (10 or 11 digits)
    if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;

    // Check area code (11-99)
    const areaCode = parseInt(cleanPhone.substring(0, 2));
    if (areaCode < 11 || areaCode > 99) return false;

    // Check mobile number format (9 digits starting with 9)
    if (cleanPhone.length === 11) {
      const firstDigit = parseInt(cleanPhone.charAt(2));
      if (firstDigit !== 9) return false;
    }

    return true;
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}