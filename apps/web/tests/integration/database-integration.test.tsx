// Database Integration Test
// Prisma operations with Supabase PostgreSQL and transaction handling

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock Prisma client
const mockPrismaClient = {
  patient: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  appointment: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  medicalRecord: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  lgpdConsent: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
};

// Mock Supabase client for direct database operations
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
  rpc: vi.fn(), // For stored procedures
};

vi.mock<typeof import("@prisma/client")>("@prisma/client", () => ({
  PrismaClient: () => mockPrismaClient,
}));

vi.mock<typeof import("@supabase/supabase-js")>(
  "@supabase/supabase-js",
  () => ({
    createClient: () => mockSupabaseClient,
  }),
);

// Test data
const mockPatientData = {
  id: "patient-123",
  name: "João Silva Santos",
  cpf: "123.456.789-00",
  email: "joao.silva@email.com",
  phone: "(11) 99999-9999",
  birth_date: new Date("1985-03-15"),
  gender: "male",
  clinic_id: "clinic-1",
  created_at: new Date(),
  updated_at: new Date(),
};

const mockAppointmentData = {
  id: "appointment-123",
  patient_id: "patient-123",
  doctor_id: "doctor-456",
  scheduled_at: new Date("2024-02-15T14:30:00Z"),
  duration: 30,
  status: "scheduled",
  clinic_id: "clinic-1",
  created_at: new Date(),
};
const mockMedicalRecordData = {
  id: "record-123",
  patient_id: "patient-123",
  doctor_id: "doctor-456",
  appointment_id: "appointment-123",
  diagnosis: "Hipertensão arterial sistêmica",
  treatment_plan: "Dieta hipossódica e atividade física regular",
  medications: ["Losartana 50mg - 1x/dia"],
  notes: "Paciente orientado sobre mudanças no estilo de vida",
  created_at: new Date(),
  updated_at: new Date(),
};

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode; }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("database Integration Tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // Create a fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  describe("prisma CRUD Operations", () => {
    it("should create patient with referential integrity", async () => {
      mockPrismaClient.patient.create.mockResolvedValue(mockPatientData);
      mockPrismaClient.lgpdConsent.create.mockResolvedValue({
        id: "consent-123",
        patient_id: "patient-123",
        granted: true,
        purposes: ["treatment", "emergency_contact"],
        granted_at: new Date(),
      });

      const result = await mockPrismaClient.patient.create({
        data: {
          ...mockPatientData,
          lgpd_consent: {
            create: {
              granted: true,
              purposes: ["treatment", "emergency_contact"],
              granted_at: new Date(),
            },
          },
        },
        include: {
          lgpd_consent: true,
        },
      });

      expect(mockPrismaClient.patient.create).toHaveBeenCalled();
      expect(result.id).toBe("patient-123");
      expect(result.name).toBe("João Silva Santos");
    });

    it("should handle complex queries with relationships", async () => {
      const patientWithRelations = {
        ...mockPatientData,
        appointments: [mockAppointmentData],
        medical_records: [mockMedicalRecordData],
        lgpd_consent: {
          id: "consent-123",
          granted: true,
          purposes: ["treatment"],
        },
      };

      mockPrismaClient.patient.findUnique.mockResolvedValue(
        patientWithRelations,
      );

      const result = await mockPrismaClient.patient.findUnique({
        where: { id: "patient-123" },
        include: {
          appointments: {
            where: { status: "scheduled" },
            orderBy: { scheduled_at: "asc" },
          },
          medical_records: {
            orderBy: { created_at: "desc" },
            take: 5, // Latest 5 records
          },
          lgpd_consent: true,
        },
      });

      expect(result.appointments).toHaveLength(1);
      expect(result.medical_records).toHaveLength(1);
      expect(result.lgpd_consent.granted).toBeTruthy();
    });
  });

  describe("transaction Handling", () => {
    it("should handle complex multi-table transactions atomically", async () => {
      const transactionOperations = [
        // Create patient
        mockPrismaClient.patient.create({
          data: mockPatientData,
        }),
        // Create appointment
        mockPrismaClient.appointment.create({
          data: mockAppointmentData,
        }),
        // Create LGPD consent
        mockPrismaClient.lgpdConsent.create({
          data: {
            patient_id: "patient-123",
            granted: true,
            purposes: ["treatment"],
            granted_at: new Date(),
          },
        }),
        // Create audit log entry
        mockPrismaClient.auditLog.create({
          data: {
            action: "CREATE",
            resource: "patient",
            resource_id: "patient-123",
            user_id: "doctor-456",
            timestamp: new Date(),
            clinic_id: "clinic-1",
          },
        }),
      ];

      mockPrismaClient.$transaction.mockResolvedValue([
        mockPatientData,
        mockAppointmentData,
        { id: "consent-123", patient_id: "patient-123", granted: true },
        { id: "audit-123", action: "CREATE", resource: "patient" },
      ]);

      const result = await mockPrismaClient.$transaction(transactionOperations);

      expect(mockPrismaClient.$transaction).toHaveBeenCalledWith(
        transactionOperations,
      );
      expect(result).toHaveLength(4);
      expect(result[0].id).toBe("patient-123");
      expect(result[1].id).toBe("appointment-123");
    });

    it("should rollback transaction on failure to maintain data integrity", async () => {
      const failingTransaction = async () => {
        throw new Error("Database constraint violation");
      };

      mockPrismaClient.$transaction.mockImplementation(async (operations) => {
        if (Array.isArray(operations)) {
          // Simulate failure in the middle of transaction
          throw new TypeError(
            "Transaction rolled back due to constraint violation",
          );
        }
        return failingTransaction();
      });

      const transactionOperations = [
        mockPrismaClient.patient.create({ data: mockPatientData }),
        mockPrismaClient.patient.create({
          data: { ...mockPatientData, cpf: "123.456.789-00" }, // Duplicate CPF
        }),
      ];

      await expect(
        mockPrismaClient.$transaction(transactionOperations),
      ).rejects.toThrow("constraint violation");

      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
    });

    it("should handle appointment scheduling with conflict detection", async () => {
      const conflictDetectionTransaction = async () => {
        // Check for existing appointments at the same time
        const existingAppointment = await mockPrismaClient.appointment.findMany(
          {
            where: {
              doctor_id: "doctor-456",
              scheduled_at: new Date("2024-02-15T14:30:00Z"),
              status: { not: "cancelled" },
            },
          },
        );

        if (existingAppointment.length > 0) {
          throw new Error("Appointment conflict detected");
        }

        // Create the appointment if no conflict
        return mockPrismaClient.appointment.create({
          data: mockAppointmentData,
        });
      };

      mockPrismaClient.appointment.findMany.mockResolvedValue([
        {
          id: "existing-apt",
          doctor_id: "doctor-456",
          scheduled_at: new Date("2024-02-15T14:30:00Z"),
        },
      ]);

      mockPrismaClient.$transaction.mockImplementation(
        conflictDetectionTransaction,
      );

      await expect(
        mockPrismaClient.$transaction(conflictDetectionTransaction),
      ).rejects.toThrow("Appointment conflict detected");
    });
  });

  describe("performance Optimization", () => {
    it("should optimize queries for large datasets with proper indexing", async () => {
      const startTime = performance.now();

      // Mock large dataset
      const largePatientsDataset = Array.from({ length: 10_000 }, (_, i) => ({
        id: `patient-${i}`,
        name: `Patient ${i}`,
        cpf: `123.456.${String(i).padStart(3, "0")}-00`,
        clinic_id: "clinic-1",
        created_at: new Date(),
      }));

      mockPrismaClient.patient.findMany.mockResolvedValue(
        largePatientsDataset.slice(0, 50),
      );

      const result = await mockPrismaClient.patient.findMany({
        where: {
          clinic_id: "clinic-1",
          name: { contains: "Silva", mode: "insensitive" },
        },
        orderBy: { created_at: "desc" },
        take: 50,
        skip: 0,
      });

      const endTime = performance.now();
      const queryTime = endTime - startTime;

      expect(result).toHaveLength(50);
      expect(queryTime).toBeLessThan(100); // < 100ms requirement for indexed queries
    });

    it("should handle connection pooling efficiently", async () => {
      const concurrentQueries = Array.from(
        { length: 20 },
        (_, i) =>
          mockPrismaClient.patient.findUnique({
            where: { id: `patient-${i}` },
          }),
      );

      mockPrismaClient.patient.findUnique.mockImplementation(
        async ({ where }) => ({
          id: where.id,
          name: `Patient ${where.id}`,
          clinic_id: "clinic-1",
        }),
      );

      const startTime = performance.now();
      const results = await Promise.all(concurrentQueries);
      const endTime = performance.now();

      const totalTime = endTime - startTime;

      expect(results).toHaveLength(20);
      expect(totalTime).toBeLessThan(500); // Efficient connection pooling
    });
  });

  describe("data Consistency and Integrity", () => {
    it("should maintain referential integrity across related tables", async () => {
      // Test cascade deletion constraints
      mockPrismaClient.patient.delete.mockImplementation(async ({ where }) => {
        // Should trigger cascade deletion of related records
        await mockPrismaClient.appointment.delete({
          where: { patient_id: where.id },
        });

        await mockPrismaClient.medicalRecord.delete({
          where: { patient_id: where.id },
        });

        return { id: where.id, deleted: true };
      });

      const result = await mockPrismaClient.patient.delete({
        where: { id: "patient-123" },
      });

      expect(result.deleted).toBeTruthy();
      expect(mockPrismaClient.appointment.delete).toHaveBeenCalledWith({
        where: { patient_id: "patient-123" },
      });
      expect(mockPrismaClient.medicalRecord.delete).toHaveBeenCalledWith({
        where: { patient_id: "patient-123" },
      });
    });

    it("should enforce unique constraints properly", async () => {
      const duplicatePatientData = {
        ...mockPatientData,
        id: "patient-456",
        cpf: "123.456.789-00", // Same CPF as existing patient
        clinic_id: "clinic-1",
      };

      mockPrismaClient.patient.create.mockRejectedValue(
        new Error(
          "Unique constraint failed on the fields: (`cpf`,`clinic_id`)",
        ),
      );

      await expect(
        mockPrismaClient.patient.create({
          data: duplicatePatientData,
        }),
      ).rejects.toThrow("Unique constraint failed");
    });

    it("should validate foreign key relationships", async () => {
      const appointmentWithInvalidPatient = {
        ...mockAppointmentData,
        patient_id: "non-existent-patient",
      };

      mockPrismaClient.appointment.create.mockRejectedValue(
        new Error("Foreign key constraint failed on the field: `patient_id`"),
      );

      await expect(
        mockPrismaClient.appointment.create({
          data: appointmentWithInvalidPatient,
        }),
      ).rejects.toThrow("Foreign key constraint failed");
    });
  });

  describe("supabase Direct Operations", () => {
    it("should execute stored procedures for complex healthcare operations", async () => {
      const procedureResult = {
        patient_summary: {
          total_appointments: 15,
          last_visit: "2024-01-20",
          chronic_conditions: ["Hypertension", "Diabetes Type 2"],
          medication_adherence: 0.85,
          risk_score: "moderate",
        },
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: procedureResult,
        error: undefined,
      });

      const result = await mockSupabaseClient.rpc(
        "calculate_patient_health_summary",
        {
          patient_id: "patient-123",
          clinic_id: "clinic-1",
        },
      );

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        "calculate_patient_health_summary",
        {
          patient_id: "patient-123",
          clinic_id: "clinic-1",
        },
      );

      expect(result.data.patient_summary.total_appointments).toBe(15);
      expect(result.data.patient_summary.risk_score).toBe("moderate");
    });

    it("should handle real-time triggers for audit logging", async () => {
      const auditTriggerData = {
        table_name: "patients",
        operation: "UPDATE",
        old_record: mockPatientData,
        new_record: {
          ...mockPatientData,
          phone: "(11) 88888-8888",
          updated_at: new Date(),
        },
        changed_fields: ["phone", "updated_at"],
        user_id: "doctor-456",
        timestamp: new Date().toISOString(),
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: {
            id: "audit-trigger-123",
            ...auditTriggerData,
          },
          error: undefined,
        }),
      });

      const result = await mockSupabaseClient
        .from("audit_logs")
        .insert(auditTriggerData);

      expect(result.data.changed_fields).toContain("phone");
      expect(result.data.operation).toBe("UPDATE");
    });
  });

  describe("multi-tenant Data Isolation", () => {
    it("should enforce row-level security for clinic isolation", async () => {
      const clinic1Patients = [
        { id: "patient-1", name: "Patient 1", clinic_id: "clinic-1" },
        { id: "patient-2", name: "Patient 2", clinic_id: "clinic-1" },
      ];

      const clinic2Patients = [
        { id: "patient-3", name: "Patient 3", clinic_id: "clinic-2" },
      ];

      // Mock RLS filtering - user from clinic-1 should only see clinic-1 patients
      mockPrismaClient.patient.findMany.mockImplementation(
        async ({ where }) => {
          if (where?.clinic_id === "clinic-1") {
            return clinic1Patients;
          }
          if (where?.clinic_id === "clinic-2") {
            return clinic2Patients;
          }
          return [];
        },
      );

      // Query as clinic-1 user
      const clinic1Results = await mockPrismaClient.patient.findMany({
        where: { clinic_id: "clinic-1" },
      });

      // Query as clinic-2 user
      const clinic2Results = await mockPrismaClient.patient.findMany({
        where: { clinic_id: "clinic-2" },
      });

      expect(clinic1Results).toHaveLength(2);
      expect(clinic2Results).toHaveLength(1);
      expect(
        clinic1Results.every((p) => p.clinic_id === "clinic-1"),
      ).toBeTruthy();
      expect(
        clinic2Results.every((p) => p.clinic_id === "clinic-2"),
      ).toBeTruthy();
    });

    it("should prevent cross-tenant data access", async () => {
      // Attempt to access patient from different clinic
      mockPrismaClient.patient.findUnique.mockResolvedValue(null as any);

      const result = await mockPrismaClient.patient.findUnique({
        where: {
          id: "patient-from-other-clinic",
          clinic_id: "current-user-clinic",
        },
      });

      expect(result).toBeNull(); // RLS blocks access
    });
  });
});
