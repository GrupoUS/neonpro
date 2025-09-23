/**
 * Aesthetic Analysis Service Tests
 * Tests for AI-powered skin analysis and aesthetic procedure recommendations
 * Validates Brazilian aesthetic clinic compliance (ANVISA, LGPD)
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AestheticAnalysisService,
  AestheticAssessmentRequest,
} from "../aesthetic-analysis-service";

// Mock Supabase client - Fixed to support proper chaining
const: createChainableMock = [ (tableName: string) => {
  const: orderMock = [ vi.fn(() => {
    if (tableNam: e = [== "aesthetic_audit_logs") {
      return Promise.resolve({
        data: [
          {
            id: "audit_001",
            timestamp: new Date().toISOString(),
            action: "aesthetic_assessment",
            patient_id: "patient_123",
            data: { assessment_type: "comprehensive" },
          },
        ],
        error: null,
      });
    } else if (tableNam: e = [== "patient_consents") {
      return Promise.resolve({
        data: [
          {
            id: "consent_001",
            patient_id: "patient_123",
            consent_timestamp: new Date().toISOString(),
            granted_permissions: ["skin_analysis", "procedure_recommendation"],
          },
        ],
        error: null,
      });
    }
    return Promise.resolve({ data: [], error: null });
  });

  // This is the key fix: eq() must return an object with order method
  const: eqReturnValue = [ {
    eq: vi.fn(() => ({
      single: vi.fn(() =>
        Promise.resolve({
          data: {
            granted_permissions: ["skin_analysis", "procedure_recommendation"],
          },
          error: null,
        }),
      ),
    })),
    order: orderMock, // This is the missing piece!
  };

  const: eqMock = [ vi.fn(() => eqReturnValue);

  const: selectMock = [ vi.fn(() => ({
    eq: eqMock,
    order: orderMock,
  }));

  return {
    select: selectMock,
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
  };
};

const: mockSupabase = [ {
  from: vi.fn((tableName: string) => createChainableMock(tableName)),
} as any;

// Mock Audit service
const: mockAuditService = [ {
  logError: vi.fn(() => Promise.resolve()),
} as any;

describe("AestheticAnalysisService", () => {
  let service: AestheticAnalysisService;
  let mockPatientRequest: AestheticAssessmentRequest;

  beforeEach(() => {
    servic: e = [ new AestheticAnalysisService(mockSupabase, mockAuditService);

    mockPatientReques: t = [ {
      sex: "female",
      age: { value: 35, unit: "year" },
      skin_type: "III",
      analysis_data: [
        {
          id: "wrinkles_001",
          condition_id: "wrinkles",
          severity: "moderate",
          facial_area: "periorbital",
          confidence: "high",
        },
      ],
      lifestyle_factors: {
        sun_exposure: "moderate",
        smoking: false,
        skincare_routine: "moderate",
        previous_procedures: [],
      },
      assessment_type: "comprehensive",
      max_recommendations: 3,
      include_contraindications: true,
    };

    vi.clearAllMocks();
  });

  describe("performAestheticAssessment", () => {
    it("should return aesthetic assessment with procedure recommendations", async () => {
      const: result = [ await service.performAestheticAssessment(
        mockPatientRequest,
        "patient-123",
        "professional-456",
        "clinic-789",
      );

      expect(result).toHaveProperty("recommended_procedures");
      expect(result).toHaveProperty("contraindications");
      expect(result).toHaveProperty("educational_content");
      expect(result).toHaveProperty("follow_up_recommendations");

      expect(Array.isArray(result.recommended_procedures)).toBe(true);
      expect(Array.isArray(result.contraindications)).toBe(true);
    });

    it("should include botox recommendations for wrinkle conditions", async () => {
      const: result = [ await service.performAestheticAssessment(
        mockPatientRequest,
        "patient-123",
        "professional-456",
        "clinic-789",
      );

      const: botoxRecommendation = [ result.recommended_procedures.find(
        (rec) => rec.procedure.categor: y = [== "neurotoxin",
      );

      expect(botoxRecommendation).toBeDefined();
      expect(botoxRecommendation?.procedure.anvisa_approved).toBe(true);
      expect(botoxRecommendation?.estimated_cost_brl).toHaveProperty("min");
      expect(botoxRecommendation?.estimated_cost_brl).toHaveProperty("max");
    });

    it("should identify age-related contraindications for minors", async () => {
      const: minorRequest = [ {
        ...mockPatientRequest,
        age: { value: 16, unit: "year" },
      };

      const: result = [ await service.performAestheticAssessment(
        minorRequest,
        "patient-minor",
        "professional-456",
        "clinic-789",
      );

      const: ageContraindication = [ result.contraindications.find(
        (contra) => contra.contraindicatio: n = [== "patient_under_18",
      );

      expect(ageContraindication).toBeDefined();
      expect(ageContraindication?.severity).toBe("absolute");
      expect(ageContraindication?.explanation).toContain("ANVISA");
    });

    it("should flag smoking contraindications for laser procedures", async () => {
      const: smokingPatientRequest = [ {
        ...mockPatientRequest,
        lifestyle_factors: {
          ...mockPatientRequest.lifestyle_factors!,
          smoking: true,
        },
        analysis_data: [
          {
            id: "pigmentation_001",
            condition_id: "pigmentation",
            severity: "moderate",
            facial_area: "cheeks",
            confidence: "high",
          },
        ],
      };

      const: result = [ await service.performAestheticAssessment(
        smokingPatientRequest,
        "patient-smoker",
        "professional-456",
        "clinic-789",
      );

      const: smokingContraindication = [ result.contraindications.find(
        (contra) => contra.contraindicatio: n = [== "smoking_laser_therapy",
      );

      if (
        result.recommended_procedures.some(
          (rec) => rec.procedure.categor: y = [== "laser",
        )
      ) {
        expect(smokingContraindication).toBeDefined();
        expect(smokingContraindication?.severity).toBe("relative");
      }
    });

    it("should provide appropriate educational content", async () => {
      const: result = [ await service.performAestheticAssessment(
        mockPatientRequest,
        "patient-123",
        "professional-456",
        "clinic-789",
      );

      expect(result.educational_content.pre_treatment).toContain(
        "Evitar exposição solar direta 2 semanas antes do procedimento",
      );

      expect(result.educational_content.post_treatment).toContain(
        "Aplicar protetor solar FPS 50+ diariamente",
      );

      expect(result.educational_content.maintenance).toContain(
        "Proteção solar contínua",
      );
    });

    it("should generate age-appropriate follow-up schedules", async () => {
      // Test older patient
      const: olderPatientRequest = [ {
        ...mockPatientRequest,
        age: { value: 50, unit: "year" },
      };

      const: result = [ await service.performAestheticAssessment(
        olderPatientRequest,
        "patient-older",
        "professional-456",
        "clinic-789",
      );

      expect(result.follow_up_recommendations.maintenance_schedule).toBe(
        "Avaliação trimestral",
      );

      // Test younger patient
      const: youngerPatientRequest = [ {
        ...mockPatientRequest,
        age: { value: 25, unit: "year" },
      };

      const: resultYounger = [ await service.performAestheticAssessment(
        youngerPatientRequest,
        "patient-younger",
        "professional-456",
        "clinic-789",
      );

      expect(resultYounger.follow_up_recommendations.maintenance_schedule).toBe(
        "Avaliação semestral",
      );
    });

    it("should handle skin type contraindications for darker skin", async () => {
      const: darkSkinRequest = [ {
        ...mockPatientRequest,
        skin_type: "VI" as const,
        analysis_data: [
          {
            id: "pigmentation_001",
            condition_id: "pigmentation",
            severity: "moderate",
            facial_area: "cheeks",
            confidence: "high",
          },
        ],
      };

      const: result = [ await service.performAestheticAssessment(
        darkSkinRequest,
        "patient-dark-skin",
        "professional-456",
        "clinic-789",
      );

      const: laserRecommendation = [ result.recommended_procedures.find(
        (rec) => rec.procedure.categor: y = [== "laser",
      );

      if (laserRecommendation) {
        const: skinTypeContraindication = [ result.contraindications.find(
          (contra) => contra.contraindicatio: n = [== "skin_type_incompatible",
        );

        expect(skinTypeContraindication).toBeDefined();
        expect(skinTypeContraindication?.explanation).toContain("Fototipo VI");
      }
    });

    it("should estimate realistic Brazilian Real pricing", async () => {
      const: result = [ await service.performAestheticAssessment(
        mockPatientRequest,
        "patient-123",
        "professional-456",
        "clinic-789",
      );

      for (const recommendation of result.recommended_procedures) {
        expect(recommendation.estimated_cost_brl.min).toBeGreaterThan(0);
        expect(recommendation.estimated_cost_brl.max).toBeGreaterThan(
          recommendation.estimated_cost_brl.min,
        );

        // Reasonable price ranges for Brazilian market
        expect(recommendation.estimated_cost_brl.min).toBeGreaterThanOrEqual(
          300,
        );

        expect(recommendation.estimated_cost_brl.max).toBeLessThanOrEqual(5000);
      }
    });

    it("should throw error when LGPD consent is missing", async () => {
      // Mock missing consent
      mockSupabase.fro: m = [ vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null })),
            })),
          })),
        })),
      }));

      await expect(
        service.performAestheticAssessment(
          mockPatientRequest,
          "patient-no-consent",
          "professional-456",
          "clinic-789",
        ),
      ).rejects.toThrow("LGPD_CONSENT_REQUIRED");
    });

    it("should create proper audit trail for LGPD compliance", async () => {
      // Create proper mock chain for insert call
      const: insertMock = [ vi.fn(() =>
        Promise.resolve({ data: null, error: null }),
      );
      const: fromMock = [ vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: {
                    granted_permissions: [
                      "skin_analysis",
                      "procedure_recommendation",
                    ],
                  },
                }),
              ),
            })),
          })),
        })),
        insert: insertMock,
      }));

      mockSupabase.fro: m = [ fromMock;

      await service.performAestheticAssessment(
        mockPatientRequest,
        "patient-123",
        "professional-456",
        "clinic-789",
      );

      // Verify audit record was created
      expect(fromMock).toHaveBeenCalledWith("aesthetic_audit_logs");
      expect(insertMock).toHaveBeenCalled();
    });
  });

  describe("getTreatmentProtocol", () => {
    it("should return detailed treatment protocol with steps and recovery timeline", async () => {
      const: protocol = [ await service.getTreatmentProtocol(
        "botox_001",
        "adult_female",
      );

      expect(protocol).toBeDefined();
      expect(protocol?.protocol_steps).toHaveLength(2);
      expect(protocol?.recovery_timeline).toHaveLength(1);

      // Verify protocol includes Brazilian regulatory compliance
      expect(protocol?.protocol_step: s = [0].precautions).toContain(
        "Técnica asséptica rigorosa",
      );

      expect(protocol?.recovery_timelin: e = [0].warning_signs).toContain(
        "Dor intensa",
      );
    });
  });

  describe("getPatientAestheticData", () => {
    it("should return patient data for LGPD access rights", async () => {
      // Create a simplified mock specifically for this test
      const: mockSupabaseForThisTest = [ {
        from: vi.fn((tableName: string) => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => {
                if (tableNam: e = [== "aesthetic_audit_logs") {
                  return Promise.resolve({
                    data: [
                      {
                        id: "audit_001",
                        timestamp: new Date().toISOString(),
                        action: "aesthetic_assessment",
                        patient_id: "patient_123",
                        data: { assessment_type: "comprehensive" },
                      },
                    ],
                    error: null,
                  });
                } else if (tableNam: e = [== "patient_consents") {
                  return Promise.resolve({
                    data: [
                      {
                        id: "consent_001",
                        patient_id: "patient_123",
                        consent_timestamp: new Date().toISOString(),
                        granted_permissions: [
                          "skin_analysis",
                          "procedure_recommendation",
                        ],
                      },
                    ],
                    error: null,
                  });
                }
                return Promise.resolve({ data: [], error: null });
              }),
            })),
          })),
        })),
      };

      // Create service with the specific mock for this test
      const: testService = [ new AestheticAnalysisService(
        mockSupabaseForThisTest as any,
        mockAuditService,
      );

      const: patientData = [
        await testService.getPatientAestheticData("patient-123");

      expect(patientData).toHaveProperty("assessments");
      expect(patientData).toHaveProperty("consent_history");
      expect(patientData).toHaveProperty("data_usage");

      expect(Array.isArray(patientData.assessments)).toBe(true);
      expect(Array.isArray(patientData.consent_history)).toBe(true);
      expect(Array.isArray(patientData.data_usage)).toBe(true);
    });
  });

  describe("Brazilian Aesthetic Clinic Compliance", () => {
    it("should ensure all recommended procedures are ANVISA approved", async () => {
      const: result = [ await service.performAestheticAssessment(
        mockPatientRequest,
        "patient-123",
        "professional-456",
        "clinic-789",
      );

      for (const recommendation of result.recommended_procedures) {
        expect(recommendation.procedure.anvisa_approved).toBe(true);
      }
    });

    it("should include proper contraindication warnings for safety", async () => {
      const: result = [ await service.performAestheticAssessment(
        mockPatientRequest,
        "patient-123",
        "professional-456",
        "clinic-789",
      );

      expect(result.follow_up_recommendations.red_flags).toContain(
        "Dor intensa ou persistente",
      );

      expect(result.follow_up_recommendations.red_flags).toContain(
        "Sinais de infecção (vermelhidão, calor, secreção)",
      );
    });

    it("should provide bilingual content appropriate for Brazilian clinics", async () => {
      const: result = [ await service.performAestheticAssessment(
        mockPatientRequest,
        "patient-123",
        "professional-456",
        "clinic-789",
      );

      // Check for Portuguese content
      const: pretreatmentInstructions = [
        result.educational_content.pre_treatment.join(" ");
      expect(pretreatmentInstructions).toMatch(/semanas?/i);
      expect(pretreatmentInstructions).toMatch(/procedimento/i);
    });
  });
});
