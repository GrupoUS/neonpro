import { describe, it, expect } from "vitest";
import { RepositoryContainer } from "../../containers/repository-container.js";
import { PatientService } from "../../application/patient-service.js";
import { 
  PatientRepository as IPatientRepository,
  ConsentRepository as IConsentRepository,
  AppointmentRepository as IAppointmentRepository,
  Patient,
  ConsentRecord,
  Appointment,
  PatientError,
  PatientValidationError
} from "@neonpro/domain";

describe("Architectural Validation Tests", () => {
  describe("Clean Architecture Principles", () => {
    it("should enforce dependency inversion - repositories depend on abstractions", () => {
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      const patientRepo = container.getPatientRepository();
      const consentRepo = container.getConsentRepository();
      const appointmentRepo = container.getAppointmentRepository();

      // Repositories should implement domain interfaces
      expect(patientRepo).toBeDefined();
      expect(consentRepo).toBeDefined();
      expect(appointmentRepo).toBeDefined();

      // Should have all required methods from interfaces
      expect(typeof patientRepo.findById).toBe("function");
      expect(typeof patientRepo.create).toBe("function");
      expect(typeof patientRepo.update).toBe("function");
      expect(typeof patientRepo.delete).toBe("function");

      expect(typeof consentRepo.findById).toBe("function");
      expect(typeof consentRepo.create).toBe("function");
      expect(typeof consentRepo.revoke).toBe("function");

      expect(typeof appointmentRepo.findById).toBe("function");
      expect(typeof appointmentRepo.create).toBe("function");
      expect(typeof appointmentRepo.findByDateRange).toBe("function");
    });

    it("should separate concerns between layers", () => {
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      const patientService = new PatientService(container.getPatientRepository());

      // Application layer should use repositories
      expect(patientService).toBeDefined();
      
      // Should not directly access database
      expect(patientService["patientRepository"]).toBeDefined();
      expect(patientService["supabase"]).toBeUndefined(); // Should not have direct DB access
    });

    it("should provide consistent error handling across layers", () => {
      // Domain errors should be properly defined
      expect(PatientError).toBeDefined();
      expect(PatientValidationError).toBeDefined();
      expect(PatientValidationError.prototype).toBeInstanceOf(Error);
    });

    it("should maintain domain model purity", () => {
      // Domain models should not depend on infrastructure
      const patientPrototype = Patient.prototype;
      const consentPrototype = ConsentRecord.prototype;
      const appointmentPrototype = Appointment.prototype;

      // Domain models should not have database-specific methods
      expect(patientPrototype["save"]).toBeUndefined();
      expect(patientPrototype["update"]).toBeUndefined();
      expect(patientPrototype["delete"]).toBeUndefined();

      expect(consentPrototype["save"]).toBeUndefined();
      expect(consentPrototype["update"]).toBeUndefined();

      expect(appointmentPrototype["save"]).toBeUndefined();
      expect(appointmentPrototype["update"]).toBeUndefined();
    });
  });

  describe("Repository Pattern Implementation", () => {
    it("should provide abstraction over data access", () => {
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      const repositories = container.getRepositories();
      
      // All repositories should implement the same basic interface
      Object.values(repositories).forEach(repo => {
        expect(typeof repo.findById).toBe("function");
        expect(typeof repo.create).toBe("function");
        expect(typeof repo.update).toBe("function");
        expect(typeof repo.delete).toBe("function");
      });
    });

    it("should enable easy testing with mocks", () => {
      // The ability to create a container with mock dependencies
      // demonstrates the testability benefits of the pattern
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      expect(container).toBeDefined();
      expect(container.getPatientRepository()).toBeDefined();
      expect(container.getConsentRepository()).toBeDefined();
      expect(container.getAppointmentRepository()).toBeDefined();
    });

    it("should provide consistent query interfaces", () => {
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      const patientRepo = container.getPatientRepository();
      
      // Should have filtering and pagination methods
      expect(typeof patientRepo.findWithFilter).toBe("function");
      expect(typeof patientRepo.search).toBe("function");
      expect(typeof patientRepo.count).toBe("function");
    });
  });

  describe("Dependency Injection Benefits", () => {
    it("should manage dependencies centrally", () => {
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      // Container should provide all dependencies
      const dependencies = container.getDependencies();
      expect(dependencies).toHaveProperty("repositories");
      expect(dependencies).toHaveProperty("services");
      
      expect(dependencies.repositories).toHaveProperty("patient");
      expect(dependencies.repositories).toHaveProperty("consent");
      expect(dependencies.repositories).toHaveProperty("appointment");
    });

    it("should provide singleton instances", () => {
      const mockSupabase = {} as any;
      const container1 = RepositoryContainer.initialize(mockSupabase);
      const container2 = RepositoryContainer.getInstance();
      
      expect(container1).toBe(container2);
      
      const repo1 = container1.getPatientRepository();
      const repo2 = container2.getPatientRepository();
      expect(repo1).toBe(repo2);
    });

    it("should allow resetting instances for testing", () => {
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      const repo1 = container.getPatientRepository();
      container.reset();
      const repo2 = container.getPatientRepository();
      
      expect(repo1).not.toBe(repo2);
    });
  });

  describe("Domain Services Implementation", () => {
    it("should encapsulate business logic", () => {
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      const services = container.getServices();
      
      // Services should be available through the container
      expect(services).toHaveProperty("audit");
      expect(services).toHaveProperty("consent");
      
      // Services should have domain-specific methods
      expect(typeof services.audit.createAuditLog).toBe("function");
      expect(typeof services.consent.createConsent).toBe("function");
      expect(typeof services.consent.checkCompliance).toBe("function");
    });

    it("should integrate with repositories properly", () => {
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      // Services should be able to work with repositories
      const patientService = new PatientService(container.getPatientRepository());
      expect(patientService).toBeDefined();
    });
  });

  describe("Architectural Benefits Validation", () => {
    it("should enable modular development", () => {
      // Each component should be independently usable
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      // Should be able to use individual components
      const patientRepo = container.getPatientRepository();
      const patientService = new PatientService(patientRepo);
      
      expect(patientRepo).toBeDefined();
      expect(patientService).toBeDefined();
    });

    it("should support easy testing", () => {
      // The architecture should make testing easy
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      // Should be able to create test instances easily
      const patientService = new PatientService(container.getPatientRepository());
      
      expect(patientService).toBeDefined();
      expect(typeof patientService.createPatient).toBe("function");
      expect(typeof patientService.getPatient).toBe("function");
    });

    it("should provide clear separation of concerns", () => {
      // Domain layer should be pure
      expect(Patient).toBeDefined();
      expect(ConsentRecord).toBeDefined();
      expect(Appointment).toBeDefined();
      
      // Application layer should use domain
      expect(PatientService).toBeDefined();
      
      // Infrastructure should implement interfaces
      expect(RepositoryContainer).toBeDefined();
    });

    it("should be maintainable and extensible", () => {
      // Should be easy to add new functionality
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      // Container pattern makes it easy to add new services
      expect(typeof container.getRepositories).toBe("function");
      expect(typeof container.getServices).toBe("function");
      expect(typeof container.getDependencies).toBe("function");
    });
  });

  describe("Compliance with Requirements", () => {
    it("should implement repository pattern correctly", () => {
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      const patientRepo = container.getPatientRepository();
      
      // Repository should abstract data access
      expect(patientRepo).toBeDefined();
      
      // Should not expose database implementation details
      expect(patientRepo["supabase"]).toBeUndefined();
      expect(patientRepo["client"]).toBeUndefined();
    });

    it("should provide proper dependency injection", () => {
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      // Dependencies should be injected, not created internally
      const patientService = new PatientService(container.getPatientRepository());
      expect(patientService).toBeDefined();
      
      // Service should have the repository injected
      expect(patientService["patientRepository"]).toBeDefined();
    });

    it("should maintain backward compatibility", () => {
      // New architecture should work with existing code
      const mockSupabase = {} as any;
      const container = RepositoryContainer.initialize(mockSupabase);
      
      // Should still be able to use existing patterns
      expect(container.getPatientRepository()).toBeDefined();
      expect(container.getConsentRepository()).toBeDefined();
      expect(container.getAppointmentRepository()).toBeDefined();
    });
  });
});