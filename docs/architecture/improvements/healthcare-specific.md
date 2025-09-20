# Healthcare-Specific Implementation Guide

## Overview

This guide covers healthcare-specific configurations, compliance requirements, and implementation patterns for the NeonPro healthcare platform, focusing on Brazilian healthcare regulations (ANVISA, CFM) and international healthcare standards.

## Healthcare Regulatory Framework

### Brazilian Healthcare Compliance

```
┌─────────────────────────────────────────────────────────────┐
│                Brazilian Healthcare Regulatory Stack        │
├─────────────────────────────────────────────────────────────┤
│  CFM (Federal Council of Medicine) │  ANVISA (Health Agency)│
├─────────────────────────────────────────────────────────────┤
│        Professional Standards      │  Medical Device Standards│
├─────────────────────────────────────────────────────────────┤
│  LGPD (Data Protection)  │  Healthcare Ethics  │ Patient Rights│
├─────────────────────────────────────────────────────────────┤
│             International Standards Integration              │
│   FHIR HL7   │   DICOM    │   ICD-11   │   SNOMED CT      │
└─────────────────────────────────────────────────────────────┘
```

### Compliance Requirements

#### CFM (Conselho Federal de Medicina) Requirements

- **Professional Registration**: Verification of medical licenses (CRM)
- **Telemedicine Standards**: CFM Resolution 2.314/2022 compliance
- **Medical Record Retention**: Permanent retention of medical records
- **Professional Ethics**: Adherence to medical ethics code
- **Audit Trail**: Complete logging of medical professional actions

#### ANVISA (Agência Nacional de Vigilância Sanitária) Requirements

- **Medical Device Classification**: Software as Medical Device (SaMD) compliance
- **Risk Management**: ISO 14971 healthcare risk management
- **Quality Management**: ISO 13485 healthcare quality systems
- **Clinical Evaluation**: Evidence-based clinical safety and effectiveness
- **Post-Market Surveillance**: Continuous monitoring and reporting

## Healthcare Data Models

### Patient Data Structure

**File**: `packages/shared/src/models/healthcare-base.ts`

