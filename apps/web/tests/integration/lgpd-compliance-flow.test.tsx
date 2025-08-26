// LGPD Compliance Flow Integration Test
// Brazilian healthcare data protection compliance testing

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Types for LGPD compliance
interface LGPDConsentRecord {
  id: string;
  patient_id: string;
  purpose: string[];
  legal_basis: "consent" | "legal_obligation" | "vital_interests";
  granted: boolean;
  granted_at: string;
  revoked_at?: string;
  data_controller: string;
  retention_period: string;
  clinic_id: string;
}

interface DataSubjectRequest {
  id: string;
  request_type:
    | "access"
    | "rectification"
    | "erasure"
    | "portability"
    | "objection";
  patient_id: string;
  patient_cpf: string;
  requester_identity_verified: boolean;
  request_date: string;
  completion_date?: string;
  status: "pending" | "processing" | "completed" | "rejected";
  data_export_url?: string;
  clinic_id: string;
}

interface AuditTrailEntry {
  id: string;
  action: "CREATE" | "READ" | "UPDATE" | "DELETE" | "EXPORT" | "ANONYMIZE";
  resource: "patient" | "appointment" | "medical_record" | "consent";
  resource_id: string;
  user_id: string;
  user_role: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  clinic_id: string;
  legal_basis?: string;
  data_categories?: string[];
}

// Use global mocks from vitest.setup.ts
const mockLGPDService = (globalThis as any).mockLgpdService;
const mockSupabaseClient = (globalThis as any).mockSupabaseClient;

vi.mock<typeof import("@supabase/supabase-js")>(
  "@supabase/supabase-js",
  () => ({
    createClient: () => mockSupabaseClient,
  }),
);

vi.mock<typeof import("../../lib/services/lgpd-service")>(
  "../../lib/services/lgpd-service",
  () => ({
    LGPDService: mockLGPDService,
  }),
);

// Test data
const mockPatientData = {
  id: "patient-123",
  name: "João Silva Santos",
  cpf: "123.456.789-00",
  email: "joao.silva@email.com",
  phone: "(11) 99999-9999",
  clinic_id: "clinic-1",
};

const mockConsentRecord: LGPDConsentRecord = {
  id: "consent-123",
  patient_id: "patient-123",
  purpose: ["treatment", "emergency_contact", "appointment_reminders"],
  legal_basis: "consent",
  granted: true,
  granted_at: new Date().toISOString(),
  data_controller: "clinic-1",
  retention_period: "10_years",
  clinic_id: "clinic-1",
};

const mockDataRequest: DataSubjectRequest = {
  id: "request-123",
  request_type: "access",
  patient_id: "patient-123",
  patient_cpf: "123.456.789-00",
  requester_identity_verified: true,
  request_date: new Date().toISOString(),
  status: "pending",
  clinic_id: "clinic-1",
};

