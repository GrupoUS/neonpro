import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SupabaseClient } from "@supabase/supabase-js";
import { RepositoryContainer } from "../../containers/repository-container.js";
import { PatientService } from "../../application/patient-service.js";
import { 
  PatientError,
  PatientValidationError 
} from "@neonpro/domain";
import { 
  CreatePatientRequest, 
  UpdatePatientRequest,
  PatientFilters
} from "@neonpro/types";

// Mock Supabase client for testing
const createMockSupabaseClient = () => {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        }),
        gte: () => ({
          lte: () => ({
            order: () => Promise.resolve({ data: [], error: null, count: 0 })
          })
        }),
        order: () => Promise.resolve({ data: [], error: null, count: 0 })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ 
            data: { 
              id: "test-patient-id",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, 
            error: null 
          })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ 
              data: { 
                id: "test-patient-id",
                updated_at: new Date().toISOString()
              }, 
              error: null 
            })
          })
        })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null })
      })
    })
  } as unknown as SupabaseClient;
};

describe("Repository Pattern Integration Tests", () => {
  let container: RepositoryContainer;
  let mockSupabase: SupabaseClient;
  let patientService: PatientService;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient(
    container = RepositoryContainer.initialize(mockSupabase
    patientService = new PatientService(container.getPatientRepository()
  }

  afterEach(() => {
    container.reset(
  }

  describe("RepositoryContainer", () => {
    it("should initialize with Supabase client", () => {
      expect(container).toBeInstanceOf(RepositoryContainer
    }

    it("should provide singleton instance", () => {
      const instance1 = RepositoryContainer.getInstance(
      const instance2 = RepositoryContainer.getInstance(
      expect(instance1).toBe(instance2
    }

    it("should provide all repositories", () => {
      const repositories = container.getRepositories(
      expect(repositories).toHaveProperty("patient"
      expect(repositories).toHaveProperty("consent"
      expect(repositories).toHaveProperty("appointment"
    }

    it("should provide all services", () => {
      const services = container.getServices(
      expect(services).toHaveProperty("audit"
      expect(services).toHaveProperty("consent"
    }

    it("should reset all instances", () => {
      const repo1 = container.getPatientRepository(
      container.reset(
      const repo2 = container.getPatientRepository(
      expect(repo1).not.toBe(repo2
    }
  }

  describe("PatientService with Repository Pattern", () => {
    it(_"should create patient with validation",_async () => {
      const _request: CreatePatientRequest = {
        clinicId: "test-clinic-id",
        medicalRecordNumber: "MRN-001",
        givenNames: ["John"],
        familyName: "Doe",
        fullName: "John Doe",
        createdBy: "test-user",
        lgpdConsentGiven: true
      };

      const patient = await patientService.createPatient(_request
      expect(patient).toBeDefined(
      expect(patient.id).toBe("test-patient-id"
    }

    it(_"should validate required fields for patient creation",_async () => {
      const invalidRequest: CreatePatientRequest = {
        clinicId: "",
        medicalRecordNumber: "",
        givenNames: [],
        familyName: "",
        fullName: "",
        createdBy: "test-user",
        lgpdConsentGiven: true
      };

      await expect(patientService.createPatient(invalidRequest))
        .rejects.toThrow(PatientValidationError
    }

    it(_"should validate CPF format",_async () => {
      const _request: CreatePatientRequest = {
        clinicId: "test-clinic-id",
        medicalRecordNumber: "MRN-002",
        givenNames: ["Jane"],
        familyName: "Doe",
        fullName: "Jane Doe",
        cpf: "123.456.789-00", // Invalid CPF
        createdBy: "test-user",
        lgpdConsentGiven: true
      };

      await expect(patientService.createPatient(_request))
        .rejects.toThrow("Invalid CPF format"
    }

    it(_"should validate Brazilian phone format",_async () => {
      const _request: CreatePatientRequest = {
        clinicId: "test-clinic-id",
        medicalRecordNumber: "MRN-003",
        givenNames: "Bob".split(" "),
        familyName: "Smith",
        fullName: "Bob Smith",
        phonePrimary: "123", // Invalid phone
        createdBy: "test-user",
        lgpdConsentGiven: true
      };

      await expect(patientService.createPatient(_request))
        .rejects.toThrow("Invalid primary phone number format"
    }

    it(_"should validate email format",_async () => {
      const _request: CreatePatientRequest = {
        clinicId: "test-clinic-id",
        medicalRecordNumber: "MRN-004",
        givenNames: "Alice".split(" "),
        familyName: "Johnson",
        fullName: "Alice Johnson",
        email: "invalid-email", // Invalid email
        createdBy: "test-user",
        lgpdConsentGiven: true
      };

      await expect(patientService.createPatient(_request))
        .rejects.toThrow("Invalid email format"
    }

    it(_"should update patient with validation",_async () => {
      const updateRequest: UpdatePatientRequest = {
        familyName: "Smith-Johnson",
        email: "alice.smith@example.com"
      };

      const patient = await patientService.updatePatient("test-patient-id", updateRequest
      expect(patient).toBeDefined(
    }

    it(_"should get patients by clinic",_async () => {
<<<<<<< HEAD
      const result = await patientService.getPatientsByClinic("test-clinic-id"
      expect(result).toHaveProperty("patients"
      expect(result).toHaveProperty("total"
=======
      const result = await patientService.getPatientsByClinic("test-clinic-id");
      expect(result).toHaveProperty("patients");
      expect(result).toHaveProperty("total");
>>>>>>> origin/main
      expect(Array.isArray(result.patients)).toBe(true);
      expect(typeof result.total).toBe("number"
    }

    it(_"should search patients",_async () => {
<<<<<<< HEAD
      const result = await patientService.searchPatients("John", "test-clinic-id"
      expect(result).toHaveProperty("patients"
      expect(result).toHaveProperty("total"
      expect(Array.isArray(result.patients)).toBe(true);
    }

    it(_"should count patients",_async () => {
      const filter: PatientFilters = { clinicId: "test-clinic-id" };
      const count = await patientService.countPatients(filter
      expect(typeof count).toBe("number"
      expect(count).toBeGreaterThanOrEqual(0
    }
  }
=======
      const result = await patientService.searchPatients("John", "test-clinic-id");
      expect(result).toHaveProperty("patients");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.patents)).toBe(true);
    });

    it(_"should count patients",_async () => {
      const filter: PatientFilter = { clinicId: "test-clinic-id" };
      const count = await patientService.countPatients(filter);
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
>>>>>>> origin/main

  describe("Error Handling", () => {
    it(_"should handle database errors gracefully",_async () => {
      // Mock a database error
      const errorSupabase = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: null, 
                error: { message: "Database connection failed" } 
              })
            })
          })
        })
      } as unknown as SupabaseClient;

      const errorContainer = RepositoryContainer.initialize(errorSupabase
      const errorService = new PatientService(errorContainer.getPatientRepository()

      await expect(errorService.getPatient("non-existent-id"))
        .rejects.toThrow(PatientError
    }

    it(_"should validate birth date",_async () => {
<<<<<<< HEAD
      const futureDate = new Date(
      futureDate.setFullYear(futureDate.getFullYear() + 1
=======
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
>>>>>>> origin/main

      const _request: CreatePatientRequest = {
        clinicId: "test-clinic-id",
        medicalRecordNumber: "MRN-005",
        givenNames: ["Future"],
        familyName: "Patient",
        fullName: "Future Patient",
        birthDate: futureDate.toISOString(),
        createdBy: "test-user",
        lgpdConsentGiven: true
      };

      await expect(patientService.createPatient(_request))
        .rejects.toThrow("Birth date cannot be in the future"
    }

    it(_"should handle missing patient for update",_async () => {
      const updateRequest: UpdatePatientRequest = {
        familyName: "Updated"
      };

      await expect(patientService.updatePatient("non-existent-id", updateRequest))
        .rejects.toThrow("Patient not found"
    }

    it(_"should handle missing patient for deletion",_async () => {
      await expect(patientService.deletePatient("non-existent-id"))
        .rejects.toThrow("Patient not found"
    }
  }

  describe("Repository Pattern Benefits", () => {
    it("should provide clean separation of concerns", () => {
      const repository = container.getPatientRepository(
      expect(repository).toHaveProperty("findById"
      expect(repository).toHaveProperty("create"
      expect(repository).toHaveProperty("update"
      expect(repository).toHaveProperty("delete"
    }

    it("should enable easy testing with dependency injection", () => {
      // The fact that we can inject a mock Supabase client
      // demonstrates the benefit of dependency injection
      expect(container).toBeDefined(
      expect(patientService).toBeDefined(
    }

    it("should provide consistent interface across repositories", () => {
      const patientRepo = container.getPatientRepository(
      const consentRepo = container.getConsentRepository(
      const appointmentRepo = container.getAppointmentRepository(

      // All repositories should have similar basic CRUD operations
      expect(typeof patientRepo.findById).toBe("function"
      expect(typeof consentRepo.findById).toBe("function"
      expect(typeof appointmentRepo.findById).toBe("function"

      expect(typeof patientRepo.create).toBe("function"
      expect(typeof consentRepo.create).toBe("function"
      expect(typeof appointmentRepo.create).toBe("function"
    }
  }
}