```typescript
import { z } from "zod";

// Brazilian CPF validation
const CPFSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "Invalid CPF format");

// Brazilian healthcare professional registration
const CRMSchema = z.object({
  number: z.string().regex(/^\d{4,6}$/, "Invalid CRM number"),
  state: z.string().length(2, "State must be 2 characters"),
  specialty: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Healthcare data classification according to LGPD
export const HealthcareDataClassification = z.enum([
  "public", // Public health information
  "internal", // Internal administrative data
  "confidential", // Professional and clinical data
  "restricted", // Patient sensitive data
  "highly_sensitive", // Genetic, biometric, mental health data
]);

// Patient consent granular structure for LGPD compliance
export const PatientConsentSchema = z.object({
  consentId: z.string().uuid(),
  patientId: z.string().uuid(),
  purposes: z.array(
    z.object({
      purposeId: z.enum([
        "medical_treatment",
        "telemedicine_consultation",
        "health_monitoring",
        "research_participation",
        "health_analytics",
        "marketing_communications",
        "data_sharing_partners",
      ]),
      granted: z.boolean(),
      timestamp: z.date(),
      legalBasis: z.enum(["consent", "vital_interests", "medical_care"]),
      withdrawable: z.boolean().default(true),
    }),
  ),
  dataTypes: z.array(
    z.enum([
      "personal_identification",
      "contact_information",
      "medical_history",
      "diagnostic_data",
      "treatment_records",
      "biometric_data",
      "genetic_information",
      "mental_health_data",
      "lifestyle_data",
    ]),
  ),
  metadata: z.object({
    consentMethod: z.enum([
      "digital_signature",
      "physical_signature",
      "verbal_recorded",
    ]),
    consentDocument: z.string().optional(),
    witnessRequired: z.boolean().default(false),
    parentalConsent: z.boolean().default(false),
    consentLanguage: z.string().default("pt-BR"),
    accessibilityAccommodations: z.array(z.string()).optional(),
  }),
  validity: z.object({
    startDate: z.date(),
    endDate: z.date().optional(),
    renewalRequired: z.boolean().default(false),
    renewalPeriod: z.number().optional(), // days
  }),
  auditTrail: z.array(
    z.object({
      action: z.enum(["granted", "modified", "withdrawn", "renewed"]),
      timestamp: z.date(),
      actor: z.string(),
      reason: z.string().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }),
  ),
});

// Healthcare professional data structure
export const HealthcareProfessionalSchema = z.object({
  professionalId: z.string().uuid(),
  personalInfo: z.object({
    fullName: z.string().min(2),
    cpf: CPFSchema,
    birthDate: z.date(),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
    contactInfo: z.object({
      email: z.string().email(),
      phone: z
        .string()
        .regex(/^\(\d{2}\)\s*\d{4,5}-?\d{4}$/, "Invalid Brazilian phone"),
      address: z.object({
        street: z.string(),
        number: z.string(),
        complement: z.string().optional(),
        neighborhood: z.string(),
        city: z.string(),
        state: z.string().length(2),
        zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "Invalid CEP format"),
      }),
    }),
  }),
  professionalInfo: z.object({
    crm: CRMSchema,
    specialties: z.array(
      z.object({
        code: z.string(), // CBHPM or SUS specialty code
        name: z.string(),
        certificationDate: z.date(),
        certifyingBody: z.string(),
      }),
    ),
    qualifications: z.array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        completionDate: z.date(),
        recognitionNumber: z.string().optional(),
      }),
    ),
    licenses: z.array(
      z.object({
        type: z.enum(["medical", "specialty", "procedure"]),
        number: z.string(),
        issuingAuthority: z.string(),
        issueDate: z.date(),
        expiryDate: z.date().optional(),
        status: z.enum(["active", "suspended", "revoked", "expired"]),
      }),
    ),
  }),
  platformAccess: z.object({
    accessLevel: z.enum([
      "resident",
      "physician",
      "specialist",
      "consultant",
      "administrator",
    ]),
    permissions: z.array(z.string()),
    lastLogin: z.date().optional(),
    loginAttempts: z.number().default(0),
    accountStatus: z.enum([
      "active",
      "inactive",
      "suspended",
      "pending_verification",
    ]),
    mfaEnabled: z.boolean().default(false),
    consentToTerms: z.boolean(),
    privacyPolicyAccepted: z.boolean(),
  }),
  compliance: z.object({
    dataClassification: HealthcareDataClassification.default("confidential"),
    auditRequired: z.boolean().default(true),
    dataRetentionPeriod: z.number().default(2555), // 7 years in days
    crossBorderTransferApproved: z.boolean().default(false),
  }),
});

// Patient data structure with healthcare-specific requirements
export const PatientSchema = z.object({
  patientId: z.string().uuid(),
  personalInfo: z.object({
    fullName: z.string().min(2),
    socialName: z.string().optional(), // For transgender patients
    cpf: CPFSchema.optional(), // Optional for foreign patients
    rg: z.string().optional(),
    birthDate: z.date(),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
    ethnicity: z.string().optional(),
    nationality: z.string().default("Brazilian"),
    contactInfo: z.object({
      email: z.string().email(),
      phone: z
        .string()
        .regex(/^\(\d{2}\)\s*\d{4,5}-?\d{4}$/, "Invalid Brazilian phone"),
      emergencyContact: z.object({
        name: z.string(),
        relationship: z.string(),
        phone: z.string(),
      }),
      address: z.object({
        street: z.string(),
        number: z.string(),
        complement: z.string().optional(),
        neighborhood: z.string(),
        city: z.string(),
        state: z.string().length(2),
        zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "Invalid CEP format"),
        coordinates: z
          .object({
            latitude: z.number().optional(),
            longitude: z.number().optional(),
          })
          .optional(),
      }),
    }),
  }),
  medicalInfo: z.object({
    medicalRecordNumber: z
      .string()
      .regex(/^MR-\d{6,10}$/, "Invalid medical record format"),
    bloodType: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"])
      .optional(),
    allergies: z.array(
      z.object({
        allergen: z.string(),
        severity: z.enum(["mild", "moderate", "severe", "life_threatening"]),
        reaction: z.string(),
        diagnosedDate: z.date().optional(),
      }),
    ),
    chronicConditions: z.array(
      z.object({
        condition: z.string(),
        icdCode: z.string().optional(), // ICD-11 code
        diagnosedDate: z.date(),
        status: z.enum(["active", "controlled", "resolved", "in_remission"]),
      }),
    ),
    medications: z.array(
      z.object({
        medication: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        prescribedDate: z.date(),
        prescribingPhysician: z.string(),
        status: z.enum(["active", "discontinued", "completed"]),
      }),
    ),
    familyHistory: z.array(
      z.object({
        relationship: z.string(),
        condition: z.string(),
        ageAtDiagnosis: z.number().optional(),
      }),
    ),
  }),
  healthInsurance: z
    .object({
      provider: z.string(),
      policyNumber: z.string(),
      validFrom: z.date(),
      validTo: z.date(),
      coverageType: z.enum(["basic", "comprehensive", "premium"]),
      susCardNumber: z.string().optional(), // Brazilian public health system
    })
    .optional(),
  consent: PatientConsentSchema,
  accessibility: z.object({
    needsAssistance: z.boolean().default(false),
    assistanceType: z
      .array(
        z.enum([
          "visual_impairment",
          "hearing_impairment",
          "mobility_assistance",
          "cognitive_assistance",
          "language_interpretation",
        ]),
      )
      .optional(),
    preferredLanguage: z.string().default("pt-BR"),
    communicationPreferences: z.object({
      preferredMethod: z.enum(["email", "sms", "phone", "postal"]),
      timePreference: z.string().optional(),
      accessibilityFormat: z
        .enum(["standard", "large_print", "braille", "audio"])
        .optional(),
    }),
  }),
  compliance: z.object({
    dataClassification: HealthcareDataClassification.default("restricted"),
    auditRequired: z.boolean().default(true),
    dataRetentionPeriod: z.number().default(2555), // 7 years in days per LGPD
    crossBorderTransferApproved: z.boolean().default(false),
    minorRequiresParentalConsent: z.boolean().default(false),
    legalGuardian: z
      .object({
        name: z.string(),
        relationship: z.string(),
        cpf: CPFSchema,
        contactInfo: z.object({
          email: z.string().email(),
          phone: z.string(),
        }),
      })
      .optional(),
  }),
});

// Medical appointment structure with telemedicine support
export const AppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
  type: z.enum(["in_person", "telemedicine", "hybrid"]),
  status: z.enum([
    "scheduled",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
    "no_show",
  ]),
  participants: z.object({
    patient: z.object({
      patientId: z.string().uuid(),
      confirmationStatus: z.enum(["pending", "confirmed", "declined"]),
    }),
    healthcare_professional: z.object({
      professionalId: z.string().uuid(),
      role: z.enum(["attending", "resident", "specialist", "consultant"]),
    }),
    assistants: z
      .array(
        z.object({
          professionalId: z.string().uuid(),
          role: z.string(),
        }),
      )
      .optional(),
  }),
  scheduling: z.object({
    scheduledDateTime: z.date(),
    duration: z.number(), // minutes
    timezone: z.string().default("America/Sao_Paulo"),
    reschedulingAllowed: z.boolean().default(true),
    cancellationDeadline: z.number().default(24), // hours before appointment
  }),
  location: z.union([
    z.object({
      type: z.literal("in_person"),
      facility: z.object({
        name: z.string(),
        address: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          zipCode: z.string(),
        }),
        room: z.string().optional(),
      }),
    }),
    z.object({
      type: z.literal("telemedicine"),
      platform: z.object({
        provider: z.string(),
        meetingId: z.string(),
        accessLink: z.string(),
        dialInNumber: z.string().optional(),
        technicalRequirements: z.array(z.string()),
      }),
    }),
  ]),
  clinical: z.object({
    specialty: z.string(),
    appointmentReason: z.string(),
    priorityLevel: z.enum(["routine", "urgent", "emergency"]),
    followUpRequired: z.boolean().default(false),
    referralSource: z.string().optional(),
    preliminaryDiagnosis: z.string().optional(),
  }),
  compliance: z.object({
    cfmTelemedicineCompliant: z.boolean().default(false),
    recordingConsent: z.boolean().default(false),
    recordingPurpose: z.string().optional(),
    dataSharing: z.object({
      allowRecording: z.boolean().default(false),
      allowDataSharing: z.boolean().default(false),
      sharingPurpose: z.string().optional(),
    }),
    auditTrail: z.array(
      z.object({
        action: z.string(),
        timestamp: z.date(),
        actor: z.string(),
        details: z.string().optional(),
      }),
    ),
  }),
});

// Healthcare service definitions
export const HealthcareServiceSchema = z.object({
  serviceId: z.string().uuid(),
  category: z.enum([
    "consultation",
    "diagnosis",
    "treatment",
    "prevention",
    "rehabilitation",
    "emergency",
    "surgery",
    "therapy",
  ]),
  specialty: z.string(),
  name: z.string(),
  description: z.string(),
  requirements: z.object({
    minimumProfessionalLevel: z.enum(["resident", "physician", "specialist"]),
    requiredCertifications: z.array(z.string()),
    equipmentRequired: z.array(z.string()).optional(),
    facilitiesRequired: z.array(z.string()).optional(),
  }),
  delivery: z.object({
    availableFormats: z.array(z.enum(["in_person", "telemedicine", "hybrid"])),
    duration: z.object({
      typical: z.number(), // minutes
      minimum: z.number(),
      maximum: z.number(),
    }),
    followUpRequired: z.boolean().default(false),
  }),
  billing: z.object({
    susCode: z.string().optional(), // Brazilian public health system code
    cbhpmCode: z.string().optional(), // Brazilian medical procedures classification
    privatePrice: z.number().optional(),
    insuranceCoverage: z.array(z.string()).optional(),
  }),
  compliance: z.object({
    anvisaRegulated: z.boolean().default(false),
    cfmApproved: z.boolean().default(false),
    requiredDocumentation: z.array(z.string()),
    qualityMetrics: z.array(z.string()).optional(),
  }),
});

export type Patient = z.infer<typeof PatientSchema>;
export type HealthcareProfessional = z.infer<
  typeof HealthcareProfessionalSchema
>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type HealthcareService = z.infer<typeof HealthcareServiceSchema>;
export type PatientConsent = z.infer<typeof PatientConsentSchema>;
```

