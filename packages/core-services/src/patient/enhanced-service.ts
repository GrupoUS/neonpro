/**
 * Enhanced Patient Service
 *
 * Migração do PatientService para usar o Enhanced Service Layer Pattern
 */

import { EnhancedServiceBase } from "../base/EnhancedServiceBase";
import type { ServiceConfig } from "../base/EnhancedServiceBase";
import type { ServiceContext } from "../types";

// Temporary type definitions for build - will be replaced with proper types
interface PatientRepository {
  createPatient(data: unknown): Promise<unknown>;
  getPatient(id: string): Promise<unknown>;
  getPatientByEmail(email: string): Promise<unknown>;
  updatePatient(id: string, data: unknown): Promise<unknown>;
  getPatients(filters?: unknown): Promise<any[]>;
  updateMedicalHistory(patientId: string, history: unknown): Promise<void>;
  getPatientStats(): Promise<unknown>;
  addConsentForm(patientId: string, form: unknown): Promise<void>;
  getConsentForms(patientId: string): Promise<any[]>;
  searchPatients(query: string): Promise<any[]>;
}

interface PatientFilters {}
interface Patient {
  id: string;
  email: string;
  dateOfBirth: Date;
}
interface CreatePatientData {
  email: string;
  dateOfBirth: Date;
}
interface UpdatePatientData {
  email?: string;
  [key: string]: unknown;
}
interface MedicalHistory {}
interface AestheticHistory {}
interface SkinAssessment {}
interface ConsentForm {
  treatmentType: string;
  isActive: boolean;
  signedDate?: Date;
}
interface PatientStats {
  total: number;
  active: number;
  newThisMonth: number;
  averageAge: number;
}
enum PatientStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

// Simple date difference function
function differenceInYears(end: Date, start: Date): number {
  return end.getFullYear() - start.getFullYear();
}

/**
 * Enhanced Patient Service with enterprise features
 */
export class EnhancedPatientService extends EnhancedServiceBase {
  private readonly repository: PatientRepository;

  constructor(repository: PatientRepository) {
    const config: ServiceConfig = {
      serviceName: "patient-service",
      version: "2.0.0",
      enableCache: true,
      enableAnalytics: true,
      enableSecurity: true,
      cacheOptions: {
        defaultTTL: 900_000, // 15 minutes for patient data
        maxItems: 1000,
      },
      securityOptions: {
        enableEncryption: true,
        enableAuditLogging: true,
        enableAccessControl: true,
        auditRetentionDays: 2555, // 7 years for medical records
      },
    };

    super(config);
    this.repository = repository;
  }

  getServiceName(): string {
    return "enhanced-patient-service";
  }

  getServiceVersion(): string {
    return "2.0.0";
  }

  /**
   * Create patient with enhanced security and audit
   */
  async createPatient(
    data: CreatePatientData,
    context: ServiceContext,
  ): Promise<Patient> {
    return this.executeOperation(
      "createPatient",
      async () => {
        // Check if patient already exists
        const existingPatient = await this.repository.getPatientByEmail(
          data.email,
        );
        if (existingPatient) {
          throw new Error("Patient with this email already exists");
        }

        // Validate age (must be 18+ for aesthetic treatments)
        const age = differenceInYears(new Date(), data.dateOfBirth);
        if (age < 18) {
          throw new Error(
            "Patient must be 18 years or older for aesthetic treatments",
          );
        }

        const patient = await this.repository.createPatient(data);
        return patient;
      },
      context,
      {
        requiresAuth: true,
        sensitiveData: true,
        cacheTTL: 300_000, // 5 minutes for new patient
      },
    );
  }

  /**
   * Get patient with caching and audit
   */
  async getPatient(
    id: string,
    context: ServiceContext,
  ): Promise<Patient | null> {
    return this.executeOperation(
      "getPatient",
      async () => {
        return this.repository.getPatient(id);
      },
      context,
      {
        cacheKey: `patient_${id}`,
        cacheTTL: 900_000, // 15 minutes
        requiresAuth: true,
        sensitiveData: true,
      },
    );
  }

  /**
   * Update patient with validation and audit
   */
  async updatePatient(
    id: string,
    data: UpdatePatientData,
    context: ServiceContext,
  ): Promise<Patient> {
    return this.executeOperation(
      "updatePatient",
      async () => {
        const existingPatient = await this.repository.getPatient(id);
        if (!existingPatient) {
          throw new Error("Patient not found");
        }

        // If email is being updated, check for duplicates
        if (data.email && data.email !== existingPatient.email) {
          const emailExists = await this.repository.getPatientByEmail(
            data.email,
          );
          if (emailExists && emailExists.id !== id) {
            throw new Error("Another patient with this email already exists");
          }
        }

        const patient = await this.repository.updatePatient(id, data);

        // Invalidate cache after update
        await this.cache.invalidate(`patient_${id}`);

        return patient;
      },
      context,
      {
        requiresAuth: true,
        sensitiveData: true,
      },
    );
  }

