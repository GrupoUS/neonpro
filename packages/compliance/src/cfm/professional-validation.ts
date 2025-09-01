/**
 * CFM Professional Validation Service
 *
 * This service handles validation of medical professionals through CFM (Conselho Federal de Medicina)
 * using multiple validation methods including CRM Digital, CFM API, and Atesta CFM.
 *
 * Features:
 * - Multi-source validation (CRM Digital, CFM API, Atesta CFM)
 * - Caching with TTL for performance
 * - Background validation refresh
 * - Aesthetic procedure authorization validation
 * - Compliance checking and recommendations
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */

import { z } from "zod";

export const CFMProfessionalSchema = z.object({
  crm_number: z.string().regex(/^\d{4,6}$/, "CRM must be 4-6 digits"),
  crm_state: z.enum([
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ]),
  full_name: z.string().min(2),
  cpf: z.string().regex(/^\d{11}$/, "CPF must be 11 digits"),
  specialties: z.array(z.object({
    code: z.string(),
    name: z.string(),
    registration_date: z.date(),
    valid_until: z.date().optional(),
    certificate_number: z.string().optional(),
  })),
  professional_status: z.enum([
    "active", // Ativo
    "inactive", // Inativo
    "suspended", // Suspenso
    "cancelled", // Cancelado
    "transfer_pending", // Transferência pendente
  ]),
  digital_certificate: z.object({
    certificate_type: z.enum(["ICP_BRASIL_A3", "CFM_DIGITAL", "OTHER"]),
    certificate_serial: z.string(),
    issuer: z.string(),
    valid_from: z.date(),
    valid_until: z.date(),
    thumbprint: z.string(),
  }).optional(),
  validation_status: z.object({
    is_validated: z.boolean(),
    validation_date: z.date().optional(),
    validation_method: z.enum([
      "crm_digital", // CRM Digital verification
      "cfm_api", // CFM API direct
      "atesta_cfm", // Atesta CFM platform
      "manual_verification", // Manual verification
    ]),
    last_verification: z.date().optional(),
    next_verification_due: z.date().optional(),
  }),
  platform_permissions: z.object({
    can_issue_prescriptions: z.boolean(),
    can_issue_certificates: z.boolean(),
    can_perform_consultations: z.boolean(),
    can_access_patient_data: z.boolean(),
    aesthetic_procedures_authorized: z.boolean(),
    emergency_access_granted: z.boolean(),
  }),
});

export type CFMProfessional = z.infer<typeof CFMProfessionalSchema>;

// Aesthetic specialties that can perform aesthetic procedures
export const AESTHETIC_SPECIALTIES = {
  "DERMATOLOGIA": {
    code: "059",
    aesthetic_procedures: ["botox", "preenchimento", "peeling", "laser"],
  },
  "CIRURGIA_PLASTICA": {
    code: "162",
    aesthetic_procedures: ["cirurgia_facial", "lifting", "blefaroplastia"],
  },
  "MEDICINA_ESTETICA": {
    code: "099", // If exists as specialty
    aesthetic_procedures: ["botox", "preenchimento", "fios", "bioestimuladores"],
  },
} as const;

export interface CFMAPICredentials {
  client_id: string;
  client_secret: string;
  certificate_path: string; // ICP-Brasil A3 certificate
  api_endpoints: {
    crm_validation: string;
    professional_data: string;
    atesta_cfm: string;
    specialties_verification: string;
  };
  environment: "production" | "homologation";
}

export interface ValidationCache {
  ttl_minutes: number;
  max_entries: number;
  enable_background_refresh: boolean;
}

export class CFMProfessionalValidator {
  private cfmCredentials: CFMAPICredentials;
  private validationCache: Map<string, { data: CFMProfessional; expires: Date; }> = new Map();
  private cacheConfig: ValidationCache;
  private validationQueue: Set<string> = new Set();

  constructor(
    cfmCredentials: CFMAPICredentials,
    cacheConfig: ValidationCache = {
      ttl_minutes: 60,
      max_entries: 1000,
      enable_background_refresh: true,
    },
  ) {
    this.cfmCredentials = cfmCredentials;
    this.cacheConfig = cacheConfig;
    this.initializeBackgroundValidation();
  }

  /**
   * Initialize background validation for cache refresh
   */
  private initializeBackgroundValidation(): void {
    if (this.cacheConfig.enable_background_refresh) {
      // Set up periodic cache refresh every 30 minutes
      setInterval(() => {
        this.refreshExpiredCacheEntries();
      }, 30 * 60 * 1000);
    }
  }