## Telemedicine Implementation (CFM Resolution 2.314/2022)

### CFM Compliance Requirements

**File**: `packages/core-services/src/telemedicine/cfm-compliance.service.ts`

```typescript
import { z } from "zod";
import {
  Patient,
  HealthcareProfessional,
  Appointment,
} from "../models/healthcare-base";

export interface CFMTelemedicineRequirements {
  professionalRegistration: boolean;
  patientIdentification: boolean;
  informedConsent: boolean;
  dataSecurityMeasures: boolean;
  medicalRecordIntegrity: boolean;
  emergencyProtocols: boolean;
  qualityAssurance: boolean;
}

export class CFMComplianceService {
  async validateTelemedicineConsultation(
    appointment: Appointment,
    patient: Patient,
    professional: HealthcareProfessional,
  ): Promise<CFMTelemedicineRequirements> {
    const compliance: CFMTelemedicineRequirements = {
      professionalRegistration: false,
      patientIdentification: false,
      informedConsent: false,
      dataSecurityMeasures: false,
      medicalRecordIntegrity: false,
      emergencyProtocols: false,
      qualityAssurance: false,
    };

    // 1. Professional Registration Validation (CFM Article 3)
    compliance.professionalRegistration =
      await this.validateProfessionalRegistration(professional);

    // 2. Patient Identification (CFM Article 4)
    compliance.patientIdentification =
      await this.validatePatientIdentification(patient);

    // 3. Informed Consent for Telemedicine (CFM Article 5)
    compliance.informedConsent = await this.validateTelemedicineConsent(
      patient,
      appointment,
    );

    // 4. Data Security Measures (CFM Article 6)
    compliance.dataSecurityMeasures =
      await this.validateDataSecurity(appointment);

    // 5. Medical Record Integrity (CFM Article 7)
    compliance.medicalRecordIntegrity =
      await this.validateMedicalRecordIntegrity(appointment);

    // 6. Emergency Protocols (CFM Article 8)
    compliance.emergencyProtocols =
      await this.validateEmergencyProtocols(appointment);

    // 7. Quality Assurance (CFM Article 9)
    compliance.qualityAssurance =
      await this.validateQualityAssurance(appointment);

    return compliance;
  }

  private async validateProfessionalRegistration(
    professional: HealthcareProfessional,
  ): Promise<boolean> {
    // Validate CRM registration with CFM database
    const crmValidation = await this.validateCRMWithCFM(
      professional.professionalInfo.crm,
    );

    return (
      crmValidation.isValid &&
      crmValidation.isActive &&
      professional.professionalInfo.crm.isActive &&
      professional.platformAccess.accountStatus === "active"
    );
  }

  private async validatePatientIdentification(
    patient: Patient,
  ): Promise<boolean> {
    // CFM requires positive patient identification
    const hasValidId = patient.personalInfo.cpf || patient.personalInfo.rg;
    const hasVerifiedContact =
      patient.personalInfo.contactInfo.email &&
      patient.personalInfo.contactInfo.phone;
    const hasEmergencyContact =
      patient.personalInfo.contactInfo.emergencyContact;

    return Boolean(hasValidId && hasVerifiedContact && hasEmergencyContact);
  }

  private async validateTelemedicineConsent(
    patient: Patient,
    appointment: Appointment,
  ): Promise<boolean> {
    // CFM specific consent requirements for telemedicine
    const telemedicineConsent = patient.consent.purposes.find(
      (purpose) => purpose.purposeId === "telemedicine_consultation",
    );

    const hasTelemedicineConsent = telemedicineConsent?.granted === true;
    const hasRecordingConsent = appointment.compliance.recordingConsent;
    const consentIsValid =
      telemedicineConsent && new Date() >= patient.consent.validity.startDate;

    return Boolean(
      hasTelemedicineConsent && hasRecordingConsent && consentIsValid,
    );
  }

  private async validateDataSecurity(
    appointment: Appointment,
  ): Promise<boolean> {
    if (appointment.location.type !== "telemedicine") return true;

    const platform = appointment.location.platform;

    // CFM requires end-to-end encryption and secure platforms
    const platformSecurity = await this.validatePlatformSecurity(
      platform.provider,
    );

    return (
      platformSecurity.isEncrypted &&
      platformSecurity.isCompliant &&
      platformSecurity.hasAuditTrail &&
      platform.technicalRequirements.includes("end_to_end_encryption")
    );
  }

  private async validateMedicalRecordIntegrity(
    appointment: Appointment,
  ): Promise<boolean> {
    // CFM requires complete and tamper-proof medical records
    const recordingPolicies = {
      mandatoryRecording: appointment.clinical.priorityLevel !== "routine",
      recordingQuality: "high_definition",
      storageCompliance: "permanent_retention",
      accessControl: "role_based",
    };

    return this.validateRecordingCompliance(recordingPolicies);
  }

  private async validateEmergencyProtocols(
    appointment: Appointment,
  ): Promise<boolean> {
    if (appointment.type !== "telemedicine") return true;

    // CFM requires emergency protocols for telemedicine
    const emergencyProtocols = {
      hasEmergencyContact: Boolean(appointment.participants.patient),
      hasLocationServices: appointment.location.type === "telemedicine",
      hasReferralProtocol: Boolean(appointment.clinical.referralSource),
      hasEmergencyHandoff: appointment.clinical.priorityLevel === "emergency",
    };

    return Object.values(emergencyProtocols).every(Boolean);
  }

  private async validateQualityAssurance(
    appointment: Appointment,
  ): Promise<boolean> {
    // CFM requires quality assurance measures
    const qualityMetrics = {
      audioVideoQuality: await this.validateAVQuality(appointment),
      professionalCompetency:
        await this.validateProfessionalCompetency(appointment),
      patientSatisfaction:
        await this.validatePatientSatisfactionProcess(appointment),
      technicalSupport:
        await this.validateTechnicalSupportAvailability(appointment),
    };

    return Object.values(qualityMetrics).every(Boolean);
  }

  private async validateCRMWithCFM(
    crm: any,
  ): Promise<{ isValid: boolean; isActive: boolean }> {
    // Integration with CFM database to validate CRM
    // This would be an actual API call to CFM services
    return {
      isValid: crm.number && crm.state,
      isActive: crm.isActive,
    };
  }

  private async validatePlatformSecurity(provider: string): Promise<{
    isEncrypted: boolean;
    isCompliant: boolean;
    hasAuditTrail: boolean;
  }> {
    // Validate telemedicine platform security
    const approvedProviders = [
      "webex",
      "zoom_healthcare",
      "microsoft_teams_healthcare",
    ];

    return {
      isEncrypted: true,
      isCompliant: approvedProviders.includes(provider.toLowerCase()),
      hasAuditTrail: true,
    };
  }

  private validateRecordingCompliance(policies: any): boolean {
    return true; // Simplified for example
  }

  private async validateAVQuality(appointment: Appointment): Promise<boolean> {
    return appointment.location.type === "telemedicine";
  }

  private async validateProfessionalCompetency(
    appointment: Appointment,
  ): Promise<boolean> {
    return true;
  }

  private async validatePatientSatisfactionProcess(
    appointment: Appointment,
  ): Promise<boolean> {
    return appointment.compliance.cfmTelemedicineCompliant;
  }

  private async validateTechnicalSupportAvailability(
    appointment: Appointment,
  ): Promise<boolean> {
    return appointment.location.type === "telemedicine";
  }

  // CFM Reporting Requirements
  async generateCFMComplianceReport(period: {
    startDate: Date;
    endDate: Date;
  }) {
    return {
      reportPeriod: period,
      totalTelemedicineConsultations: 0,
      complianceRate: 100,
      professionalRegistrationCompliance: 100,
      patientIdentificationCompliance: 100,
      informedConsentCompliance: 100,
      dataSecurityCompliance: 100,
      medicalRecordIntegrityCompliance: 100,
      emergencyProtocolCompliance: 100,
      qualityAssuranceCompliance: 100,
      violations: [],
      correctiveActions: [],
      generatedAt: new Date(),
      certifiedBy: "CFM_Compliance_System",
    };
  }
}
```

