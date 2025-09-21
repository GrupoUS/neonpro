import { SupabaseClient } from "@supabase/supabase-js";
import { PatientRepository } from "../repositories/patient-repository.js";
import { ConsentRepository } from "../repositories/consent-repository.js";
import { AppointmentRepository } from "../repositories/appointment-repository.js";
import { AuditService } from "../services/audit-service.js";
import { ConsentService } from "../services/consent-service.js";
import {
  PatientRepository as IPatientRepository,
  ConsentRepository as IConsentRepository,
  AppointmentRepository as IAppointmentRepository,
  ConsentDomainService,
  AuditDomainService,
  MedicalLicenseDomainService
} from "@neonpro/domain";

/**
 * Dependency injection container for repositories and services
 * Provides centralized management of database-related dependencies
 */
export class RepositoryContainer {
  private static instance: RepositoryContainer;
  private supabase: SupabaseClient;

  // Repository instances
  private patientRepository: IPatientRepository | null = null;
  private consentRepository: IConsentRepository | null = null;
  private appointmentRepository: IAppointmentRepository | null = null;

  // Service instances
  private auditService: AuditDomainService | null = null;
  private consentService: ConsentDomainService | null = null;
  private medicalLicenseService: MedicalLicenseDomainService | null = null;

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Initialize the container with Supabase client
   */
  static initialize(supabase: SupabaseClient): RepositoryContainer {
    if (!RepositoryContainer.instance) {
      RepositoryContainer.instance = new RepositoryContainer(supabase);
    }
    return RepositoryContainer.instance;
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): RepositoryContainer {
    if (!RepositoryContainer.instance) {
      throw new Error("RepositoryContainer not initialized. Call initialize() first.");
    }
    return RepositoryContainer.instance;
  }

  /**
   * Get PatientRepository instance
   */
  getPatientRepository(): IPatientRepository {
    if (!this.patientRepository) {
      this.patientRepository = new PatientRepository(this.supabase);
    }
    return this.patientRepository;
  }

  /**
   * Get ConsentRepository instance
   */
  getConsentRepository(): IConsentRepository {
    if (!this.consentRepository) {
      this.consentRepository = new ConsentRepository(this.supabase);
    }
    return this.consentRepository;
  }

  /**
   * Get AppointmentRepository instance
   */
  getAppointmentRepository(): IAppointmentRepository {
    if (!this.appointmentRepository) {
      this.appointmentRepository = new AppointmentRepository(this.supabase);
    }
    return this.appointmentRepository;
  }

  /**
   * Get AuditService instance
   */
  getAuditService(): AuditDomainService {
    if (!this.auditService) {
      const auditInfrastructureService = new AuditService(this.supabase);
      this.auditService = auditInfrastructureService as unknown as AuditDomainService;
    }
    return this.auditService;
  }

  /**
   * Get ConsentService instance
   */
  getConsentService(): ConsentDomainService {
    if (!this.consentService) {
      const consentInfrastructureService = new ConsentService();
      this.consentService = consentInfrastructureService as unknown as ConsentDomainService;
    }
    return this.consentService;
  }

  /**
   * Get MedicalLicenseService instance
   */
  getMedicalLicenseService(): MedicalLicenseDomainService {
    if (!this.medicalLicenseService) {
      // This would need to be implemented in the database layer
      throw new Error("MedicalLicenseService not implemented in database layer");
    }
    return this.medicalLicenseService;
  }

  /**
   * Reset all instances (useful for testing)
   */
  reset(): void {
    this.patientRepository = null;
    this.consentRepository = null;
    this.appointmentRepository = null;
    this.auditService = null;
    this.consentService = null;
    this.medicalLicenseService = null;
  }

  /**
   * Get all repositories as an object
   */
  getRepositories() {
    return {
      patient: this.getPatientRepository(),
      consent: this.getConsentRepository(),
      appointment: this.getAppointmentRepository()
    };
  }

  /**
   * Get all services as an object
   */
  getServices() {
    return {
      audit: this.getAuditService(),
      consent: this.getConsentService(),
      medicalLicense: this.getMedicalLicenseService()
    };
  }

  /**
   * Get all dependencies as an object
   */
  getDependencies() {
    return {
      repositories: this.getRepositories(),
      services: this.getServices()
    };
  }
}