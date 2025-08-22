/**
 * CFM (Conselho Federal de Medicina) Compliance Service
 *
 * Implements Brazilian medical professional validation and compliance
 * according to CFM regulations for aesthetic medicine.
 *
 * @compliance CFM Resolution 1974/2011, 2217/2018, 2336/2023
 * @healthcare Professional validation and medical ethics
 * @quality ≥9.8/10 Healthcare Grade
 */
import { z } from 'zod';
export declare enum CFMSpecialty {
    DERMATOLOGY = "DERMATOLOGY",
    PLASTIC_SURGERY = "PLASTIC_SURGERY",
    FACIAL_SURGERY = "FACIAL_SURGERY",
    GENERAL_MEDICINE = "GENERAL_MEDICINE"
}
export declare enum CFMProfessionalStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
    CANCELLED = "CANCELLED"
}
export declare enum CFMProcedureLevel {
    BASIC = "BASIC",// Non-invasive procedures
    INTERMEDIATE = "INTERMEDIATE",// Minimally invasive
    ADVANCED = "ADVANCED",// Invasive procedures
    SURGICAL = "SURGICAL"
}
declare const CFMProfessionalSchema: z.ZodObject<{
    id: z.ZodString;
    crmNumber: z.ZodString;
    crmState: z.ZodString;
    fullName: z.ZodString;
    cpf: z.ZodString;
    rg: z.ZodString;
    birthDate: z.ZodDate;
    email: z.ZodString;
    phone: z.ZodString;
    address: z.ZodObject<{
        street: z.ZodString;
        number: z.ZodString;
        complement: z.ZodOptional<z.ZodString>;
        neighborhood: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        number: string;
        city: string;
        state: string;
        street: string;
        neighborhood: string;
        zipCode: string;
        complement?: string | undefined;
    }, {
        number: string;
        city: string;
        state: string;
        street: string;
        neighborhood: string;
        zipCode: string;
        complement?: string | undefined;
    }>;
    specialty: z.ZodNativeEnum<typeof CFMSpecialty>;
    status: z.ZodNativeEnum<typeof CFMProfessionalStatus>;
    registrationDate: z.ZodDate;
    lastUpdate: z.ZodDate;
    certifications: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        institution: z.ZodString;
        issueDate: z.ZodDate;
        expiryDate: z.ZodOptional<z.ZodDate>;
        certificateNumber: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        institution: string;
        issueDate: Date;
        certificateNumber: string;
        expiryDate?: Date | undefined;
    }, {
        name: string;
        institution: string;
        issueDate: Date;
        certificateNumber: string;
        expiryDate?: Date | undefined;
    }>, "many">;
    authorizedProcedures: z.ZodArray<z.ZodString, "many">;
    maxProcedureLevel: z.ZodNativeEnum<typeof CFMProcedureLevel>;
    digitalSignature: z.ZodOptional<z.ZodObject<{
        certificateId: z.ZodString;
        issuer: z.ZodString;
        validUntil: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        validUntil: Date;
        certificateId: string;
        issuer: string;
    }, {
        validUntil: Date;
        certificateId: string;
        issuer: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: CFMProfessionalStatus;
    id: string;
    crmNumber: string;
    crmState: string;
    registrationDate: Date;
    email: string;
    address: {
        number: string;
        city: string;
        state: string;
        street: string;
        neighborhood: string;
        zipCode: string;
        complement?: string | undefined;
    };
    phone: string;
    cpf: string;
    rg: string;
    specialty: CFMSpecialty;
    fullName: string;
    birthDate: Date;
    lastUpdate: Date;
    certifications: {
        name: string;
        institution: string;
        issueDate: Date;
        certificateNumber: string;
        expiryDate?: Date | undefined;
    }[];
    authorizedProcedures: string[];
    maxProcedureLevel: CFMProcedureLevel;
    digitalSignature?: {
        validUntil: Date;
        certificateId: string;
        issuer: string;
    } | undefined;
}, {
    status: CFMProfessionalStatus;
    id: string;
    crmNumber: string;
    crmState: string;
    registrationDate: Date;
    email: string;
    address: {
        number: string;
        city: string;
        state: string;
        street: string;
        neighborhood: string;
        zipCode: string;
        complement?: string | undefined;
    };
    phone: string;
    cpf: string;
    rg: string;
    specialty: CFMSpecialty;
    fullName: string;
    birthDate: Date;
    lastUpdate: Date;
    certifications: {
        name: string;
        institution: string;
        issueDate: Date;
        certificateNumber: string;
        expiryDate?: Date | undefined;
    }[];
    authorizedProcedures: string[];
    maxProcedureLevel: CFMProcedureLevel;
    digitalSignature?: {
        validUntil: Date;
        certificateId: string;
        issuer: string;
    } | undefined;
}>;
declare const CFMProcedureAuthorizationSchema: z.ZodObject<{
    procedureType: z.ZodString;
    requiredSpecialty: z.ZodArray<z.ZodNativeEnum<typeof CFMSpecialty>, "many">;
    minimumLevel: z.ZodNativeEnum<typeof CFMProcedureLevel>;
    requiredCertifications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    description: z.ZodString;
    restrictions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    procedureType: string;
    requiredSpecialty: CFMSpecialty[];
    minimumLevel: CFMProcedureLevel;
    requiredCertifications?: string[] | undefined;
    restrictions?: string[] | undefined;
}, {
    description: string;
    procedureType: string;
    requiredSpecialty: CFMSpecialty[];
    minimumLevel: CFMProcedureLevel;
    requiredCertifications?: string[] | undefined;
    restrictions?: string[] | undefined;
}>;
declare const CFMEthicsComplianceSchema: z.ZodObject<{
    professionalId: z.ZodString;
    patientId: z.ZodString;
    procedureId: z.ZodString;
    informedConsent: z.ZodObject<{
        obtained: z.ZodBoolean;
        date: z.ZodDate;
        witnessId: z.ZodOptional<z.ZodString>;
        documentId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        date: Date;
        obtained: boolean;
        documentId: string;
        witnessId?: string | undefined;
    }, {
        date: Date;
        obtained: boolean;
        documentId: string;
        witnessId?: string | undefined;
    }>;
    medicalRecord: z.ZodObject<{
        preOperativeAssessment: z.ZodString;
        medicalHistory: z.ZodString;
        currentMedications: z.ZodOptional<z.ZodString>;
        allergies: z.ZodOptional<z.ZodString>;
        contraindications: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        medicalHistory: string;
        preOperativeAssessment: string;
        allergies?: string | undefined;
        contraindications?: string | undefined;
        currentMedications?: string | undefined;
    }, {
        medicalHistory: string;
        preOperativeAssessment: string;
        allergies?: string | undefined;
        contraindications?: string | undefined;
        currentMedications?: string | undefined;
    }>;
    followUp: z.ZodObject<{
        scheduled: z.ZodBoolean;
        appointments: z.ZodArray<z.ZodObject<{
            date: z.ZodDate;
            notes: z.ZodString;
            complications: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            date: Date;
            notes: string;
            complications?: string | undefined;
        }, {
            date: Date;
            notes: string;
            complications?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        scheduled: boolean;
        appointments: {
            date: Date;
            notes: string;
            complications?: string | undefined;
        }[];
    }, {
        scheduled: boolean;
        appointments: {
            date: Date;
            notes: string;
            complications?: string | undefined;
        }[];
    }>;
    ethicsCompliance: z.ZodBoolean;
    complianceNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    procedureId: string;
    professionalId: string;
    informedConsent: {
        date: Date;
        obtained: boolean;
        documentId: string;
        witnessId?: string | undefined;
    };
    medicalRecord: {
        medicalHistory: string;
        preOperativeAssessment: string;
        allergies?: string | undefined;
        contraindications?: string | undefined;
        currentMedications?: string | undefined;
    };
    followUp: {
        scheduled: boolean;
        appointments: {
            date: Date;
            notes: string;
            complications?: string | undefined;
        }[];
    };
    ethicsCompliance: boolean;
    complianceNotes?: string | undefined;
}, {
    patientId: string;
    procedureId: string;
    professionalId: string;
    informedConsent: {
        date: Date;
        obtained: boolean;
        documentId: string;
        witnessId?: string | undefined;
    };
    medicalRecord: {
        medicalHistory: string;
        preOperativeAssessment: string;
        allergies?: string | undefined;
        contraindications?: string | undefined;
        currentMedications?: string | undefined;
    };
    followUp: {
        scheduled: boolean;
        appointments: {
            date: Date;
            notes: string;
            complications?: string | undefined;
        }[];
    };
    ethicsCompliance: boolean;
    complianceNotes?: string | undefined;
}>;
export type CFMProfessional = z.infer<typeof CFMProfessionalSchema>;
export type CFMProcedureAuthorization = z.infer<typeof CFMProcedureAuthorizationSchema>;
export type CFMEthicsCompliance = z.infer<typeof CFMEthicsComplianceSchema>;
/**
 * CFM Compliance Service
 *
 * Handles Brazilian medical professional validation and ethics compliance
 * according to CFM (Federal Council of Medicine) regulations.
 */
export declare class CFMService {
    private readonly procedureAuthorizations;
    /**
     * Validate professional credentials with CFM
     */
    validateProfessional(crmNumber: string, crmState: string): Promise<{
        success: boolean;
        professional?: CFMProfessional;
        error?: string;
    }>;
    /**
     * Check if professional is authorized for specific procedure
     */
    checkProcedureAuthorization(professionalId: string, procedureType: string): Promise<{
        authorized: boolean;
        reason?: string;
        requirements?: string[];
    }>;
    /**
     * Validate medical ethics compliance for a procedure
     */
    validateEthicsCompliance(complianceData: unknown): Promise<{
        compliant: boolean;
        violations?: string[];
        recommendations?: string[];
    }>;
    /**
     * Generate CFM compliance report
     */
    generateComplianceReport(professionalId: string, dateRange: {
        startDate: Date;
        endDate: Date;
    }): Promise<{
        success: boolean;
        report?: {
            professionalInfo: CFMProfessional;
            totalProcedures: number;
            complianceRate: number;
            violations: number;
            certificationStatus: 'valid' | 'expiring' | 'expired';
            recommendations: string[];
        };
        error?: string;
    }>;
    private validateCRMFormat;
    private queryCFMDatabase;
    private getProfessionalById;
    private compareProcedureLevel;
    private getProfessionalProcedures;
    private getComplianceChecks;
    private checkCertificationStatus;
    private generateRecommendations;
    private auditLog;
}
/**
 * Factory function to create CFM service instance
 */
export declare function createCFMService(): CFMService;
/**
 * CFM compliance utilities
 */
export declare const cfmUtils: {
    /**
     * Format CRM number for display
     */
    formatCRM: (crmNumber: string, crmState: string) => string;
    /**
     * Validate CPF format
     */
    validateCPF: (cpf: string) => boolean;
    /**
     * Get specialty display name
     */
    getSpecialtyDisplayName: (specialty: CFMSpecialty) => string;
    /**
     * Get procedure level display name
     */
    getProcedureLevelDisplayName: (level: CFMProcedureLevel) => string;
};
export default CFMService;
