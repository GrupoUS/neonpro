import type { Patient } from '../entities/patient';

/**
 * Patient Repository Interface
 * Abstract interface for patient data access
 */
export interface PatientRepository {
  /**
   * Find a patient by ID
   * @param id Patient ID
   * @returns Patient or null if not found
   */
  findById(id: string): Promise<Patient | null>;

  /**
   * Find patients by clinic ID
   * @param clinicId Clinic ID
   * @returns Array of patients
   */
  findByClinicId(clinicId: string): Promise<Patient[]>;

  /**
   * Find patients by medical record number
   * @param medicalRecordNumber Medical record number
   * @returns Patient or null if not found
   */
  findByMedicalRecordNumber(
    medicalRecordNumber: string,
  ): Promise<Patient | null>;

  /**
   * Find patients by CPF
   * @param cpf CPF number
   * @returns Array of patients (CPF may not be unique across clinics)
   */
  findByCPF(cpf: string): Promise<Patient[]>;

  /**
   * Search patients by name or other criteria
   * @param query Search query
   * @param clinicId Optional clinic ID to scope search
   * @returns Array of matching patients
   */
  search(_query: string, clinicId?: string): Promise<Patient[]>;

  /**
   * Find active patients
   * @param clinicId Clinic ID
   * @param limit Optional limit
   * @param offset Optional offset
   * @returns Array of active patients
   */
  findActive(
    clinicId: string,
    limit?: number,
    offset?: number,
  ): Promise<Patient[]>;

  /**
   * Create a new patient
   * @param patient Patient data
   * @returns Created patient with generated ID
   */
  create(
    patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Patient>;

  /**
   * Update an existing patient
   * @param id Patient ID
   * @param updates Partial patient data to update
   * @returns Updated patient
   */
  update(id: string, updates: Partial<Patient>): Promise<Patient>;

  /**
   * Delete a patient (soft delete)
   * @param id Patient ID
   * @param deletedBy User who deleted the patient
   * @returns Success status
   */
  delete(id: string, deletedBy: string): Promise<boolean>;

  /**
   * Count patients by clinic
   * @param clinicId Clinic ID
   * @returns Patient count
   */
  countByClinic(clinicId: string): Promise<number>;

  /**
   * Check if medical record number exists
   * @param medicalRecordNumber Medical record number
   * @param clinicId Clinic ID
   * @param excludePatientId Optional patient ID to exclude from check
   * @returns True if medical record number exists
   */
  medicalRecordNumberExists(
    medicalRecordNumber: string,
    clinicId: string,
    excludePatientId?: string,
  ): Promise<boolean>;
}

/**
 * Patient Repository Query Interface
 * For complex queries and filtering
 */
export interface PatientQueryRepository {
  /**
   * Find patients with filters
   * @param filters Filter criteria
   * @returns Array of matching patients
   */
  findWithFilters(filters: PatientFilters): Promise<Patient[]>;

  /**
   * Count patients with filters
   * @param filters Filter criteria
   * @returns Patient count
   */
  countWithFilters(filters: PatientFilters): Promise<number>;

  /**
   * Get patient statistics
   * @param clinicId Clinic ID
   * @returns Patient statistics
   */
  getStatistics(clinicId: string): Promise<PatientStatistics>;
}

/**
 * Patient filters interface
 */
export interface PatientFilters {
  clinicId?: string;
  isActive?: boolean;
  gender?: string;
  birthDateFrom?: string;
  birthDateTo?: string;
  hasInsurance?: boolean;
  hasAllergies?: boolean;
  hasChronicConditions?: boolean;
  searchQuery?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: keyof Patient;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Patient statistics interface
 */
export interface PatientStatistics {
  total: number;
  active: number;
  inactive: number;
  byGender: Record<string, number>;
  byAgeGroup: Record<string, number>;
  withInsurance: number;
  withAllergies: number;
  withChronicConditions: number;
  newThisMonth: number;
  newThisYear: number;
}