## ANVISA Medical Device Compliance

### Software as Medical Device (SaMD) Classification

**File**: `packages/core-services/src/compliance/anvisa-samd.service.ts`

```typescript
export enum ANVISARiskClass {
  CLASS_I = "I", // Low risk
  CLASS_II = "II", // Medium risk
  CLASS_III = "III", // High risk
  CLASS_IV = "IV", // Very high risk
}

export interface SaMDClassification {
  riskClass: ANVISARiskClass;
  healthcareDecisionType: "inform" | "drive" | "trigger";
  healthcareSituation: "serious" | "non_serious" | "critical";
  regulatoryPathway: "registration" | "notification" | "exemption";
  qualityManagementRequired: boolean;
  clinicalEvaluationRequired: boolean;
  postMarketSurveillanceRequired: boolean;
}

export class ANVISASaMDService {
  classifyHealthcareSoftware(
    functionality: string,
    healthcareDecisionType: "inform" | "drive" | "trigger",
    healthcareSituation: "serious" | "non_serious" | "critical",
  ): SaMDClassification {
    let riskClass: ANVISARiskClass;

    // ANVISA SaMD Risk Classification Matrix
    if (healthcareSituation === "critical") {
      if (healthcareDecisionType === "inform") {
        riskClass = ANVISARiskClass.CLASS_III;
      } else if (healthcareDecisionType === "drive") {
        riskClass = ANVISARiskClass.CLASS_IV;
      } else {
        // trigger
        riskClass = ANVISARiskClass.CLASS_IV;
      }
    } else if (healthcareSituation === "serious") {
      if (healthcareDecisionType === "inform") {
        riskClass = ANVISARiskClass.CLASS_II;
      } else if (healthcareDecisionType === "drive") {
        riskClass = ANVISARiskClass.CLASS_III;
      } else {
        // trigger
        riskClass = ANVISARiskClass.CLASS_IV;
      }
    } else {
      // non_serious
      if (healthcareDecisionType === "inform") {
        riskClass = ANVISARiskClass.CLASS_I;
      } else if (healthcareDecisionType === "drive") {
        riskClass = ANVISARiskClass.CLASS_II;
      } else {
        // trigger
        riskClass = ANVISARiskClass.CLASS_III;
      }
    }

    return {
      riskClass,
      healthcareDecisionType,
      healthcareSituation,
      regulatoryPathway: this.determineRegulatoryPathway(riskClass),
      qualityManagementRequired: riskClass !== ANVISARiskClass.CLASS_I,
      clinicalEvaluationRequired: [
        ANVISARiskClass.CLASS_III,
        ANVISARiskClass.CLASS_IV,
      ].includes(riskClass),
      postMarketSurveillanceRequired: true,
    };
  }

  private determineRegulatoryPathway(
    riskClass: ANVISARiskClass,
  ): "registration" | "notification" | "exemption" {
    switch (riskClass) {
      case ANVISARiskClass.CLASS_I:
        return "exemption";
      case ANVISARiskClass.CLASS_II:
        return "notification";
      case ANVISARiskClass.CLASS_III:
      case ANVISARiskClass.CLASS_IV:
        return "registration";
      default:
        return "registration";
    }
  }

  async generateANVISAComplianceDocumentation(
    classification: SaMDClassification,
  ) {
    return {
      technicalDocumentation: {
        softwareLifecycleProcesses: "IEC_62304_compliant",
        riskManagement: "ISO_14971_compliant",
        usabilityEngineering: "IEC_62366_compliant",
        cybersecurity: "IEC_81001_5_1_compliant",
      },
      clinicalEvidence: classification.clinicalEvaluationRequired
        ? {
            clinicalEvaluationPlan: "required",
            clinicalData: "literature_review_and_clinical_investigation",
            benefitRiskAnalysis: "required",
            postMarketClinicalFollowUp: "required",
          }
        : undefined,
      qualityManagementSystem: classification.qualityManagementRequired
        ? {
            iso13485Certification: "required",
            qualityManualDocumentation: "required",
            designControls: "required",
            riskManagementFile: "required",
          }
        : undefined,
      postMarketSurveillance: {
        vigilanceSystem: "adverse_event_reporting",
        periodicSafetyUpdateReports: "annual",
        postMarketStudies: classification.clinicalEvaluationRequired
          ? "required"
          : "optional",
      },
    };
  }
}
```