  /**
   * Refresh expired cache entries in background
   */
  private async refreshExpiredCacheEntries(): Promise<void> {
    const now = new Date();
    const expiredEntries: string[] = [];

    Array.from(this.validationCache.entries()).forEach(([key, entry]) => {
      if (entry.expires <= now) {
        expiredEntries.push(key);
      }
    });

    // Refresh expired entries
    for (const key of expiredEntries) {
      if (!this.validationQueue.has(key)) {
        try {
          const [crm_number, crm_state] = key.split("_");
          await this.validateProfessional(crm_number, crm_state);
        } catch (error) {
          console.error(`Background refresh failed for ${key}:`, error);
        }
      }
    }
  }

  /**
   * Main validation method that orchestrates different validation sources
   */
  async validateProfessional(
    crm_number: string,
    crm_state: string,
    validation_method: "auto" | "crm_digital" | "cfm_api" | "atesta_cfm" = "auto",
  ): Promise<{
    valid: boolean;
    professional_data?: CFMProfessional;
    validation_details: {
      method_used: string;
      validation_date: Date;
      next_verification_due: Date;
      confidence_level: number;
    };
    compliance_issues?: string[];
    recommendations?: string[];
  }> {
    const cacheKey = `${crm_number}_${crm_state}`;

    try {
      // Check cache first
      const cached = this.getCachedValidation(crm_number, crm_state);
      if (cached) {
        const aestheticAuth = await this.validateAestheticProcedureAuthorization(cached);
        return {
          valid: true,
          professional_data: {
            ...cached,
            platform_permissions: {
              ...cached.platform_permissions,
              aesthetic_procedures_authorized: aestheticAuth,
            },
          },
          validation_details: {
            method_used: "cache",
            validation_date: new Date(),
            next_verification_due: new Date(Date.now() + this.cacheConfig.ttl_minutes * 60 * 1000),
            confidence_level: 0.95,
          },
        };
      }

      // Add to validation queue to prevent duplicate requests
      if (this.validationQueue.has(cacheKey)) {
        // Wait for ongoing validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryCache = this.getCachedValidation(crm_number, crm_state);
        if (retryCache) {
          return {
            valid: true,
            professional_data: retryCache,
            validation_details: {
              method_used: "cache_retry",
              validation_date: new Date(),
              next_verification_due: new Date(
                Date.now() + this.cacheConfig.ttl_minutes * 60 * 1000,
              ),
              confidence_level: 0.9,
            },
          };
        }
      }

      this.validationQueue.add(cacheKey);

      let validationResult: { success: boolean; data?: CFMProfessional; error?: string; };
      let methodUsed: string;
      let confidenceLevel: number;

      // Try validation methods based on preference
      if (validation_method === "auto" || validation_method === "crm_digital") {
        validationResult = await this.validateViaCRMDigital(crm_number, crm_state);
        methodUsed = "crm_digital";
        confidenceLevel = 0.98;

        if (!validationResult.success && validation_method === "auto") {
          // Fallback to CFM API
          validationResult = await this.validateViaCFMAPI(crm_number, crm_state);
          methodUsed = "cfm_api";
          confidenceLevel = 0.95;

          if (!validationResult.success) {
            // Final fallback to Atesta CFM
            validationResult = await this.validateViaAtestaCFM(crm_number, crm_state);
            methodUsed = "atesta_cfm";
            confidenceLevel = 0.85;
          }
        }
      } else if (validation_method === "cfm_api") {
        validationResult = await this.validateViaCFMAPI(crm_number, crm_state);
        methodUsed = "cfm_api";
        confidenceLevel = 0.95;
      } else {
        validationResult = await this.validateViaAtestaCFM(crm_number, crm_state);
        methodUsed = "atesta_cfm";
        confidenceLevel = 0.85;
      }

      this.validationQueue.delete(cacheKey);

      if (validationResult.success && validationResult.data) {
        // Validate aesthetic procedure authorization
        const aestheticAuth = await this.validateAestheticProcedureAuthorization(
          validationResult.data,
        );

        const professionalData: CFMProfessional = {
          ...validationResult.data,
          platform_permissions: {
            ...validationResult.data.platform_permissions,
            aesthetic_procedures_authorized: aestheticAuth,
          },
        };

        // Cache the result
        this.setCachedValidation(crm_number, crm_state, professionalData);

        // Check compliance and generate recommendations
        const complianceIssues = this.checkComplianceIssues(professionalData);
        const recommendations = this.generateRecommendations(professionalData);

        return {
          valid: true,
          professional_data: professionalData,
          validation_details: {
            method_used: methodUsed,
            validation_date: new Date(),
            next_verification_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            confidence_level: confidenceLevel,
          },
          compliance_issues: complianceIssues.length > 0 ? complianceIssues : undefined,
          recommendations: recommendations.length > 0 ? recommendations : undefined,
        };
      }

      return {
        valid: false,
        validation_details: {
          method_used: methodUsed,
          validation_date: new Date(),
          next_verification_due: new Date(Date.now() + 60 * 60 * 1000), // Retry in 1 hour
          confidence_level: 0,
        },
        compliance_issues: [validationResult.error || "Validation failed"],
        recommendations: ["Verify CRM number and state", "Contact CFM for manual validation"],
      };
    } catch (error) {
      this.validationQueue.delete(cacheKey);
      console.error("Professional validation failed:", error);

      return {
        valid: false,
        validation_details: {
          method_used: "error",
          validation_date: new Date(),
          next_verification_due: new Date(Date.now() + 60 * 60 * 1000), // Retry in 1 hour
          confidence_level: 0,
        },
        compliance_issues: [
          `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        recommendations: ["Contact support for manual validation", "Check system connectivity"],
      };
    }
  }

  /**
   * Get cached validation result
   */
  private getCachedValidation(crm_number: string, crm_state: string): CFMProfessional | null {
    const cacheKey = `${crm_number}_${crm_state}`;
    const cached = this.validationCache.get(cacheKey);

    if (cached && cached.expires > new Date()) {
      return cached.data;
    }

    // Remove expired entry
    if (cached) {
      this.validationCache.delete(cacheKey);
    }

    return null;
  }

  /**
   * Cache validation result
   */
  private setCachedValidation(crm_number: string, crm_state: string, data: CFMProfessional): void {
    const cacheKey = `${crm_number}_${crm_state}`;
    const expires = new Date(Date.now() + this.cacheConfig.ttl_minutes * 60 * 1000);

    // Check cache size limit
    if (this.validationCache.size >= this.cacheConfig.max_entries) {
      // Remove oldest entry
      const firstKey = this.validationCache.keys().next().value;
      if (firstKey) {
        this.validationCache.delete(firstKey);
      }
    }

    this.validationCache.set(cacheKey, { data, expires });
  }

  /**
   * Validate if professional is authorized for aesthetic procedures
   */
  private async validateAestheticProcedureAuthorization(
    professional: CFMProfessional,
  ): Promise<boolean> {
    // Check if professional has aesthetic-related specialties
    const hasAestheticSpecialty = professional.specialties.some(specialty => {
      return Object.values(AESTHETIC_SPECIALTIES).some(aestheticSpec =>
        aestheticSpec.code === specialty.code
      );
    });

    if (!hasAestheticSpecialty) {
      return false;
    }

    // Additional checks for active status and valid certificates
    return professional.professional_status === "active"
      && professional.validation_status.is_validated;
  }

  /**
   * Check for compliance issues
   */
  private checkComplianceIssues(professional: CFMProfessional): string[] {
    const issues: string[] = [];

    // Check professional status
    if (professional.professional_status !== "active") {
      issues.push(`Professional status is ${professional.professional_status}`);
    }

    // Check validation status
    if (!professional.validation_status.is_validated) {
      issues.push("Professional validation is pending");
    }

    // Check certificate expiration
    if (professional.digital_certificate) {
      const now = new Date();
      if (professional.digital_certificate.valid_until < now) {
        issues.push("Digital certificate has expired");
      }
    }

    return issues;
  }

  /**
   * Generate recommendations based on professional data
   */
  private generateRecommendations(professional: CFMProfessional): string[] {
    const recommendations: string[] = [];

    // Certificate renewal recommendations
    if (professional.digital_certificate) {
      const daysUntilExpiry = Math.floor(
        (professional.digital_certificate.valid_until.getTime() - Date.now())
          / (1000 * 60 * 60 * 24),
      );

      if (daysUntilExpiry <= 30) {
        recommendations.push("Renew digital certificate within 30 days");
      }
    }

    // Validation recommendations
    if (professional.validation_status.next_verification_due) {
      const daysUntilVerification = Math.floor(
        (professional.validation_status.next_verification_due.getTime() - Date.now())
          / (1000 * 60 * 60 * 24),
      );

      if (daysUntilVerification <= 7) {
        recommendations.push("Schedule validation renewal within 7 days");
      }
    }

    return recommendations;
  }

  /**
   * Validate via CRM Digital platform (primary method)
   */
  private async validateViaCRMDigital(
    crm_number: string,
    crm_state: string,
  ): Promise<{
    success: boolean;
    data?: CFMProfessional;
    error?: string;
  }> {
    try {
      // Implementation would use CFM's CRM Digital API
      // This includes ICP-Brasil A3 certificate authentication

      const response = await this.callCFMAPI(
        this.cfmCredentials.api_endpoints.crm_validation,
        {
          crm_number,
          crm_state,
          validation_type: "crm_digital",
        },
      );

      if (response.success && response.data) {
        const professionalData = this.mapCRMDigitalResponse(response.data);
        return {
          success: true,
          data: professionalData,
        };
      }

      return {
        success: false,
        error: response.error || "CRM Digital validation failed",
      };
    } catch (error) {
      return {
        success: false,
        error: `CRM Digital validation error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Validate via CFM API (secondary method)
   */
  private async validateViaCFMAPI(
    crm_number: string,
    crm_state: string,
  ): Promise<{
    success: boolean;
    data?: CFMProfessional;
    error?: string;
  }> {
    try {
      const response = await this.callCFMAPI(
        this.cfmCredentials.api_endpoints.professional_data,
        {
          crm_number,
          crm_state,
        },
      );

      if (response.success && response.data) {
        const professionalData = this.mapCFMAPIResponse(response.data);
        return {
          success: true,
          data: professionalData,
        };
      }

      return {
        success: false,
        error: response.error || "CFM API validation failed",
      };
    } catch (error) {
      return {
        success: false,
        error: `CFM API validation error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Validate via Atesta CFM (tertiary method)
   */
  private async validateViaAtestaCFM(
    crm_number: string,
    crm_state: string,
  ): Promise<{
    success: boolean;
    data?: CFMProfessional;
    error?: string;
  }> {
    try {
      const response = await this.callCFMAPI(
        this.cfmCredentials.api_endpoints.atesta_cfm,
        {
          crm_number,
          crm_state,
        },
      );

      if (response.success && response.data) {
        const professionalData = this.mapAtestaCFMResponse(response.data);
        return {
          success: true,
          data: professionalData,
        };
      }

      return {
        success: false,
        error: response.error || "Atesta CFM validation failed",
      };
    } catch (error) {
      return {
        success: false,
        error: `Atesta CFM validation error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Generic CFM API call method
   */
  private async callCFMAPI(
    endpoint: string,
    params: Record<string, unknown>,
  ): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string; }> {
    try {
      // This would implement the actual API call with ICP-Brasil A3 certificate
      // For now, return a mock response

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful response for testing
      return {
        success: true,
        data: {
          crm_number: params.crm_number,
          crm_state: params.crm_state,
          full_name: "Dr. João Silva",
          cpf: "12345678901",
          specialties: [
            {
              code: "059",
              name: "Dermatologia",
              registration_date: new Date("2020-01-01"),
            },
          ],
          status: "active",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `API call failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Map CRM Digital API response to CFMProfessional
   */
  private mapCRMDigitalResponse(data: Record<string, unknown>): CFMProfessional {
    return {
      crm_number: data.crm_number,
      crm_state: data.crm_state,
      full_name: data.full_name,
      cpf: data.cpf,
      specialties: data.specialties || [],
      professional_status: data.status || "active",
      digital_certificate: data.digital_certificate,
      validation_status: {
        is_validated: true,
        validation_date: new Date(),
        validation_method: "crm_digital",
        last_verification: new Date(),
        next_verification_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      platform_permissions: {
        can_issue_prescriptions: true,
        can_issue_certificates: true,
        can_perform_consultations: true,
        can_access_patient_data: true,
        aesthetic_procedures_authorized: false,
        emergency_access_granted: false,
      },
    };
  }

  /**
   * Map CFM API response to CFMProfessional
   */
  private mapCFMAPIResponse(data: Record<string, unknown>): CFMProfessional {
    return {
      crm_number: data.crm_number,
      crm_state: data.crm_state,
      full_name: data.full_name,
      cpf: data.cpf,
      specialties: data.specialties || [],
      professional_status: data.status || "active",
      digital_certificate: data.digital_certificate,
      validation_status: {
        is_validated: true,
        validation_date: new Date(),
        validation_method: "cfm_api",
        last_verification: new Date(),
        next_verification_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      platform_permissions: {
        can_issue_prescriptions: true,
        can_issue_certificates: true,
        can_perform_consultations: true,
        can_access_patient_data: true,
        aesthetic_procedures_authorized: false,
        emergency_access_granted: false,
      },
    };
  }

  /**
   * Map Atesta CFM response to CFMProfessional
   */
  private mapAtestaCFMResponse(data: Record<string, unknown>): CFMProfessional {
    return {
      crm_number: data.crm_number,
      crm_state: data.crm_state,
      full_name: data.full_name,
      cpf: data.cpf,
      specialties: data.specialties || [],
      professional_status: data.status || "active",
      digital_certificate: data.digital_certificate,
      validation_status: {
        is_validated: true,
        validation_date: new Date(),
        validation_method: "atesta_cfm",
        last_verification: new Date(),
        next_verification_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      platform_permissions: {
        can_issue_prescriptions: true,
        can_issue_certificates: true,
        can_perform_consultations: true,
        can_access_patient_data: true,
        aesthetic_procedures_authorized: false,
        emergency_access_granted: false,
      },
    };
  }
}
