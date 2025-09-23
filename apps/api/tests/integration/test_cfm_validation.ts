/**
 * INTEGRATION TEST: CFM (Conselho Federal de Medicina) validation (T026)
 *
 * Tests CFM regulatory compliance for Brazilian medical practice:
 * - CRM number validation and verification
 * - Digital prescription compliance
 * - Medical record maintenance standards
 * - Telemedicine regulations
 * - Professional liability tracking
 * - Regulatory reporting
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
// Test helper for API calls
async function api(path: string, init?: RequestInit) {
  const { default: app } = await import("../../src/app");
  const url = new URL(`http://local.test${path}`);
  return app.request(url, init);
}

// CFM validation schemas
const CrmValidationSchema = z.object({
  crm: z.string().regex(/^CRM-\d{4,6}$/),
  state: z.string().length(2),
  isActive: z.boolean(),
  specialties: z.array(z.string()),
  validatedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  validationSource: z.enum([
    "cfm_api",
    "crm_state_council",
    "manual_verification",
  ]),
});

const DigitalPrescriptionSchema = z.object({
  id: z.string().uuid(),
  prescriptionNumber: z.string(),
  patientId: z.string().uuid(),
  physicianCrm: z.string(),
  digitalSignature: z.object({
    certificate: z.string(),
    algorithm: z.string(),
    timestamp: z.string().datetime(),
    isValid: z.boolean(),
  }),
  medications: z.array(
    z.object({
      name: z.string(),
      activeIngredient: z.string(),
      dosage: z.string(),
      quantity: z.number(),
      instructions: z.string(),
      controlledSubstance: z.boolean().optional(),
    }),
  ),
  issuedAt: z.string().datetime(),
  validUntil: z.string().datetime(),
  cfmCompliance: z.object({
    prescriptionStandard: z.string(),
    digitalSignatureValid: z.boolean(),
    physicianVerified: z.boolean(),
    medicationValidation: z.boolean(),
  }),
});

const TelemedicineSessionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["consultation", "follow_up", "emergency", "second_opinion"]),
  patientId: z.string().uuid(),
  physicianCrm: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  platform: z.string(),
  consentRecorded: z.boolean(),
  recordingConsent: z.boolean(),
  cfmCompliance: z.object({
    patientIdentificationVerified: z.boolean(),
    informedConsentObtained: z.boolean(),
    medicalRecordMaintained: z.boolean(),
    followUpScheduled: z.boolean(),
    technicalStandardsMet: z.boolean(),
  }),
});

describe("CFM Validation Integration Tests", () => {
  const testAuthHeaders = {
    Authorization: "Bearer test-token",
    "Content-Type": "application/json",
    "X-Healthcare-Professional": "CRM-123456",
    "X-User-Role": "physician",
    "X-CRM-State": "SP",
  };

  let testPhysicianCrm: string;
  let testPatientId: string;

  beforeAll(async () => {
    // Setup CFM test environment
    // TODO: Initialize CFM validation service
  });

  beforeEach(async () => {
    testPhysicianCrm = "CRM-123456";
    testPatientId = "550e8400-e29b-41d4-a716-446655440000";
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe("CRM Number Validation", () => {
    it("should validate CRM numbers against CFM database", async () => {
      const crmValidationResponse = await api("/api/v2/cfm/validate-crm", {
        method: "POST",
        headers: testAuthHeaders,
        body: JSON.stringify({
          crm: "CRM-123456",
          state: "SP",
          fullValidation: true,
        }),
      });

      expect(crmValidationResponse.status).toBe(200);
      const validation = await crmValidationResponse.json();

      expect(validation).toMatchObject({
        crm: "CRM-123456",
        state: "SP",
        isActive: true,
        validatedAt: expect.any(String),
        validationSource: expect.any(String),
        physician: expect.objectContaining({
          name: expect.any(String),
          specialties: expect.any(Array),
          registrationDate: expect.any(String),
        }),
      });
    });

    it("should reject invalid CRM formats", async () => {
      const invalidCrmTests = [
        "CRM123456", // Missing dash
        "CRM-12", // Too short
        "CRM-1234567890", // Too long
        "XRM-123456", // Wrong prefix
        "123456", // No prefix
      ];

      for (const invalidCrm of invalidCrmTests) {
        const response = await api("/api/v2/cfm/validate-crm", {
          method: "POST",
          headers: testAuthHeaders,
          body: JSON.stringify({
            crm: invalidCrm,
            state: "SP",
          }),
        });

        expect(response.status).toBe(400);
        const error = await response.json();
        expect(error.error).toBe("invalid_crm_format");
      }
    });

    it("should check CRM registration across different state councils", async () => {
      const states = ["SP", "RJ", "MG", "RS", "PR"];

      for (const state of states) {
        const stateValidationResponse = await api("/api/v2/cfm/validate-crm", {
          method: "POST",
          headers: testAuthHeaders,
          body: JSON.stringify({
            crm: `CRM-${Math.floor(Math.random() * 100000) + 10000}`,
            state,
            checkCrossRegistration: true,
          }),
        });

        expect(stateValidationResponse.status).toBeOneOf([200, 404]);

        if (stateValidationResponse.status === 200) {
          const validation = await stateValidationResponse.json();
          expect(validation.state).toBe(state);
          expect(validation.validationSource).toMatch(
            /crm_state_council|cfm_api/,
          );
        }
      }
    });

    it("should verify physician specialties against CFM records", async () => {
      const specialtyValidationResponse = await api(
        "/api/v2/cfm/validate-specialty",
        {
          method: "POST",
          headers: testAuthHeaders,
          body: JSON.stringify({
            crm: testPhysicianCrm,
            state: "SP",
            claimedSpecialties: ["Cardiologia", "Medicina Interna"],
          }),
        },
      );

      expect(specialtyValidationResponse.status).toBe(200);
      const specialtyValidation = await specialtyValidationResponse.json();

      expect(specialtyValidation).toMatchObject({
        crm: testPhysicianCrm,
        specialtyValidation: expect.arrayContaining([
          expect.objectContaining({
            specialty: expect.any(String),
            isRecognized: expect.any(Boolean),
            certificationDate: expect.any(String),
            isActive: expect.any(Boolean),
          }),
        ]),
        overallValid: expect.any(Boolean),
      });
    });
  });

  describe("Digital Prescription Compliance", () => {
    it("should create CFM-compliant digital prescriptions", async () => {
      const prescriptionData = {
        patientId: testPatientId,
        medications: [
          {
            name: "Losartana Potássica 50mg",
            activeIngredient: "Losartana Potássica",
            dosage: "1 comprimido pela manhã",
            quantity: 30,
            instructions:
              "Tomar com água, preferencialmente pela manhã em jejum",
            controlledSubstance: false,
          },
          {
            name: "Metformina 850mg",
            activeIngredient: "Cloridrato de Metformina",
            dosage: "1 comprimido após o almoço e jantar",
            quantity: 60,
            instructions: "Tomar após as principais refeições",
            controlledSubstance: false,
          },
        ],
        instructions: "Retorno em 30 dias para reavaliação",
        validityDays: 30,
      };

      const prescriptionResponse = await api("/api/v2/prescriptions/digital", {
        method: "POST",
        headers: {
          ...testAuthHeaders,
          "X-Digital-Certificate": "physician-cert-hash",
          "X-CFM-Compliance": "required",
        },
        body: JSON.stringify(prescriptionData),
      });

      expect(prescriptionResponse.status).toBe(201);
      const prescription = await prescriptionResponse.json();

      expect(prescription).toMatchObject({
        id: expect.any(String),
        prescriptionNumber: expect.stringMatching(/^RX-\d{4}-\d{6}$/),
        physicianCrm: testPhysicianCrm,
        digitalSignature: expect.objectContaining({
          certificate: expect.any(String),
          algorithm: "SHA-256",
          isValid: true,
        }),
        cfmCompliance: expect.objectContaining({
          prescriptionStandard: "CFM-2227/2018",
          digitalSignatureValid: true,
          physicianVerified: true,
          medicationValidation: true,
        }),
      });
    });

    it("should handle controlled substance prescriptions with enhanced validation", async () => {
      const controlledSubstancePrescription = {
        patientId: testPatientId,
        medications: [
          {
            name: "Morfina 10mg",
            activeIngredient: "Sulfato de Morfina",
            dosage: "1 comprimido a cada 8 horas",
            quantity: 30,
            instructions: "Para dor intensa. Não exceder a dose prescrita.",
            controlledSubstance: true,
            controlledSubstanceCategory: "A1",
            justification: "Paciente com dor oncológica refratária",
          },
        ],
        specialRequirements: {
          patientConsentRecorded: true,
          familyNotified: true,
          alternativeTreatmentsConsidered: true,
        },
        validityDays: 7, // Shorter validity for controlled substances
      };

      const controlledResponse = await api("/api/v2/prescriptions/controlled", {
        method: "POST",
        headers: {
          ...testAuthHeaders,
          "X-Digital-Certificate": "physician-cert-hash",
          "X-Controlled-Substance-Authorization": "valid",
          "X-CFM-Compliance": "strict",
        },
        body: JSON.stringify(controlledSubstancePrescription),
      });

      expect(controlledResponse.status).toBe(201);
      const controlledPrescription = await controlledResponse.json();

      expect(controlledPrescription).toMatchObject({
        prescriptionNumber: expect.stringMatching(/^RXC-\d{4}-\d{6}$/), // Controlled substance prefix
        medications: expect.arrayContaining([
          expect.objectContaining({
            controlledSubstance: true,
            controlledSubstanceCategory: "A1",
          }),
        ]),
        cfmCompliance: expect.objectContaining({
          controlledSubstanceValidation: true,
          physicianAuthorized: true,
          justificationProvided: true,
        }),
        anvisaCompliance: expect.objectContaining({
          notificationRequired: true,
          notificationSent: expect.any(Boolean),
        }),
      });
    });

    it("should validate prescription digital signatures", async () => {
      // Create a prescription first
      const prescriptionData = {
        patientId: testPatientId,
        medications: [
          {
            name: "Amoxicilina 500mg",
            activeIngredient: "Amoxicilina",
            dosage: "1 cápsula a cada 8 horas",
            quantity: 21,
            instructions: "Tomar com água",
          },
        ],
      };

      const createResponse = await api("/api/v2/prescriptions/digital", {
        method: "POST",
        headers: {
          ...testAuthHeaders,
          "X-Digital-Certificate": "valid-physician-cert",
        },
        body: JSON.stringify(prescriptionData),
      });

      expect(createResponse.status).toBe(201);
      const prescription = await createResponse.json();

      // Validate the digital signature
      const signatureValidationResponse = await api(
        `/api/v2/prescriptions/${prescription.id}/validate-signature`,
        {
          headers: testAuthHeaders,
        },
      );

      expect(signatureValidationResponse.status).toBe(200);
      const signatureValidation = await signatureValidationResponse.json();

      expect(signatureValidation).toMatchObject({
        prescriptionId: prescription.id,
        signatureValid: true,
        certificateValid: true,
        timestampValid: true,
        cfmCompliant: true,
        validatedAt: expect.any(String),
        validationDetails: expect.objectContaining({
          certificateIssuer: expect.any(String),
          certificateSerial: expect.any(String),
          signatureAlgorithm: "SHA-256",
        }),
      });
    });
  });

  describe("Medical Record Compliance", () => {
    it("should maintain CFM-compliant medical records", async () => {
      const medicalRecordData = {
        patientId: testPatientId,
        consultationType: "routine_consultation",
        chiefComplaint: "Dor no peito há 2 dias",
        historyOfPresentIllness: "Paciente relata dor precordial há 48h...",
        physicalExamination: {
          generalAppearance: "Bom estado geral",
          vitalSigns: {
            bloodPressure: "140/90 mmHg",
            heartRate: "88 bpm",
            temperature: "36.5°C",
            oxygenSaturation: "98%",
          },
          cardiovascular: "Bulhas rítmicas, normofonéticas",
          respiratory: "Murmúrio vesicular presente bilateralmente",
        },
        assessment: "Hipertensão arterial sistêmica",
        plan: "Prescrição de anti-hipertensivo, retorno em 30 dias",
        followUpDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };

      const recordResponse = await api("/api/v2/medical-records", {
        method: "POST",
        headers: {
          ...testAuthHeaders,
          "X-Medical-Record-Standard": "CFM-1821/2007",
        },
        body: JSON.stringify(medicalRecordData),
      });

      expect(recordResponse.status).toBe(201);
      const medicalRecord = await recordResponse.json();

      expect(medicalRecord).toMatchObject({
        id: expect.any(String),
        recordNumber: expect.stringMatching(/^MR-\d{4}-\d{6}$/),
        patientId: testPatientId,
        physicianCrm: testPhysicianCrm,
        cfmCompliance: expect.objectContaining({
          recordStandard: "CFM-1821/2007",
          requiredFieldsComplete: true,
          digitalSignaturePresent: true,
          retentionPolicyApplied: true,
        }),
        auditTrail: expect.objectContaining({
          createdAt: expect.any(String),
          createdBy: testPhysicianCrm,
          modifications: expect.any(Array),
        }),
      });
    });

    it("should enforce medical record retention policies", async () => {
      const retentionPolicyResponse = await api(
        "/api/v2/cfm/medical-records/retention",
        {
          headers: testAuthHeaders,
        },
      );

      expect(retentionPolicyResponse.status).toBe(200);
      const retentionPolicy = await retentionPolicyResponse.json();

      expect(retentionPolicy).toMatchObject({
        policies: expect.arrayContaining([
          expect.objectContaining({
            recordType: "adult_medical_record",
            retentionPeriod: "20y", // 20 years as per CFM guidelines
            archiveAfter: "5y",
          }),
          expect.objectContaining({
            recordType: "pediatric_medical_record",
            retentionPeriod: "until_age_of_majority_plus_20y",
          }),
          expect.objectContaining({
            recordType: "prescription_record",
            retentionPeriod: "2y",
          }),
        ]),
        complianceStatus: expect.objectContaining({
          totalRecords: expect.any(Number),
          compliantRecords: expect.any(Number),
          pendingArchival: expect.any(Number),
          retentionViolations: expect.any(Number),
        }),
      });
    });
  });

  describe("Telemedicine Compliance", () => {
    it("should validate telemedicine session compliance", async () => {
      const telemedicineSessionData = {
        patientId: testPatientId,
        sessionType: "consultation",
        platform: "secure_video_platform",
        patientConsent: {
          telemedicineConsent: true,
          recordingConsent: false,
          dataProcessingConsent: true,
          consentTimestamp: new Date().toISOString(),
        },
        patientVerification: {
          documentType: "cpf",
          documentNumber: "123.456.789-00",
          verificationMethod: "document_photo",
          verified: true,
        },
      };

      const sessionResponse = await api("/api/v2/telemedicine/sessions", {
        method: "POST",
        headers: {
          ...testAuthHeaders,
          "X-Telemedicine-Platform": "certified",
          "X-CFM-Telemedicine-Compliance": "required",
        },
        body: JSON.stringify(telemedicineSessionData),
      });

      expect(sessionResponse.status).toBe(201);
      const session = await sessionResponse.json();

      expect(session).toMatchObject({
        id: expect.any(String),
        sessionNumber: expect.stringMatching(/^TM-\d{4}-\d{6}$/),
        cfmCompliance: expect.objectContaining({
          patientIdentificationVerified: true,
          informedConsentObtained: true,
          technicalStandardsMet: true,
          medicalRecordRequired: true,
        }),
        regulatoryRequirements: expect.objectContaining({
          cfmResolution: "CFM-2227/2018",
          platformCertified: true,
          dataProtectionCompliant: true,
        }),
      });
    });

    it("should enforce telemedicine prescription limitations", async () => {
      // Attempt to prescribe controlled substance via telemedicine
      const telemedicinePrescriptionData = {
        sessionId: "tm-session-123",
        patientId: testPatientId,
        medications: [
          {
            name: "Diazepam 5mg",
            activeIngredient: "Diazepam",
            dosage: "1 comprimido ao deitar",
            quantity: 30,
            controlledSubstance: true,
            controlledSubstanceCategory: "B1",
          },
        ],
        isTelemedicineSession: true,
      };

      const telemedicinePrescriptionResponse = await api(
        "/api/v2/prescriptions/telemedicine",
        {
          method: "POST",
          headers: {
            ...testAuthHeaders,
            "X-Telemedicine-Session": "active",
          },
          body: JSON.stringify(telemedicinePrescriptionData),
        },
      );

      // Should be rejected for controlled substances
      expect(telemedicinePrescriptionResponse.status).toBe(403);
      const error = await telemedicinePrescriptionResponse.json();
      expect(error.error).toBe("controlled_substance_telemedicine_prohibited");
      expect(error.cfmRegulation).toBe("CFM-2227/2018");

      // Test with non-controlled medication
      const allowedTelemedicinePrescription = {
        ...telemedicinePrescriptionData,
        medications: [
          {
            name: "Paracetamol 500mg",
            activeIngredient: "Paracetamol",
            dosage: "1 comprimido a cada 6 horas",
            quantity: 20,
            controlledSubstance: false,
          },
        ],
      };

      const allowedResponse = await api("/api/v2/prescriptions/telemedicine", {
        method: "POST",
        headers: {
          ...testAuthHeaders,
          "X-Telemedicine-Session": "active",
        },
        body: JSON.stringify(allowedTelemedicinePrescription),
      });

      expect(allowedResponse.status).toBe(201);
    });
  });

  describe("Professional Liability and Ethics", () => {
    it("should track professional liability incidents", async () => {
      const incidentData = {
        type: "medical_error",
        severity: "moderate",
        description: "Medication dosage error - corrected immediately",
        patientId: testPatientId,
        immediateActions: [
          "Patient notified",
          "Medication corrected",
          "Additional monitoring implemented",
        ],
        reportingRequired: true,
        ethicsReviewRequired: false,
      };

      const incidentResponse = await api("/api/v2/cfm/incidents", {
        method: "POST",
        headers: {
          ...testAuthHeaders,
          "X-Incident-Reporting": "mandatory",
        },
        body: JSON.stringify(incidentData),
      });

      expect(incidentResponse.status).toBe(201);
      const incident = await incidentResponse.json();

      expect(incident).toMatchObject({
        incidentId: expect.any(String),
        incidentNumber: expect.stringMatching(/^INC-\d{4}-\d{6}$/),
        reportedBy: testPhysicianCrm,
        cfmNotificationRequired: expect.any(Boolean),
        crmStateNotificationRequired: expect.any(Boolean),
        patientNotificationStatus: "completed",
        investigationStatus: "pending",
      });
    });

    it("should validate continuing medical education compliance", async () => {
      const cmeComplianceResponse = await api("/api/v2/cfm/cme-compliance", {
        method: "POST",
        headers: testAuthHeaders,
        body: JSON.stringify({
          crm: testPhysicianCrm,
          period: "2024",
        }),
      });

      expect(cmeComplianceResponse.status).toBe(200);
      const cmeCompliance = await cmeComplianceResponse.json();

      expect(cmeCompliance).toMatchObject({
        crm: testPhysicianCrm,
        period: "2024",
        requiredHours: 100, // CFM requirement
        completedHours: expect.any(Number),
        complianceStatus: expect.oneOf([
          "compliant",
          "non_compliant",
          "pending",
        ]),
        activitiesRecorded: expect.any(Array),
        certificatesValidated: expect.any(Number),
      });
    });
  });

  describe("Regulatory Reporting", () => {
    it("should generate CFM compliance reports", async () => {
      const complianceReportResponse = await api(
        "/api/v2/cfm/reports/compliance",
        {
          method: "POST",
          headers: testAuthHeaders,
          body: JSON.stringify({
            period: {
              start: new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              end: new Date().toISOString(),
            },
            includeDetails: true,
          }),
        },
      );

      expect(complianceReportResponse.status).toBe(200);
      const complianceReport = await complianceReportResponse.json();

      expect(complianceReport).toMatchObject({
        reportType: "cfm_compliance",
        period: expect.any(Object),
        physicians: expect.any(Array),
        prescriptions: expect.objectContaining({
          total: expect.any(Number),
          digital: expect.any(Number),
          controlled: expect.any(Number),
          complianceRate: expect.any(Number),
        }),
        medicalRecords: expect.objectContaining({
          total: expect.any(Number),
          cfmCompliant: expect.any(Number),
          retentionCompliant: expect.any(Number),
        }),
        telemedicine: expect.objectContaining({
          sessions: expect.any(Number),
          compliantSessions: expect.any(Number),
          patientConsentRate: expect.any(Number),
        }),
        overallComplianceScore: expect.any(Number),
      });
    });

    it("should support automated CFM notification submissions", async () => {
      const notificationData = {
        notificationType: "adverse_event",
        severity: "moderate",
        patientAgeGroup: "adult",
        medications: ["Losartana", "Metformina"],
        adverseEvent: "Mild hypoglycemia",
        outcome: "recovered",
        reportingPhysician: testPhysicianCrm,
      };

      const notificationResponse = await api(
        "/api/v2/cfm/notifications/adverse-event",
        {
          method: "POST",
          headers: {
            ...testAuthHeaders,
            "X-CFM-Notification": "automated",
          },
          body: JSON.stringify(notificationData),
        },
      );

      expect(notificationResponse.status).toBe(201);
      const notification = await notificationResponse.json();

      expect(notification).toMatchObject({
        notificationId: expect.any(String),
        cfmProtocol: expect.stringMatching(/^CFM-AE-\d{4}-\d{6}$/),
        submissionStatus: "submitted",
        acknowledgmentExpected: true,
        followUpRequired: expect.any(Boolean),
        submittedAt: expect.any(String),
      });
    });
  });
});