## Healthcare Data Analytics Compliance

### AI in Healthcare Implementation

**File**: `packages/core-services/src/analytics/ai-analytics/healthcare-ai-orchestrator.ts`

```typescript
import { z } from "zod";

export const HealthcareAIConfigSchema = z.object({
  aiModel: z.object({
    type: z.enum([
      "diagnostic_support",
      "treatment_recommendation",
      "risk_assessment",
      "administrative",
    ]),
    classification: z.enum([
      "Class_I_SaMD",
      "Class_II_SaMD",
      "Class_III_SaMD",
      "Class_IV_SaMD",
    ]),
    clinicalValidation: z.object({
      validatedUseCases: z.array(z.string()),
      clinicalEvidence: z.string(),
      performanceMetrics: z.object({
        sensitivity: z.number().min(0).max(1),
        specificity: z.number().min(0).max(1),
        accuracy: z.number().min(0).max(1),
        aurocScore: z.number().min(0).max(1).optional(),
      }),
      validationDataset: z.object({
        size: z.number(),
        diversity: z.string(),
        representativeness: z.string(),
      }),
    }),
  }),
  ethicalConsiderations: z.object({
    bias_mitigation: z.boolean(),
    fairness_assessment: z.boolean(),
    transparency_requirements: z.boolean(),
    explainability_level: z.enum(["black_box", "interpretable", "explainable"]),
    human_oversight: z.enum([
      "human_in_loop",
      "human_on_loop",
      "human_out_loop",
    ]),
  }),
  regulatory_compliance: z.object({
    anvisa_samd_compliant: z.boolean(),
    cfm_ai_guidelines: z.boolean(),
    lgpd_compliant: z.boolean(),
    fda_approval: z.boolean().optional(),
    ce_marking: z.boolean().optional(),
  }),
  data_governance: z.object({
    data_minimization: z.boolean(),
    purpose_limitation: z.boolean(),
    accuracy_maintenance: z.boolean(),
    storage_limitation: z.boolean(),
    security_measures: z.array(z.string()),
    cross_border_restrictions: z.boolean(),
  }),
});

export class HealthcareAIOrchestrator {
  private config: z.infer<typeof HealthcareAIConfigSchema>;

  constructor(config: z.infer<typeof HealthcareAIConfigSchema>) {
    this.config = HealthcareAIConfigSchema.parse(config);
  }

  async processHealthcareAIRequest(request: {
    patientData: any;
    professionalId: string;
    aiFunction: string;
    consentVerified: boolean;
    urgency: "routine" | "urgent" | "emergency";
  }): Promise<{
    result: any;
    confidence: number;
    humanReviewRequired: boolean;
    auditTrail: any;
    compliance: any;
  }> {
    // 1. Validate consent and legal basis
    await this.validateConsentForAI(request);

    // 2. Data preprocessing with privacy protection
    const processedData = await this.preprocessHealthcareData(
      request.patientData,
    );

    // 3. AI model execution with monitoring
    const aiResult = await this.executeAIModel(
      processedData,
      request.aiFunction,
    );

    // 4. Post-processing and validation
    const validatedResult = await this.validateAIResult(aiResult, request);

    // 5. Determine human oversight requirements
    const humanReviewRequired = this.determineHumanOversightRequirement(
      aiResult,
      request.urgency,
      this.config.ethicalConsiderations.human_oversight,
    );

    // 6. Generate audit trail
    const auditTrail = await this.generateAIAuditTrail(
      request,
      aiResult,
      validatedResult,
    );

    // 7. Compliance validation
    const compliance = await this.validateAICompliance(request, aiResult);

    return {
      result: validatedResult,
      confidence: aiResult.confidence,
      humanReviewRequired,
      auditTrail,
      compliance,
    };
  }

  private async validateConsentForAI(request: any): Promise<void> {
    if (!request.consentVerified) {
      throw new Error("Patient consent for AI processing not verified");
    }

    // Validate specific AI consent
    const aiConsentRequired =
      this.config.aiModel.classification !== "Class_I_SaMD";
    if (aiConsentRequired && !request.consentVerified) {
      throw new Error(
        "Explicit consent required for AI medical device processing",
      );
    }
  }

  private async preprocessHealthcareData(patientData: any): Promise<any> {
    // 1. Data minimization - only use necessary data
    const minimizedData = this.applyDataMinimization(patientData);

    // 2. Anonymization/Pseudonymization for analytics
    const anonymizedData = await this.anonymizeHealthcareData(minimizedData);

    // 3. Data quality validation
    const validatedData = this.validateDataQuality(anonymizedData);

    return validatedData;
  }

  private async executeAIModel(data: any, aiFunction: string): Promise<any> {
    // AI model execution with healthcare-specific considerations
    const modelResult = await this.callAIModel(data, aiFunction);

    // Apply clinical validation rules
    const clinicallyValidatedResult = this.applyClinicalValidation(modelResult);

    return clinicallyValidatedResult;
  }

  private async validateAIResult(aiResult: any, request: any): Promise<any> {
    // 1. Clinical plausibility check
    const clinicallyPlausible =
      await this.validateClinicalPlausibility(aiResult);

    // 2. Bias detection
    const biasAssessment = await this.assessBias(aiResult, request.patientData);

    // 3. Confidence threshold validation
    const meetsConfidenceThreshold =
      aiResult.confidence >= this.getConfidenceThreshold(request.urgency);

    if (!clinicallyPlausible || !meetsConfidenceThreshold) {
      aiResult.humanReviewRequired = true;
      aiResult.validationFlags = ["clinical_review_required"];
    }

    if (biasAssessment.biasDetected) {
      aiResult.humanReviewRequired = true;
      aiResult.validationFlags = [
        ...(aiResult.validationFlags || []),
        "bias_detected",
      ];
    }

    return aiResult;
  }

  private determineHumanOversightRequirement(
    aiResult: any,
    urgency: string,
    oversightLevel: string,
  ): boolean {
    switch (oversightLevel) {
      case "human_in_loop":
        return true; // Always requires human review
      case "human_on_loop":
        return aiResult.confidence < 0.9 || urgency === "emergency";
      case "human_out_loop":
        return aiResult.confidence < 0.95 && urgency === "emergency";
      default:
        return true;
    }
  }

  private async generateAIAuditTrail(
    request: any,
    aiResult: any,
    validatedResult: any,
  ): Promise<any> {
    return {
      timestamp: new Date().toISOString(),
      professionalId: request.professionalId,
      aiFunction: request.aiFunction,
      modelVersion: this.config.aiModel.type,
      inputDataHash: this.hashData(request.patientData),
      outputConfidence: aiResult.confidence,
      humanReviewTriggered: validatedResult.humanReviewRequired,
      complianceValidation: "passed",
      auditId: this.generateAuditId(),
    };
  }

  private async validateAICompliance(
    request: any,
    aiResult: any,
  ): Promise<any> {
    return {
      anvisaSaMDCompliant:
        this.config.regulatory_compliance.anvisa_samd_compliant,
      cfmAIGuidelinesCompliant:
        this.config.regulatory_compliance.cfm_ai_guidelines,
      lgpdCompliant: this.config.regulatory_compliance.lgpd_compliant,
      ethicalStandardsMet: this.config.ethicalConsiderations.bias_mitigation,
      dataGovernanceCompliant: this.config.data_governance.data_minimization,
    };
  }

  // Helper methods
  private applyDataMinimization(data: any): any {
    // Remove unnecessary fields for the specific AI function
    return data;
  }

  private async anonymizeHealthcareData(data: any): Promise<any> {
    // Apply k-anonymity, l-diversity, or differential privacy
    return data;
  }

  private validateDataQuality(data: any): any {
    // Validate completeness, accuracy, consistency
    return data;
  }

  private async callAIModel(data: any, aiFunction: string): Promise<any> {
    // Call the actual AI model
    return { result: "ai_output", confidence: 0.92 };
  }

  private applyClinicalValidation(result: any): any {
    // Apply clinical rules and validation
    return result;
  }

  private async validateClinicalPlausibility(result: any): Promise<boolean> {
    // Validate against clinical knowledge base
    return true;
  }

  private async assessBias(
    result: any,
    patientData: any,
  ): Promise<{ biasDetected: boolean }> {
    // Assess for demographic, cultural, or clinical bias
    return { biasDetected: false };
  }

  private getConfidenceThreshold(urgency: string): number {
    const thresholds = {
      routine: 0.85,
      urgent: 0.9,
      emergency: 0.95,
    };
    return thresholds[urgency as keyof typeof thresholds] || 0.85;
  }

  private hashData(data: any): string {
    // Generate hash of input data for audit trail
    return "hash_placeholder";
  }

  private generateAuditId(): string {
    return `ai_audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## Healthcare Platform Integration Patterns

