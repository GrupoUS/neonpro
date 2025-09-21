import { describe, it, expect, beforeEach } from "vitest";
import {
  ClinicalKPI,
  PatientSafetyKPI,
  QualityOfCareKPI,
  PatientOutcomeKPI,
  InfectionControlKPI,
  PatientSatisfactionKPI,
  ClinicalEfficiencyKPI,
  MedicationManagementKPI,
  DiagnosticAccuracyKPI,
  ClinicalCategory,
  isClinicalKPI,
  isPatientSafetyKPI,
  createPatientSafetyKPI,
  createQualityOfCareKPI,
  createPatientOutcomeKPI,
  calculateClinicalQualityScore,
  validateClinicalCompliance,
} from "../types/clinical-kpis";

describe(_"Clinical KPIs",_() => {
  describe(_"ClinicalKPI type guards",_() => {
    it(_"should identify valid clinical KPIs",_() => {
      const kpi = createPatientSafetyKPI({
        name: "medication_error_rate",
        value: 2.5,
        clinicId: "clinic_123",
        safetyCategory: "medication_safety",
        incidentCount: 5,
        totalEvents: 200,
      });

      expect(isClinicalKPI(kpi)).toBe(true);
      expect(isPatientSafetyKPI(kpi)).toBe(true);
    });

    it(_"should reject invalid clinical KPIs",_() => {
      expect(isClinicalKPI({})).toBe(false);
      expect(isClinicalKPI(null)).toBe(false);
      expect(isClinicalKPI({ id: "test", name: "test" })).toBe(false);
    });
  });

  describe(_"Patient Safety KPI",_() => {
    let safetyKPI: PatientSafetyKPI;

    beforeEach(_() => {
      safetyKPI = createPatientSafetyKPI({
        name: "fall_rate",
        value: 1.2,
        clinicId: "clinic_123",
        safetyCategory: "patient_falls",
        incidentCount: 3,
        totalEvents: 250,
      });
    });

    it(_"should create a valid patient safety KPI",_() => {
      expect(safetyKPI.category).toBe("patient_safety");
      expect(safetyKPI.name).toBe("fall_rate");
      expect(safetyKPI.value).toBe(1.2);
      expect(safetyKPI.safetyCategory).toBe("patient_falls");
      expect(safetyKPI.incidentCount).toBe(3);
      expect(safetyKPI.totalEvents).toBe(250);
    });

    it(_"should calculate safety rate correctly",_() => {
      expect(safetyKPI.safetyRate).toBeCloseTo(1.2, 1);
    });

    it(_"should include incident details",_() => {
      expect(safetyKPI.incidentDetails).toBeDefined();
      expect(safetyKPI.incidentDetails.reportingMechanism).toBe("electronic");
      expect(safetyKPI.incidentDetails.investigationRequired).toBe(true);
    });

    it(_"should have appropriate risk level for safety incidents",_() => {
      expect(["MEDIUM", "HIGH"]).toContain(safetyKPI.riskLevel);
    });
  });

  describe(_"Quality of Care KPI",_() => {
    let qualityKPI: QualityOfCareKPI;

    beforeEach(_() => {
      qualityKPI = createQualityOfCareKPI({
        name: "care_coordination_score",
        value: 4.5,
        clinicId: "clinic_123",
        qualityDimension: "care_coordination",
        measurementStandard: "CFM",
      });
    });

    it(_"should create a valid quality of care KPI",_() => {
      expect(qualityKPI.category).toBe("quality_of_care");
      expect(qualityKPI.qualityDimension).toBe("care_coordination");
      expect(qualityKPI.measurementStandard).toBe("CFM");
    });

    it(_"should include evidence-based practice tracking",_() => {
      expect(qualityKPI.evidenceBasedPractice).toBeDefined();
      expect(
        qualityKPI.evidenceBasedPractice.guidelineCompliance,
      ).toBeGreaterThanOrEqual(0);
      expect(
        qualityKPI.evidenceBasedPractice.guidelineCompliance,
      ).toBeLessThanOrEqual(100);
    });

    it(_"should track patient-centered care metrics",_() => {
      expect(qualityKPI.patientCenteredCare).toBeDefined();
      expect(
        qualityKPI.patientCenteredCare.sharedDecisionMaking,
      ).toBeGreaterThanOrEqual(0);
      expect(
        qualityKPI.patientCenteredCare.culturalSensitivity,
      ).toBeGreaterThanOrEqual(0);
    });
  });

  describe(_"Patient Outcome KPI",_() => {
    let outcomeKPI: PatientOutcomeKPI;

    beforeEach(_() => {
      outcomeKPI = createPatientOutcomeKPI({
        name: "recovery_rate",
        value: 92.5,
        clinicId: "clinic_123",
        outcomeType: "clinical_outcome",
        measurement: {
          baseline: 85.0,
          target: 95.0,
          current: 92.5,
          trend: "improving",
        },
      });
    });

    it(_"should create a valid patient outcome KPI",_() => {
      expect(outcomeKPI.category).toBe("patient_outcomes");
      expect(outcomeKPI.outcomeType).toBe("clinical_outcome");
      expect(outcomeKPI.measurement.current).toBe(92.5);
      expect(outcomeKPI.measurement.trend).toBe("improving");
    });

    it(_"should calculate outcome improvement correctly",_() => {
      const improvement =
        outcomeKPI.measurement.current - outcomeKPI.measurement.baseline;
      expect(improvement).toBe(7.5);
    });

    it(_"should track progress toward target",_() => {
      const progressToTarget =
        (outcomeKPI.measurement.current - outcomeKPI.measurement.baseline) /
        (outcomeKPI.measurement.target - outcomeKPI.measurement.baseline);
      expect(progressToTarget).toBeCloseTo(0.75, 2);
    });
  });

  describe(_"Infection Control KPI",_() => {
    it(_"should track infection rates and prevention measures",_() => {
      const infectionKPI: InfectionControlKPI = {
        id: "inf_001",
        name: "healthcare_associated_infections",
        description: "Rate of healthcare-associated infections",
        dataType: "percentage",
        value: 2.1,
        unit: "%",
        frequency: "monthly",
        aggregation: "average",
        status: "active",
        riskLevel: "MEDIUM",
        complianceFrameworks: ["ANVISA", "LGPD"],
        source: "infection_control_system",
        timestamp: new Date(),
        lastUpdated: new Date(),
        createdAt: new Date(),
        category: "infection_control",
        healthcareContext: {
          clinicId: "clinic_123",
        },
        infectionType: "healthcare_associated",
        infectionRate: 2.1,
        preventionMeasures: [
          "hand_hygiene",
          "ppe_compliance",
          "isolation_protocols",
        ],
        surveillanceData: {
          surveillanceType: "active",
          reportingFrequency: "daily",
          caseDefinition: "CDC_NHSN",
          riskFactorMonitoring: true,
        },
      };

      expect(infectionKPI.infectionType).toBe("healthcare_associated");
      expect(infectionKPI.preventionMeasures).toContain("hand_hygiene");
      expect(infectionKPI.surveillanceData.surveillanceType).toBe("active");
    });
  });

  describe(_"Patient Satisfaction KPI",_() => {
    it(_"should track patient experience metrics",_() => {
      const satisfactionKPI: PatientSatisfactionKPI = {
        id: "sat_001",
        name: "patient_satisfaction_score",
        description: "Overall patient satisfaction rating",
        dataType: "number",
        value: 4.3,
        unit: "score_1_5",
        frequency: "monthly",
        aggregation: "average",
        status: "active",
        riskLevel: "LOW",
        complianceFrameworks: ["LGPD"],
        source: "patient_survey_system",
        timestamp: new Date(),
        lastUpdated: new Date(),
        createdAt: new Date(),
        category: "patient_satisfaction",
        healthcareContext: {
          clinicId: "clinic_123",
        },
        satisfactionDimensions: {
          communication: 4.5,
          careQuality: 4.2,
          facilityComfort: 4.1,
          staffCourtesy: 4.4,
          overallExperience: 4.3,
        },
        surveyMetadata: {
          surveyType: "standard",
          responseRate: 78.5,
          sampleSize: 150,
          surveyPeriod: {
            start: new Date("2024-01-01"),
            end: new Date("2024-01-31"),
          },
        },
      };

      expect(satisfactionKPI.satisfactionDimensions.communication).toBe(4.5);
      expect(satisfactionKPI.surveyMetadata.responseRate).toBe(78.5);
      expect(satisfactionKPI.surveyMetadata.sampleSize).toBe(150);
    });
  });

  describe(_"Clinical Quality Score Calculation",_() => {
    it(_"should calculate comprehensive clinical quality score",_() => {
      const clinicalKPIs: ClinicalKPI[] = [
        createPatientSafetyKPI({
          name: "medication_error_rate",
          value: 1.5,
          clinicId: "clinic_123",
          safetyCategory: "medication_safety",
          incidentCount: 3,
          totalEvents: 200,
        }),
        createQualityOfCareKPI({
          name: "care_coordination_score",
          value: 4.2,
          clinicId: "clinic_123",
          qualityDimension: "care_coordination",
          measurementStandard: "CFM",
        }),
        createPatientOutcomeKPI({
          name: "recovery_rate",
          value: 88.5,
          clinicId: "clinic_123",
          outcomeType: "clinical_outcome",
          measurement: {
            baseline: 80.0,
            target: 90.0,
            current: 88.5,
            trend: "improving",
          },
        }),
      ];

      const qualityScore = calculateClinicalQualityScore(clinicalKPIs);

      expect(qualityScore.score).toBeGreaterThan(0);
      expect(qualityScore.score).toBeLessThanOrEqual(100);
      expect(qualityScore.level).toMatch(
        /^(excellent|good|fair|needs_improvement)$/,
      );
      expect(qualityScore.dimensions).toBeDefined();
      expect(qualityScore.dimensions.length).toBeGreaterThan(0);
    });

    it(_"should handle empty KPI array gracefully",_() => {
      const qualityScore = calculateClinicalQualityScore([]);

      expect(qualityScore.score).toBe(0);
      expect(qualityScore.level).toBe("needs_improvement");
      expect(qualityScore.dimensions).toHaveLength(0);
    });
  });

  describe(_"Clinical Compliance Validation",_() => {
    it(_"should validate ANVISA compliance for clinical metrics",_() => {
      const clinicalKPI = createPatientSafetyKPI({
        name: "adverse_drug_reactions",
        value: 3.2,
        clinicId: "clinic_123",
        safetyCategory: "medication_safety",
        incidentCount: 8,
        totalEvents: 250,
      });

      const compliance = validateClinicalCompliance(clinicalKPI);

      expect(compliance.compliant).toBeDefined();
      expect(compliance.requirements).toBeInstanceOf(Array);
      expect(compliance.recommendations).toBeInstanceOf(Array);
    });

    it(_"should validate CFM compliance for medical practice",_() => {
      const qualityKPI = createQualityOfCareKPI({
        name: "diagnostic_accuracy",
        value: 94.2,
        clinicId: "clinic_123",
        qualityDimension: "clinical_effectiveness",
        measurementStandard: "CFM",
      });

      const compliance = validateClinicalCompliance(qualityKPI);

      expect(compliance.requirements).toContain(
        "Medical practice must follow CFM ethical guidelines",
      );
      expect(compliance.recommendations).toContain(
        "Regular clinical audit recommended",
      );
    });

    it(_"should validate LGPD compliance for patient data",_() => {
      const outcomeKPI = createPatientOutcomeKPI({
        name: "patient_recovery",
        value: 87.3,
        clinicId: "clinic_123",
        outcomeType: "functional_outcome",
        measurement: {
          baseline: 75.0,
          target: 90.0,
          current: 87.3,
          trend: "stable",
        },
      });

      const compliance = validateClinicalCompliance(outcomeKPI);

      expect(compliance.requirements).toContain(
        "Patient data consent required for outcome tracking",
      );
      expect(compliance.recommendations).toContain(
        "Consider anonymization for quality improvement analytics",
      );
    });
  });

  describe(_"Clinical Category Validation",_() => {
    it(_"should validate all clinical categories",_() => {
      const categories: ClinicalCategory[] = [
        "patient_safety",
        "quality_of_care",
        "patient_outcomes",
        "infection_control",
        "patient_satisfaction",
        "clinical_efficiency",
        "medication_management",
        "diagnostic_accuracy",
        "care_coordination",
        "preventive_care",
        "chronic_disease_management",
        "emergency_response",
      ];

      categories.forEach(_(category) => {
        expect(typeof category).toBe("string");
        expect(category.length).toBeGreaterThan(0);
      });
    });
  });

  describe(_"Brazilian Healthcare Context",_() => {
    it("should handle SUS (Sistema Único de Saúde) metrics", () => {
      const susKPI = createQualityOfCareKPI({
        name: "sus_access_time",
        value: 15.5,
        clinicId: "clinic_123",
        qualityDimension: "accessibility",
        measurementStandard: "Ministry_of_Health",
      });

      expect(susKPI.healthcareContext.payerMix?.sus).toBeDefined();
      expect(susKPI.measurementStandard).toBe("Ministry_of_Health");
    });

    it("should track ANS (Agência Nacional de Saúde Suplementar) quality indicators", () => {
      const ansKPI = createQualityOfCareKPI({
        name: "supplementary_health_quality",
        value: 85.2,
        clinicId: "clinic_123",
        qualityDimension: "clinical_effectiveness",
        measurementStandard: "ANS",
      });

      expect(ansKPI.measurementStandard).toBe("ANS");
      expect(
        ansKPI.healthcareContext.payerMix?.private_insurance,
      ).toBeDefined();
    });
  });
});
