/**
 * ANVISA Compliance Service
 *
 * Implements Brazilian ANVISA (Agência Nacional de Vigilância Sanitária)
 * compliance for medical devices and aesthetic procedures.
 *
 * @compliance ANVISA RDC 185/2001, RDC 67/2007, RDC 44/2009
 * @healthcare Medical device software compliance
 * @quality ≥9.8/10 Healthcare Grade
 */
import { z } from 'zod';
export declare enum AnvisaDeviceClass {
    CLASS_I = "CLASS_I",// Low risk
    CLASS_II = "CLASS_II",// Medium risk
    CLASS_III = "CLASS_III",// High risk
    CLASS_IV = "CLASS_IV"
}
export declare enum AnvisaSoftwareClass {
    CLASS_A = "A",// Non-injury or damage to health
    CLASS_B = "B",// Non-life-threatening injury
    CLASS_C = "C"
}
declare const AnvisaProductSchema: z.ZodObject<{
    id: z.ZodString;
    productName: z.ZodString;
    manufacturer: z.ZodString;
    registrationNumber: z.ZodString;
    deviceClass: z.ZodNativeEnum<typeof AnvisaDeviceClass>;
    softwareClass: z.ZodOptional<z.ZodNativeEnum<typeof AnvisaSoftwareClass>>;
    description: z.ZodString;
    intendedUse: z.ZodString;
    contraindications: z.ZodOptional<z.ZodString>;
    adverseEffects: z.ZodOptional<z.ZodString>;
    registrationDate: z.ZodDate;
    expiryDate: z.ZodDate;
    isActive: z.ZodDefault<z.ZodBoolean>;
    clinicalData: z.ZodOptional<z.ZodObject<{
        clinicalTrials: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        safetyProfile: z.ZodOptional<z.ZodString>;
        efficacyData: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        clinicalTrials?: string[] | undefined;
        safetyProfile?: string | undefined;
        efficacyData?: string | undefined;
    }, {
        clinicalTrials?: string[] | undefined;
        safetyProfile?: string | undefined;
        efficacyData?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    id: string;
    isActive: boolean;
    manufacturer: string;
    intendedUse: string;
    registrationDate: Date;
    productName: string;
    registrationNumber: string;
    deviceClass: AnvisaDeviceClass;
    expiryDate: Date;
    contraindications?: string | undefined;
    softwareClass?: AnvisaSoftwareClass | undefined;
    adverseEffects?: string | undefined;
    clinicalData?: {
        clinicalTrials?: string[] | undefined;
        safetyProfile?: string | undefined;
        efficacyData?: string | undefined;
    } | undefined;
}, {
    description: string;
    id: string;
    manufacturer: string;
    intendedUse: string;
    registrationDate: Date;
    productName: string;
    registrationNumber: string;
    deviceClass: AnvisaDeviceClass;
    expiryDate: Date;
    isActive?: boolean | undefined;
    contraindications?: string | undefined;
    softwareClass?: AnvisaSoftwareClass | undefined;
    adverseEffects?: string | undefined;
    clinicalData?: {
        clinicalTrials?: string[] | undefined;
        safetyProfile?: string | undefined;
        efficacyData?: string | undefined;
    } | undefined;
}>;
declare const AnvisaProcedureSchema: z.ZodObject<{
    id: z.ZodString;
    procedureType: z.ZodEnum<["botox_injection", "dermal_filler", "chemical_peel", "laser_treatment", "microneedling", "cryolipolysis", "radiofrequency", "ultrasound_therapy"]>;
    productIds: z.ZodArray<z.ZodString, "many">;
    patientId: z.ZodString;
    professionalId: z.ZodString;
    procedureDate: z.ZodDate;
    location: z.ZodString;
    dosage: z.ZodOptional<z.ZodString>;
    technique: z.ZodOptional<z.ZodString>;
    preOperativeAssessment: z.ZodString;
    postOperativeInstructions: z.ZodString;
    followUpSchedule: z.ZodString;
    adverseEventReporting: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    id: string;
    professionalId: string;
    procedureType: "botox_injection" | "dermal_filler" | "chemical_peel" | "laser_treatment" | "microneedling" | "cryolipolysis" | "radiofrequency" | "ultrasound_therapy";
    preOperativeAssessment: string;
    productIds: string[];
    procedureDate: Date;
    location: string;
    postOperativeInstructions: string;
    followUpSchedule: string;
    adverseEventReporting: boolean;
    dosage?: string | undefined;
    technique?: string | undefined;
}, {
    patientId: string;
    id: string;
    professionalId: string;
    procedureType: "botox_injection" | "dermal_filler" | "chemical_peel" | "laser_treatment" | "microneedling" | "cryolipolysis" | "radiofrequency" | "ultrasound_therapy";
    preOperativeAssessment: string;
    productIds: string[];
    procedureDate: Date;
    location: string;
    postOperativeInstructions: string;
    followUpSchedule: string;
    dosage?: string | undefined;
    technique?: string | undefined;
    adverseEventReporting?: boolean | undefined;
}>;
declare const AnvisaAdverseEventSchema: z.ZodObject<{
    id: z.ZodString;
    procedureId: z.ZodString;
    productId: z.ZodString;
    patientId: z.ZodString;
    professionalId: z.ZodString;
    eventType: z.ZodEnum<["allergic_reaction", "infection", "asymmetry", "necrosis", "granuloma", "migration", "other"]>;
    severity: z.ZodEnum<["mild", "moderate", "severe", "life_threatening"]>;
    description: z.ZodString;
    onset: z.ZodDate;
    resolution: z.ZodOptional<z.ZodDate>;
    actions: z.ZodString;
    reportedToAnvisa: z.ZodDefault<z.ZodBoolean>;
    anvisaReportNumber: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    eventType: "allergic_reaction" | "infection" | "asymmetry" | "necrosis" | "granuloma" | "migration" | "other";
    severity: "moderate" | "life_threatening" | "mild" | "severe";
    patientId: string;
    description: string;
    id: string;
    procedureId: string;
    professionalId: string;
    createdAt: Date;
    productId: string;
    onset: Date;
    actions: string;
    reportedToAnvisa: boolean;
    resolution?: Date | undefined;
    anvisaReportNumber?: string | undefined;
}, {
    eventType: "allergic_reaction" | "infection" | "asymmetry" | "necrosis" | "granuloma" | "migration" | "other";
    severity: "moderate" | "life_threatening" | "mild" | "severe";
    patientId: string;
    description: string;
    id: string;
    procedureId: string;
    professionalId: string;
    createdAt: Date;
    productId: string;
    onset: Date;
    actions: string;
    resolution?: Date | undefined;
    reportedToAnvisa?: boolean | undefined;
    anvisaReportNumber?: string | undefined;
}>;
export type AnvisaProduct = z.infer<typeof AnvisaProductSchema>;
export type AnvisaProcedure = z.infer<typeof AnvisaProcedureSchema>;
export type AnvisaAdverseEvent = z.infer<typeof AnvisaAdverseEventSchema>;
/**
 * ANVISA Compliance Service
 *
 * Handles Brazilian medical device and aesthetic procedure compliance
 * according to ANVISA regulations.
 */
export declare class AnvisaService {
    /**
     * Register a medical device/product with ANVISA compliance data
     */
    registerProduct(productData: unknown): Promise<{
        success: boolean;
        product?: AnvisaProduct;
        error?: string;
    }>;
    /**
     * Record an aesthetic procedure with ANVISA compliance
     */
    recordProcedure(procedureData: unknown): Promise<{
        success: boolean;
        procedure?: AnvisaProcedure;
        error?: string;
    }>;
    /**
     * Report adverse event to ANVISA
     */
    reportAdverseEvent(eventData: unknown): Promise<{
        success: boolean;
        event?: AnvisaAdverseEvent;
        anvisaReportNumber?: string;
        error?: string;
    }>;
    /**
     * Generate compliance report for ANVISA audit
     */
    generateComplianceReport(dateRange: {
        startDate: Date;
        endDate: Date;
    }): Promise<{
        success: boolean;
        report?: {
            totalProcedures: number;
            productUsage: Record<string, number>;
            adverseEvents: number;
            complianceScore: number;
            recommendations: string[];
        };
        error?: string;
    }>;
    private validateRegistrationNumber;
    private validateProductRegistration;
    private validateProfessional;
    private generateAnvisaReportNumber;
    private submitToAnvisa;
    private getProceduresInRange;
    private getAdverseEventsInRange;
    private getProductUsage;
    private calculateComplianceScore;
    private generateRecommendations;
    private auditLog;
}
/**
 * Factory function to create ANVISA service instance
 */
export declare function createAnvisaService(): AnvisaService;
/**
 * ANVISA compliance utilities
 */
export declare const anvisaUtils: {
    /**
     * Validate ANVISA registration number format
     */
    validateRegistrationNumber: (regNumber: string) => boolean;
    /**
     * Format ANVISA registration number for display
     */
    formatRegistrationNumber: (regNumber: string) => string;
    /**
     * Get device class requirements
     */
    getDeviceClassRequirements: (deviceClass: AnvisaDeviceClass) => string[];
    /**
     * Check if procedure requires special authorization
     */
    requiresSpecialAuthorization: (procedureType: string) => boolean;
};
export default AnvisaService;