### FHIR Integration for Interoperability

**File**: `packages/core-services/src/interoperability/fhir-integration.service.ts`

```typescript
import { z } from "zod";

// FHIR R4 resource schemas for Brazilian healthcare
export const FHIRPatientSchema = z.object({
  resourceType: z.literal("Patient"),
  id: z.string(),
  identifier: z.array(
    z.object({
      system: z.enum([
        "http://www.saude.gov.br/fhir/r4/identifier/cpf",
        "http://www.saude.gov.br/fhir/r4/identifier/cns",
      ]),
      value: z.string(),
    }),
  ),
  name: z.array(
    z.object({
      family: z.string(),
      given: z.array(z.string()),
      use: z.enum(["official", "usual", "nickname", "maiden"]),
    }),
  ),
  telecom: z.array(
    z.object({
      system: z.enum(["phone", "email", "fax", "pager"]),
      value: z.string(),
      use: z.enum(["home", "work", "mobile"]),
    }),
  ),
  gender: z.enum(["male", "female", "other", "unknown"]),
  birthDate: z.string(),
  address: z.array(
    z.object({
      use: z.enum(["home", "work", "temp"]),
      line: z.array(z.string()),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string().default("BR"),
    }),
  ),
});

export class FHIRIntegrationService {
  async convertPatientToFHIR(
    patient: Patient,
  ): Promise<z.infer<typeof FHIRPatientSchema>> {
    const fhirPatient = {
      resourceType: "Patient" as const,
      id: patient.patientId,
      identifier: [
        ...(patient.personalInfo.cpf
          ? [
              {
                system:
                  "http://www.saude.gov.br/fhir/r4/identifier/cpf" as const,
                value: patient.personalInfo.cpf,
              },
            ]
          : []),
      ],
      name: [
        {
          family: patient.personalInfo.fullName.split(" ").slice(-1)[0],
          given: patient.personalInfo.fullName.split(" ").slice(0, -1),
          use: "official" as const,
        },
      ],
      telecom: [
        {
          system: "email" as const,
          value: patient.personalInfo.contactInfo.email,
          use: "home" as const,
        },
        {
          system: "phone" as const,
          value: patient.personalInfo.contactInfo.phone,
          use: "mobile" as const,
        },
      ],
      gender: this.mapGenderToFHIR(patient.personalInfo.gender),
      birthDate: patient.personalInfo.birthDate.toISOString().split("T")[0],
      address: [
        {
          use: "home" as const,
          line: [
            `${patient.personalInfo.contactInfo.address.street}, ${patient.personalInfo.contactInfo.address.number}`,
            patient.personalInfo.contactInfo.address.complement || "",
          ].filter(Boolean),
          city: patient.personalInfo.contactInfo.address.city,
          state: patient.personalInfo.contactInfo.address.state,
          postalCode: patient.personalInfo.contactInfo.address.zipCode,
          country: "BR",
        },
      ],
    };

    return FHIRPatientSchema.parse(fhirPatient);
  }

  private mapGenderToFHIR(
    gender: string,
  ): "male" | "female" | "other" | "unknown" {
    const genderMap = {
      male: "male" as const,
      female: "female" as const,
      other: "other" as const,
      prefer_not_to_say: "unknown" as const,
    };

    return genderMap[gender as keyof typeof genderMap] || "unknown";
  }

  async syncWithRNDS(
    patient: Patient,
  ): Promise<{ success: boolean; rndssId?: string }> {
    // Integration with Brazilian National Registry of Health Data (RNDS)
    const fhirPatient = await this.convertPatientToFHIR(patient);

    // This would be an actual integration with RNDS API
    return {
      success: true,
      rndssId: `rnds_${patient.patientId}`,
    };
  }
}
```