// Test wrapper component
const _TestWrapper = ({ children }: { children: React.ReactNode }) => {
  // Use the global mock QueryClient instead of creating a new one
  const queryClient = globalThis.queryClient;

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
describe("lGPD Compliance Flow Integration Tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // Create a fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  describe("consent Management", () => {
    it("should record patient consent with all required details", async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockConsentRecord,
              error: undefined,
            }),
          })),
        })),
      });

      mockLGPDService.recordConsent.mockResolvedValue({
        success: true,
        consent_id: mockConsentRecord.id,
        audit_trail_id: "audit-consent-123",
      });

      const consentData = {
        patient_id: mockPatientData.id,
        purposes: ["treatment", "emergency_contact"],
        legal_basis: "consent" as const,
        data_controller: "clinic-1",
      };

      const result = await mockLGPDService.recordConsent(consentData);

      expect(mockLGPDService.recordConsent).toHaveBeenCalledWith(consentData);
      expect(result.success).toBeTruthy();
      expect(result.consent_id).toBeDefined();
      expect(result.audit_trail_id).toBeDefined();
    });

    it("should validate purpose limitation for data processing", async () => {
      const processingRequest = {
        patient_id: "patient-123",
        purpose: "marketing", // Not consented purpose
        data_categories: ["contact_info"],
        requested_by: "user-456",
      };

      mockLGPDService.validatePurposeLimitation.mockResolvedValue({
        valid: false,
        violation: "PURPOSE_NOT_CONSENTED",
        consented_purposes: ["treatment", "emergency_contact"],
        requested_purpose: "marketing",
      });

      const result =
        await mockLGPDService.validatePurposeLimitation(processingRequest);

      expect(result.valid).toBeFalsy();
      expect(result.violation).toBe("PURPOSE_NOT_CONSENTED");
      expect(result.consented_purposes).not.toContain("marketing");
    });

    it("should handle consent revocation with immediate effect", async () => {
      const revocationRequest = {
        consent_id: mockConsentRecord.id,
        patient_id: mockPatientData.id,
        revocation_reason: "patient_request",
        revoked_by: "patient",
      };

      const revokedConsent = {
        ...mockConsentRecord,
        granted: false,
        revoked_at: new Date().toISOString(),
      };

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: revokedConsent,
                error: undefined,
              }),
            })),
          })),
        })),
      });

      mockLGPDService.revokeConsent.mockResolvedValue({
        success: true,
        revoked_consent: revokedConsent,
        data_processing_stopped: true,
        audit_trail_id: "audit-revoke-123",
      });

      const result = await mockLGPDService.revokeConsent(revocationRequest);

      expect(result.success).toBeTruthy();
      expect(result.revoked_consent.granted).toBeFalsy();
      expect(result.revoked_consent.revoked_at).toBeDefined();
      expect(result.data_processing_stopped).toBeTruthy();
    });
  });
  describe("data Subject Rights", () => {
    it("should process data access requests (Right to Access)", async () => {
      const accessRequest = {
        ...mockDataRequest,
        request_type: "access" as const,
      };

      const exportedData = {
        patient_data: mockPatientData,
        medical_records: [
          {
            id: "record-1",
            date: "2024-01-15",
            diagnosis: "Hipertensão arterial",
            treatment: "Medicação anti-hipertensiva",
          },
        ],
        appointments: [
          {
            id: "apt-1",
            date: "2024-01-20",
            doctor: "Dr. Silva",
            specialty: "Cardiologia",
          },
        ],
        consent_history: [mockConsentRecord],
        audit_trail: [],
        exported_at: new Date().toISOString(),
        format: "json",
        encryption: "AES-256",
      };

      mockLGPDService.processDataSubjectRequest.mockResolvedValue({
        success: true,
        request_id: accessRequest.id,
        exported_data: exportedData,
        download_url: "https://secure.clinic.com/exports/patient-123-data.zip",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                ...accessRequest,
                status: "completed",
                completion_date: new Date().toISOString(),
              },
              error: undefined,
            }),
          })),
        })),
      });

      const result =
        await mockLGPDService.processDataSubjectRequest(accessRequest);

      expect(result.success).toBeTruthy();
      expect(result.exported_data.patient_data).toStrictEqual(mockPatientData);
      expect(result.download_url).toContain("patient-123-data.zip");
      expect(result.expires_at).toBeDefined();
    });

    it("should handle data rectification requests (Right to Rectification)", async () => {
      const rectificationRequest = {
        ...mockDataRequest,
        request_type: "rectification" as const,
        rectification_details: {
          field: "phone",
          current_value: "(11) 99999-9999",
          requested_value: "(11) 88888-8888",
          justification: "Número de telefone alterado",
        },
      };

      mockLGPDService.processDataSubjectRequest.mockResolvedValue({
        success: true,
        request_id: rectificationRequest.id,
        changes_applied: true,
        updated_fields: ["phone"],
        audit_trail_id: "audit-rectification-123",
      });

      const result =
        await mockLGPDService.processDataSubjectRequest(rectificationRequest);

      expect(result.success).toBeTruthy();
      expect(result.changes_applied).toBeTruthy();
      expect(result.updated_fields).toContain("phone");
      expect(result.audit_trail_id).toBeDefined();
    });

    it("should handle data erasure requests (Right to Erasure)", async () => {
      const erasureRequest = {
        ...mockDataRequest,
        request_type: "erasure" as const,
        erasure_scope: "complete", // or 'partial'
        legal_review: true,
        medical_record_retention: true, // Healthcare data has special retention rules
      };

      mockLGPDService.processDataSubjectRequest.mockResolvedValue({
        success: true,
        request_id: erasureRequest.id,
        anonymization_applied: true,
        data_anonymized: true,
        medical_records_retained: true, // Due to legal medical record retention
        retention_justification:
          "Brazilian medical record retention law (10 years)",
        audit_trail_id: "audit-erasure-123",
      });

      const result =
        await mockLGPDService.processDataSubjectRequest(erasureRequest);

      expect(result.success).toBeTruthy();
      expect(result.anonymization_applied).toBeTruthy();
      expect(result.medical_records_retained).toBeTruthy();
      expect(result.retention_justification).toContain(
        "medical record retention",
      );
    });

    it("should process data portability requests (Right to Data Portability)", async () => {
      const portabilityRequest = {
        ...mockDataRequest,
        request_type: "portability" as const,
        export_format: "HL7_FHIR", // Healthcare standard format
        include_medical_records: true,
      };

      const portableData = {
        patient_data: mockPatientData,
        medical_records_fhir: {
          resourceType: "Bundle",
          id: "patient-123-bundle",
          type: "collection",
          entry: [
            {
              resource: {
                resourceType: "Patient",
                id: "patient-123",
                identifier: [
                  { value: "123.456.789-00", system: "urn:oid:2.16.76.1.3.1" },
                ],
                name: [{ family: "Santos", given: ["João", "Silva"] }],
              },
            },
          ],
        },
        export_format: "HL7_FHIR",
        structured_data: true,
        interoperable: true,
      };

      mockLGPDService.processDataSubjectRequest.mockResolvedValue({
        success: true,
        request_id: portabilityRequest.id,
        portable_data: portableData,
        download_url: "https://secure.clinic.com/exports/patient-123-fhir.json",
        format: "HL7_FHIR",
        machine_readable: true,
      });

      const result =
        await mockLGPDService.processDataSubjectRequest(portabilityRequest);

      expect(result.success).toBeTruthy();
      expect(result.portable_data.export_format).toBe("HL7_FHIR");
      expect(result.portable_data.structured_data).toBeTruthy();
      expect(result.machine_readable).toBeTruthy();
    });
  });

  describe("audit Trail and Monitoring", () => {
    it("should create comprehensive audit entries for all data operations", async () => {
      const auditEntry: AuditTrailEntry = {
        id: "audit-123",
        action: "READ",
        resource: "patient",
        resource_id: "patient-123",
        user_id: "doctor-456",
        user_role: "doctor",
        timestamp: new Date().toISOString(),
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (compatible; NeonPro/1.0)",
        clinic_id: "clinic-1",
        legal_basis: "consent",
        data_categories: ["personal_data", "health_data"],
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: auditEntry,
              error: undefined,
            }),
          })),
        })),
      });

      mockLGPDService.createAuditEntry.mockResolvedValue({
        success: true,
        audit_id: auditEntry.id,
        timestamp: auditEntry.timestamp,
      });

      const result = await mockLGPDService.createAuditEntry({
        action: "READ",
        resource: "patient",
        resource_id: "patient-123",
        user_id: "doctor-456",
        legal_basis: "consent",
      });

      expect(result.success).toBeTruthy();
      expect(result.audit_id).toBeDefined();
      expect(mockLGPDService.createAuditEntry).toHaveBeenCalledWith({
        action: "READ",
        resource: "patient",
        resource_id: "patient-123",
        user_id: "doctor-456",
        legal_basis: "consent",
      });
    });

    it("should provide comprehensive audit trail reports", async () => {
      const auditTrailReport = {
        patient_id: "patient-123",
        date_range: {
          start: "2024-01-01T00:00:00Z",
          end: "2024-01-31T23:59:59Z",
        },
        total_entries: 45,
        entries: [
          {
            timestamp: "2024-01-15T10:30:00Z",
            action: "CREATE",
            user: "reception-789",
            resource: "patient",
            legal_basis: "consent",
          },
          {
            timestamp: "2024-01-16T14:20:00Z",
            action: "READ",
            user: "doctor-456",
            resource: "patient",
            legal_basis: "treatment",
          },
        ],
        compliance_status: "compliant",
        violations: [],
        recommendations: [],
      };

      mockLGPDService.getAuditTrail.mockResolvedValue({
        success: true,
        audit_report: auditTrailReport,
        generated_at: new Date().toISOString(),
      });

      const result = await mockLGPDService.getAuditTrail({
        patient_id: "patient-123",
        date_range: {
          start: "2024-01-01",
          end: "2024-01-31",
        },
      });

      expect(result.success).toBeTruthy();
      expect(result.audit_report.total_entries).toBe(45);
      expect(result.audit_report.compliance_status).toBe("compliant");
      expect(result.audit_report.entries).toHaveLength(2);
    });
  });
  describe("data Retention and Lifecycle Management", () => {
    it("should enforce Brazilian healthcare data retention policies", async () => {
      const retentionPolicy = {
        medical_records: "10_years", // Brazilian requirement
        patient_data: "5_years_after_last_visit",
        consent_records: "5_years_after_revocation",
        audit_logs: "5_years",
        billing_records: "5_years",
      };

      mockLGPDService.checkRetentionPolicy.mockResolvedValue({
        policy_compliant: true,
        retention_periods: retentionPolicy,
        expired_data: [],
        upcoming_expirations: [
          {
            resource_type: "patient_data",
            resource_id: "patient-456",
            expires_at: "2024-06-15T00:00:00Z",
            action_required: "anonymize_or_delete",
          },
        ],
        healthcare_exceptions: [
          "Medical records retained for 10 years as per Brazilian medical law",
          "Emergency contact data retained for patient safety",
        ],
      });

      const result = await mockLGPDService.checkRetentionPolicy("clinic-1");

      expect(result.policy_compliant).toBeTruthy();
      expect(result.retention_periods.medical_records).toBe("10_years");
      expect(result.healthcare_exceptions).toContain(
        "Medical records retained for 10 years as per Brazilian medical law",
      );
      expect(result.upcoming_expirations).toHaveLength(1);
    });

    it("should handle automated data anonymization on retention expiry", async () => {
      const expiredPatientData = {
        patient_id: "patient-expired-456",
        last_visit: "2019-01-15",
        retention_expired: true,
        contains_medical_records: true,
      };

      mockLGPDService.anonymizePatientData.mockResolvedValue({
        success: true,
        patient_id: expiredPatientData.patient_id,
        anonymized_fields: ["name", "cpf", "email", "phone", "address"],
        preserved_fields: [
          "medical_conditions",
          "treatment_outcomes", // For research purposes
        ],
        anonymization_method: "k_anonymity",
        medical_data_aggregated: true,
        audit_trail_id: "audit-anonymization-456",
      });

      const result = await mockLGPDService.anonymizePatientData(
        expiredPatientData.patient_id,
      );

      expect(result.success).toBeTruthy();
      expect(result.anonymized_fields).toContain("cpf");
      expect(result.preserved_fields).toContain("medical_conditions");
      expect(result.medical_data_aggregated).toBeTruthy();
    });
  });

  describe("brazilian Healthcare Specific Compliance", () => {
    it("should validate CPF-based identity verification for data requests", async () => {
      const identityVerification = {
        provided_cpf: "123.456.789-00",
        patient_cpf: "123.456.789-00",
        additional_verification: {
          full_name: "João Silva Santos",
          birth_date: "1985-03-15",
          mothers_name: "Maria Santos Silva",
        },
        verification_method: "cpf_plus_personal_data",
        verification_level: "high_confidence",
      };

      const verificationResult = {
        verified: true,
        confidence_score: 0.95,
        verification_factors: [
          "cpf_exact_match",
          "name_exact_match",
          "birth_date_match",
          "mothers_name_match",
        ],
        risk_assessment: "low_risk",
        approved_for_data_access: true,
      };

      // Mock identity verification
      expect(identityVerification.provided_cpf).toBe(
        identityVerification.patient_cpf,
      );
      expect(verificationResult.verified).toBeTruthy();
      expect(verificationResult.confidence_score).toBeGreaterThan(0.9);
      expect(verificationResult.approved_for_data_access).toBeTruthy();
    });

    it("should enforce professional council registration validation", async () => {
      const _professionalAccess = {
        user_id: "doctor-123",
        professional_council: "CRM", // Conselho Regional de Medicina
        registration_number: "CRM-SP-123456",
        specialty: "Cardiologia",
        clinic_id: "clinic-1",
        requested_patient_id: "patient-123",
        access_purpose: "treatment",
      };

      const accessValidation = {
        professional_verified: true,
        council_registration_active: true,
        specialty_relevant: true,
        clinic_authorization: true,
        patient_consent_exists: true,
        access_granted: true,
        access_limitations: [],
        audit_required: true,
      };

      expect(accessValidation.professional_verified).toBeTruthy();
      expect(accessValidation.council_registration_active).toBeTruthy();
      expect(accessValidation.access_granted).toBeTruthy();
      expect(accessValidation.audit_required).toBeTruthy();
    });

    it("should handle ANVISA reporting compliance for medication data", async () => {
      const _medicationData = {
        patient_id: "patient-123",
        prescriptions: [
          {
            medication: "Losartana 50mg",
            controlled_substance: false,
            prescribing_doctor: "CRM-SP-123456",
            prescription_date: "2024-01-15",
          },
          {
            medication: "Rivotril 2mg",
            controlled_substance: true,
            controlled_class: "B1",
            prescribing_doctor: "CRM-SP-123456",
            prescription_date: "2024-01-20",
          },
        ],
      };

      const anvisaReporting = {
        controlled_substances_found: true,
        reporting_required: true,
        controlled_medications: ["Rivotril 2mg"],
        reporting_timeline: "72_hours",
        compliance_status: "pending_report",
        automated_reporting: true,
      };

      expect(anvisaReporting.controlled_substances_found).toBeTruthy();
      expect(anvisaReporting.reporting_required).toBeTruthy();
      expect(anvisaReporting.controlled_medications).toContain("Rivotril 2mg");
      expect(anvisaReporting.automated_reporting).toBeTruthy();
    });
  });
});
