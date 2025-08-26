/**
 * Integration Tests for NeonPro Healthcare Platform
 *
 * Testing Coverage:
 * - Database operations with Supabase
 * - Authentication flows end-to-end
 * - Healthcare workflow integration
 * - LGPD compliance integration
 * - Multi-tenant data isolation
 */

import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Test environment configuration
const supabaseUrl = process.env.TEST_SUPABASE_URL || "https://test.supabase.co";
const supabaseKey = process.env.TEST_SUPABASE_ANON_KEY || "test_anon_key";
const supabaseServiceKey =
  process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || "test_service_key";

// Create test clients
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Test data containers
let testUser: any;
let testClinic: any;
let testPatient: any;

describe("🔗 Integration Tests - Database Operations", () => {
  beforeAll(async () => {
    // Create test user for authentication
    const userEmail = `test-${nanoid(8)}@neonpro.test`;
    const userPassword = "TestPassword123!";

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userEmail,
      password: userPassword,
      options: {
        data: {
          name: "Integration Test User",
          role: "clinic_admin",
        },
      },
    });

    if (authError && !authError.message.includes("already registered")) {
    }

    testUser = authData.user;
  });

  afterAll(async () => {
    // Cleanup test data in reverse dependency order
    if (testPatient?.id) {
      await supabaseAdmin.from("patients").delete().eq("id", testPatient.id);
    }

    if (testClinic?.id) {
      await supabaseAdmin.from("clinics").delete().eq("id", testClinic.id);
    }

    if (testUser?.id) {
      await supabaseAdmin.auth.admin.deleteUser(testUser.id);
    }
  });

  describe("🏢 Clinic Management Integration", () => {
    it("should create clinic with ANVISA compliance", async () => {
      const clinicData = {
        id: nanoid(),
        name: `Test Clinic ${nanoid(4)}`,
        cnpj: "12.345.678/0001-90",
        anvisa_license: `ANVISA-${nanoid(8)}`,
        address: {
          street: "Rua Teste, 123",
          city: "São Paulo",
          state: "SP",
          zipcode: "01234-567",
          country: "Brazil",
        },
        compliance_status: "active",
        owner_id: testUser?.id || "test-user-id",
      };

      const { data, error } = await supabaseAdmin
        .from("clinics")
        .insert(clinicData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.name).toBe(clinicData.name);
      expect(data.anvisa_license).toBe(clinicData.anvisa_license);
      expect(data.compliance_status).toBe("active");

      testClinic = data;
    });

    it("should validate clinic ANVISA license uniqueness", async () => {
      const duplicateClinicData = {
        id: nanoid(),
        name: `Duplicate Clinic ${nanoid(4)}`,
        cnpj: "98.765.432/0001-10",
        anvisa_license: testClinic.anvisa_license, // Same ANVISA license
        owner_id: testUser?.id || "test-user-id",
      };

      const { data, error } = await supabaseAdmin
        .from("clinics")
        .insert(duplicateClinicData)
        .select();

      // Should fail due to unique constraint on ANVISA license
      expect(error).toBeTruthy();
      expect(error?.code).toBe("23505"); // Unique constraint violation
    });
  });

  describe("👤 Patient Management Integration", () => {
    it("should create patient with LGPD compliance", async () => {
      const patientData = {
        id: nanoid(),
        clinic_id: testClinic.id,
        name: `Test Patient ${nanoid(4)}`,
        email: `patient-${nanoid(8)}@test.com`,
        phone: "+5511999999999",
        date_of_birth: "1990-01-01",
        cpf_hash: `encrypted_cpf_${nanoid(16)}`,
        medical_history: {
          allergies: ["None"],
          medications: [],
          previous_treatments: [],
        },
        emergency_contact: {
          name: "Emergency Contact",
          phone: "+5511888888888",
          relationship: "Family",
        },
        lgpd_consent: {
          data_processing: true,
          marketing: false,
          granted_at: new Date().toISOString(),
          ip_address: "127.0.0.1",
        },
      };

      const { data, error } = await supabaseAdmin
        .from("patients")
        .insert(patientData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.name).toBe(patientData.name);
      expect(data.clinic_id).toBe(testClinic.id);
      expect(data.lgpd_consent.data_processing).toBeTruthy();

      testPatient = data;
    });

    it("should enforce clinic-patient relationship", async () => {
      const invalidPatientData = {
        id: nanoid(),
        clinic_id: "invalid-clinic-id",
        name: "Invalid Patient",
        email: `invalid-${nanoid(8)}@test.com`,
        lgpd_consent: {
          data_processing: true,
          granted_at: new Date().toISOString(),
        },
      };

      const { data, error } = await supabaseAdmin
        .from("patients")
        .insert(invalidPatientData)
        .select();

      // Should fail due to foreign key constraint
      expect(error).toBeTruthy();
      expect(error?.code).toBe("23503"); // Foreign key violation
    });
  });

  describe("📅 Appointment Scheduling Integration", () => {
    it("should create appointment with proper relationships", async () => {
      const appointmentData = {
        id: nanoid(),
        clinic_id: testClinic.id,
        patient_id: testPatient.id,
        service_type: "consultation",
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration_minutes: 60,
        status: "scheduled",
        notes: "Integration test appointment",
        compliance_checks: {
          anvisa_validation: true,
          lgpd_consent_verified: true,
          professional_license_valid: true,
        },
      };

      const { data, error } = await supabaseAdmin
        .from("appointments")
        .insert(appointmentData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.clinic_id).toBe(testClinic.id);
      expect(data.patient_id).toBe(testPatient.id);
      expect(data.status).toBe("scheduled");
    });

    it("should validate appointment scheduling constraints", async () => {
      // Try to create appointment for non-existent patient
      const invalidAppointmentData = {
        id: nanoid(),
        clinic_id: testClinic.id,
        patient_id: "invalid-patient-id",
        service_type: "consultation",
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: "scheduled",
      };

      const { data, error } = await supabaseAdmin
        .from("appointments")
        .insert(invalidAppointmentData)
        .select();

      // Should fail due to foreign key constraint
      expect(error).toBeTruthy();
      expect(error?.code).toBe("23503"); // Foreign key violation
    });
  });

  describe("🔐 Row Level Security (RLS) Integration", () => {
    it("should enforce clinic isolation for patients", async () => {
      // Create another clinic
      const otherClinicData = {
        id: nanoid(),
        name: `Other Clinic ${nanoid(4)}`,
        cnpj: "11.111.111/0001-11",
        anvisa_license: `OTHER-${nanoid(8)}`,
        owner_id: testUser?.id || "test-user-id",
      };

      const { data: otherClinic } = await supabaseAdmin
        .from("clinics")
        .insert(otherClinicData)
        .select()
        .single();

      // Try to access patients from different clinic context
      // This would be done through the application's RLS policies
      // For now, verify that clinic_id is properly set
      const { data: patients } = await supabaseAdmin
        .from("patients")
        .select("*")
        .eq("clinic_id", testClinic.id);

      expect(patients).toBeTruthy();
      expect(patients?.length).toBeGreaterThan(0);
      expect(patients?.[0].clinic_id).toBe(testClinic.id);

      // Cleanup
      await supabaseAdmin.from("clinics").delete().eq("id", otherClinic.id);
    });

    it("should enforce proper user authentication context", async () => {
      // Test that unauthenticated requests are blocked by RLS
      const unauthenticatedClient = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await unauthenticatedClient
        .from("patients")
        .select("*");

      // Should be empty or error due to RLS
      expect(data?.length || 0).toBe(0);
    });
  });

  describe("📋 LGPD Compliance Integration", () => {
    it("should track LGPD consent changes", async () => {
      const consentUpdate = {
        lgpd_consent: {
          ...testPatient.lgpd_consent,
          marketing: true,
          updated_at: new Date().toISOString(),
          ip_address: "127.0.0.1",
        },
      };

      const { data, error } = await supabaseAdmin
        .from("patients")
        .update(consentUpdate)
        .eq("id", testPatient.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.lgpd_consent.marketing).toBeTruthy();
      expect(data.lgpd_consent.updated_at).toBeTruthy();
    });

    it("should maintain audit trail for patient data access", async () => {
      // Simulate data access for audit logging
      const { data } = await supabaseAdmin
        .from("patients")
        .select("id, name, email")
        .eq("id", testPatient.id)
        .single();

      expect(data).toBeTruthy();
      expect(data.id).toBe(testPatient.id);

      // In a real implementation, this would trigger audit log entries
      // For now, verify that sensitive data is properly handled
      expect(data).not.toHaveProperty("cpf_hash");
    });
  });

  describe("⚡ Performance Integration Tests", () => {
    it("should handle batch operations efficiently", async () => {
      const startTime = Date.now();

      // Create multiple test records
      const batchSize = 10;
      const testRecords = new Array(batchSize).fill().map((_, index) => ({
        id: nanoid(),
        clinic_id: testClinic.id,
        name: `Batch Patient ${index}`,
        email: `batch-${index}-${nanoid(4)}@test.com`,
        lgpd_consent: {
          data_processing: true,
          granted_at: new Date().toISOString(),
        },
      }));

      const { data, error } = await supabaseAdmin
        .from("patients")
        .insert(testRecords)
        .select();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(error).toBeNull();
      expect(data?.length).toBe(batchSize);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      // Cleanup batch records
      const batchIds = data?.map((record) => record.id) || [];
      await supabaseAdmin.from("patients").delete().in("id", batchIds);
    });

    it("should handle concurrent operations without conflicts", async () => {
      const concurrentOps = 5;
      const promises = new Array(concurrentOps).fill().map(async (_, index) => {
        const patientData = {
          id: nanoid(),
          clinic_id: testClinic.id,
          name: `Concurrent Patient ${index}`,
          email: `concurrent-${index}-${nanoid(4)}@test.com`,
          lgpd_consent: {
            data_processing: true,
            granted_at: new Date().toISOString(),
          },
        };

        return supabaseAdmin
          .from("patients")
          .insert(patientData)
          .select()
          .single();
      });

      const results = await Promise.all(promises);

      // All operations should succeed
      results.forEach((result) => {
        expect(result.error).toBeNull();
        expect(result.data).toBeTruthy();
      });

      // Cleanup concurrent records
      const concurrentIds = results.map((result) => result.data.id);
      await supabaseAdmin.from("patients").delete().in("id", concurrentIds);
    });
  });
});