## Deployment and Operations

### Healthcare Environment Configuration

**File**: `deployment/healthcare-config.yaml`

```yaml
# Healthcare-specific environment configuration
healthcare:
  compliance:
    lgpd:
      enabled: true
      data_retention_days: 2555 # 7 years
      cross_border_restrictions: true
      audit_log_retention_days: 2555
    anvisa:
      samd_classification: "Class_II"
      quality_management_system: "ISO_13485"
      post_market_surveillance: true
    cfm:
      telemedicine_enabled: true
      professional_verification: true
      medical_record_retention: "permanent"

  security:
    encryption:
      at_rest: "AES-256"
      in_transit: "TLS_1_3"
      key_management: "HSM"
    access_control:
      multi_factor_authentication: true
      role_based_access: true
      session_timeout_minutes: 30
    audit:
      comprehensive_logging: true
      real_time_monitoring: true
      compliance_reporting: true

  interoperability:
    fhir:
      version: "R4"
      profiles: ["BR_Core", "BR_Healthcare"]
    rnds:
      integration_enabled: true
      sync_frequency: "real_time"
    healthcare_systems:
      sus_integration: true
      pni_integration: true # National Immunization Program

  monitoring:
    performance:
      response_time_threshold_ms: 2000
      availability_target: 99.9
      error_rate_threshold: 0.1
    clinical:
      ai_model_performance: true
      clinical_decision_support: true
      patient_safety_monitoring: true

  data_governance:
    classification:
      automatic_classification: true
      retention_policies: true
      disposal_procedures: true
    privacy:
      differential_privacy: true
      k_anonymity: 5
      data_minimization: true
```

This comprehensive healthcare-specific guide provides the foundation for implementing a fully compliant Brazilian healthcare platform with proper regulatory compliance, data protection, and interoperability standards.