  /**
   * Get patients with filtering and caching
   */
  async getPatients(
    filters: PatientFilters | undefined,
    context: ServiceContext,
  ): Promise<Patient[]> {
    const cacheKey = filters
      ? `patients_filtered_${JSON.stringify(filters)}`
      : "patients_all";

    return this.executeOperation(
      "getPatients",
      async () => {
        return this.repository.getPatients(filters);
      },
      context,
      {
        cacheKey,
        cacheTTL: 300_000, // 5 minutes for lists
        requiresAuth: true,
      },
    );
  }

  /**
   * Update medical history with LGPD compliance
   */
  async updateMedicalHistory(
    patientId: string,
    history: MedicalHistory,
    context: ServiceContext,
    patientConsent = true,
  ): Promise<void> {
    return this.executeOperation(
      "updateMedicalHistory",
      async () => {
        const patient = await this.repository.getPatient(patientId);
        if (!patient) {
          throw new Error("Patient not found");
        }

        await this.repository.updateMedicalHistory(patientId, history);

        // Cache medical history with LGPD compliance
        await this.cacheHealthcareData(
          `medical_history_${patientId}`,
          history,
          patientConsent,
          1_800_000, // 30 minutes
        );
      },
      context,
      {
        requiresAuth: true,
        sensitiveData: true,
      },
    );
  }

  /**
   * Search patients with enhanced performance
   */
  async searchPatients(
    query: string,
    context: ServiceContext,
  ): Promise<Patient[]> {
    return this.executeOperation(
      "searchPatients",
      async () => {
        return this.repository.searchPatients(query);
      },
      context,
      {
        cacheKey: `search_patients_${Buffer.from(query).toString("base64")}`,
        cacheTTL: 600_000, // 10 minutes
        requiresAuth: true,
      },
    );
  }

  /**
   * Get patient statistics with caching
   */
  async getPatientStats(context: ServiceContext): Promise<PatientStats> {
    return this.executeOperation(
      "getPatientStats",
      async () => {
        return this.repository.getPatientStats();
      },
      context,
      {
        cacheKey: "patient_stats",
        cacheTTL: 1_800_000, // 30 minutes
        requiresAuth: true,
      },
    );
  }

  /**
   * Consent form management with audit
   */
  async addConsentForm(
    patientId: string,
    form: ConsentForm,
    context: ServiceContext,
  ): Promise<void> {
    return this.executeOperation(
      "addConsentForm",
      async () => {
        const patient = await this.repository.getPatient(patientId);
        if (!patient) {
          throw new Error("Patient not found");
        }

        await this.repository.addConsentForm(patientId, form);

        // Invalidate consent cache
        await this.cache.invalidate(`consent_forms_${patientId}`);
      },
      context,
      {
        requiresAuth: true,
        sensitiveData: true,
      },
    );
  }

  /**
   * Validate consent with caching
   */
  async hasValidConsent(
    patientId: string,
    treatmentType: string,
    context: ServiceContext,
  ): Promise<boolean> {
    return this.executeOperation(
      "hasValidConsent",
      async () => {
        const consentForms = await this.repository.getConsentForms(patientId);
        return consentForms.some(
          (form) =>
            form.treatmentType === treatmentType
            && form.isActive
            && form.signedDate,
        );
      },
      context,
      {
        cacheKey: `consent_${patientId}_${treatmentType}`,
        cacheTTL: 600_000, // 10 minutes
        requiresAuth: true,
        sensitiveData: true,
      },
    );
  }

  /**
   * Patient age calculation with caching
   */
  async getPatientAge(
    patientId: string,
    context: ServiceContext,
  ): Promise<number | null> {
    return this.executeOperation(
      "getPatientAge",
      async () => {
        const patient = await this.repository.getPatient(patientId);
        if (!patient) {
          return;
        }

        return differenceInYears(new Date(), patient.dateOfBirth);
      },
      context,
      {
        cacheKey: `patient_age_${patientId}`,
        cacheTTL: 86_400_000, // 24 hours (age doesn't change often)
        requiresAuth: true,
        sensitiveData: true,
      },
    );
  }

  /**
   * Enhanced service health with patient-specific metrics
   */
  async getServiceHealth(): Promise<unknown> {
    const baseHealth = await super.getHealthMetrics();

    // Add patient-specific metrics
    const patientStats = await this.repository.getPatientStats();

    return {
      ...baseHealth,
      patientMetrics: {
        totalPatients: patientStats.total,
        activePatients: patientStats.active,
        newPatientsLastMonth: patientStats.newThisMonth,
        averageAge: patientStats.averageAge,
      },
      dependencies: [
        {
          name: "patient-repository",
          status: "UP", // TODO: Implement real health check
          responseTime: 0,
        },
      ],
    };
  }
}
