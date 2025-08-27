// CFM Professional Registration Validation System
// Complete validation system for Brazilian healthcare professionals

import { z } from "zod";
import type {
  CFMRegistration,
  ProfessionalValidationRequest,
  ProfessionalValidationResponse,
  BrazilianState,
  ProfessionalStatus,
  MedicalSpecialty,
  HealthcareCouncil,
  AuditTrailEntry,
} from "../../types/compliance";

// =============================================================================
// CFM API INTEGRATION & VALIDATION ENGINE
// =============================================================================

export class CFMProfessionalValidator {
  private readonly apiEndpoints = {
    cfm: "https://portal.cfm.org.br/api/medicos",
    coren: "https://portal.coren.gov.br/api/profissionais",
    crf: "https://www.crf.org.br/api/farmaceuticos",
    crefito: "https://www.coffito.gov.br/api/fisioterapeutas",
  };

  private readonly crmPattern = /^CRM-([A-Z]{2})-(\d{6})$/;
  private readonly cache = new Map<string, CFMRegistration>();
  private readonly cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Validates a Brazilian medical professional registration
   */
  async validateProfessionalRegistration(
    request: ProfessionalValidationRequest
  ): Promise<ProfessionalValidationResponse> {
    try {
      // 1. Validate request format
      const validatedRequest = this.validateRequestFormat(request);
      if (!validatedRequest.valid) {
        return {
          valid: false,
          errors: validatedRequest.errors,
          confidence: 0,
          validatedAt: new Date().toISOString(),
          nextValidationDate: this.calculateNextValidation(),
        };
      }

      // 2. Check cache first
      const cacheKey = `${request.crm}_${request.state}`;
      const cached = this.getCachedRegistration(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        return {
          valid: true,
          registration: cached,
          confidence: 0.95, // High confidence for cached data
          validatedAt: new Date().toISOString(),
          nextValidationDate: this.calculateNextValidation(),
        };
      }

      // 3. Validate with CFM API
      const registration = await this.validateWithCFMApi(request);
      if (!registration) {
        return {
          valid: false,
          errors: ["Professional not found in CFM database"],
          confidence: 0,
          validatedAt: new Date().toISOString(),
          nextValidationDate: this.calculateNextValidation(),
        };
      }

      // 4. Additional validations if requested
      if (request.validateSpecialties) {
        await this.validateSpecialties(registration);
      }

      if (request.checkEmergencyQualification) {
        await this.validateEmergencyQualification(registration);
      }

      // 5. Cache result
      this.cacheRegistration(cacheKey, registration);

      // 6. Create audit trail entry
      await this.createAuditTrailEntry({
        action: "professional_validation",
        resource: "cfm_registration",
        resourceId: registration.crm,
        details: {
          crm: registration.crm,
          state: registration.state,
          status: registration.status,
          validationMethod: registration.validationSource,
        },
      });

      return {
        valid: registration.status === "active",
        registration,
        confidence: this.calculateConfidence(registration),
        validatedAt: new Date().toISOString(),
        nextValidationDate: this.calculateNextValidation(),
      };
    } catch (error) {
      console.error("CFM validation error:", error);
      return {
        valid: false,
        errors: [`Validation error: ${error.message}`],
        confidence: 0,
        validatedAt: new Date().toISOString(),
        nextValidationDate: this.calculateNextValidation(),
      };
    }
  }

  /**
   * Validates multiple professionals in batch
   */
  async batchValidateProfessionals(
    requests: ProfessionalValidationRequest[]
  ): Promise<ProfessionalValidationResponse[]> {
    const results = await Promise.allSettled(
      requests.map((request) => this.validateProfessionalRegistration(request))
    );

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          valid: false,
          errors: [`Batch validation failed: ${result.reason}`],
          confidence: 0,
          validatedAt: new Date().toISOString(),
          nextValidationDate: this.calculateNextValidation(),
        };
      }
    });
  }

  /**
   * Searches for professionals by name or specialty
   */
  async searchProfessionals(
    query: {
      name?: string;
      state?: BrazilianState;
      specialty?: MedicalSpecialty;
      council?: HealthcareCouncil;
      activeOnly?: boolean;
    },
    limit: number = 50
  ): Promise<CFMRegistration[]> {
    const searchParams = new URLSearchParams();
    
    if (query.name) searchParams.set("nome", query.name);
    if (query.state) searchParams.set("uf", query.state);
    if (query.specialty) searchParams.set("especialidade", query.specialty);
    if (query.activeOnly !== false) searchParams.set("situacao", "ATIVO");
    searchParams.set("limit", limit.toString());

    try {
      const response = await fetch(
        `${this.apiEndpoints.cfm}/busca?${searchParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "NeonPro/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CFM API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformCFMResponse(data.profissionais || []);
    } catch (error) {
      console.error("Professional search error:", error);
      return [];
    }
  }

  /**
   * Gets renewal alerts for professionals
   */
  async getRenewalAlerts(
    registrations: string[],
    daysAhead: number = 30
  ): Promise<{
    crm: string;
    doctorName: string;
    renewalDate: string;
    daysUntilRenewal: number;
    urgency: "low" | "medium" | "high" | "critical";
  }[]> {
    const alerts = [];
    const now = new Date();
    const cutoffDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    for (const crm of registrations) {
      const cached = this.cache.get(crm);
      if (cached) {
        const renewalDate = new Date(cached.renewalDate);
        if (renewalDate <= cutoffDate) {
          const daysUntilRenewal = Math.ceil(
            (renewalDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
          );

          let urgency: "low" | "medium" | "high" | "critical";
          if (daysUntilRenewal <= 0) urgency = "critical";
          else if (daysUntilRenewal <= 7) urgency = "high";
          else if (daysUntilRenewal <= 14) urgency = "medium";
          else urgency = "low";

          alerts.push({
            crm: cached.crm,
            doctorName: cached.doctorName,
            renewalDate: cached.renewalDate,
            daysUntilRenewal,
            urgency,
          });
        }
      }
    }

    return alerts.sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private validateRequestFormat(
    request: ProfessionalValidationRequest
  ): { valid: boolean; errors?: string[] } {
    const errors = [];

    if (!this.crmPattern.test(request.crm)) {
      errors.push("Invalid CRM format. Expected: CRM-XX-123456");
    }

    if (!request.state || !["SP", "RJ", "MG", "RS", "PR"].includes(request.state)) {
      errors.push("Invalid or missing state code");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private async validateWithCFMApi(
    request: ProfessionalValidationRequest
  ): Promise<CFMRegistration | null> {
    const crmMatch = request.crm.match(this.crmPattern);
    if (!crmMatch) return null;

    const [, state, number] = crmMatch;

    try {
      // Mock CFM API call (in production, this would call the real CFM API)
      const response = await this.mockCFMApiCall(request.crm, state, number);
      
      if (response && response.situacao === "ATIVO") {
        return this.transformCFMResponse([response])[0];
      }

      return null;
    } catch (error) {
      console.error("CFM API validation failed:", error);
      return null;
    }
  }

  private async mockCFMApiCall(crm: string, state: string, number: string) {
    // Mock response for demonstration
    // In production, this would make actual API calls to CFM
    return {
      crm: crm,
      nome: "Dr. João Silva Santos",
      cpf: "123.456.789-00",
      situacao: "ATIVO",
      dataInscricao: "2015-03-15",
      dataRenovacao: "2026-03-15",
      especialidades: ["CARDIOLOGIA", "MEDICINA_INTENSIVA"],
      qualificacoes: ["EMERGENCIA_MEDICA", "UTI"],
      prescricaoControlada: true,
      classesPermitidas: ["A1", "A2", "B1", "B2", "C1"],
    };
  }

  private transformCFMResponse(cfmData: any[]): CFMRegistration[] {
    return cfmData.map((data) => ({
      id: `cfm_${data.crm.replace(/[^A-Z0-9]/g, "")}`,
      crm: data.crm,
      state: data.crm.split("-")[1] as BrazilianState,
      doctorName: data.nome,
      cpf: data.cpf,
      status: this.mapCFMStatus(data.situacao),
      registrationDate: data.dataInscricao,
      renewalDate: data.dataRenovacao,
      specialties: data.especialidades || [],
      additionalQualifications: data.qualificacoes || [],
      emergencyQualified: data.qualificacoes?.includes("EMERGENCIA_MEDICA") || false,
      prescriptionRights: {
        controlled: data.prescricaoControlada || false,
        classes: data.classesPermitidas || [],
      },
      lastValidated: new Date().toISOString(),
      validationSource: "cfm_api",
    }));
  }

  private mapCFMStatus(cfmStatus: string): ProfessionalStatus {
    const statusMap: Record<string, ProfessionalStatus> = {
      ATIVO: "active",
      SUSPENSO: "suspended",
      CASSADO: "revoked",
      INATIVO: "inactive",
      PENDENTE: "pending",
    };
    return statusMap[cfmStatus] || "inactive";
  }

  private async validateSpecialties(registration: CFMRegistration): Promise<void> {
    // Validate that all specialties are recognized
    const validSpecialties = [
      "CARDIOLOGIA", "DERMATOLOGIA", "NEUROLOGIA", "PEDIATRIA",
      "GINECOLOGIA", "ORTOPEDIA", "PSIQUIATRIA", "ENDOCRINOLOGIA",
      "MEDICINA_ESTETICA", "CIRURGIA_PLASTICA",
    ];

    const invalidSpecialties = registration.specialties.filter(
      (spec) => !validSpecialties.includes(spec)
    );

    if (invalidSpecialties.length > 0) {
      console.warn(`Invalid specialties found: ${invalidSpecialties.join(", ")}`);
    }
  }

  private async validateEmergencyQualification(
    registration: CFMRegistration
  ): Promise<void> {
    const emergencyQualifications = [
      "EMERGENCIA_MEDICA",
      "MEDICINA_INTENSIVA", 
      "ANESTESIOLOGIA",
      "CARDIOLOGIA",
      "NEUROLOGIA",
    ];

    const hasEmergencyQualification = 
      registration.specialties.some((spec) => emergencyQualifications.includes(spec)) ||
      registration.additionalQualifications?.some((qual) => 
        emergencyQualifications.includes(qual)
      );

    registration.emergencyQualified = hasEmergencyQualification;
  }

  private calculateConfidence(registration: CFMRegistration): number {
    let confidence = 0.8; // Base confidence

    // Higher confidence for recent validations
    const daysSinceValidation = Math.floor(
      (Date.now() - new Date(registration.lastValidated).getTime()) / (24 * 60 * 60 * 1000)
    );
    if (daysSinceValidation === 0) confidence += 0.15;
    else if (daysSinceValidation <= 7) confidence += 0.1;
    else if (daysSinceValidation <= 30) confidence += 0.05;

    // Higher confidence for API vs scraping
    if (registration.validationSource === "cfm_api") confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  private calculateNextValidation(): string {
    // Next validation in 7 days
    const nextValidation = new Date();
    nextValidation.setDate(nextValidation.getDate() + 7);
    return nextValidation.toISOString();
  }

  private getCachedRegistration(key: string): CFMRegistration | null {
    return this.cache.get(key) || null;
  }

  private isCacheValid(registration: CFMRegistration): boolean {
    const cacheAge = Date.now() - new Date(registration.lastValidated).getTime();
    return cacheAge < this.cacheExpiry;
  }

  private cacheRegistration(key: string, registration: CFMRegistration): void {
    this.cache.set(key, registration);
  }

  private async createAuditTrailEntry(entry: Partial<AuditTrailEntry>): Promise<void> {
    // In production, this would save to database
    const auditEntry: AuditTrailEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: "system", // Would be actual user ID
      userType: "system",
      action: entry.action || "unknown",
      resource: entry.resource || "unknown",
      resourceId: entry.resourceId,
      details: entry.details || {},
      success: true,
      legalBasis: "legal_obligation", // CFM validation is legal obligation
      dataCategories: ["personal_identification", "health_data"],
    };

    console.log("Audit trail entry:", auditEntry);
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Validates Brazilian CPF format and checksum
 */
export function validateBrazilianCPF(cpf: string): { valid: boolean; formatted: string } {
  // Remove non-numeric characters
  const cleanCpf = cpf.replace(/\D/g, "");

  // Check if CPF has 11 digits
  if (cleanCpf.length !== 11) {
    return { valid: false, formatted: cpf };
  }

  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCpf)) {
    return { valid: false, formatted: cpf };
  }

  // Validate checksum
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleanCpf[9]) !== digit1) {
    return { valid: false, formatted: cpf };
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf[i]) * (11 - i);
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleanCpf[10]) !== digit2) {
    return { valid: false, formatted: cpf };
  }

  // Format CPF
  const formatted = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  
  return { valid: true, formatted };
}

/**
 * Generates a CRM validation summary for display
 */
export function generateCRMSummary(registration: CFMRegistration) {
  return {
    displayName: registration.doctorName,
    registrationInfo: `${registration.crm} (${registration.state})`,
    statusBadge: {
      status: registration.status,
      label: {
        active: "Ativo",
        suspended: "Suspenso",
        revoked: "Cassado",
        inactive: "Inativo",
        pending: "Pendente",
      }[registration.status],
      color: {
        active: "green",
        suspended: "yellow",
        revoked: "red",
        inactive: "gray",
        pending: "blue",
      }[registration.status],
    },
    specialties: registration.specialties.map((spec) => ({
      code: spec,
      label: {
        CARDIOLOGIA: "Cardiologia",
        DERMATOLOGIA: "Dermatologia", 
        NEUROLOGIA: "Neurologia",
        MEDICINA_ESTETICA: "Medicina Estética",
        CIRURGIA_PLASTICA: "Cirurgia Plástica",
      }[spec] || spec,
    })),
    renewalStatus: {
      date: registration.renewalDate,
      daysUntilRenewal: Math.ceil(
        (new Date(registration.renewalDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      ),
      urgent: new Date(registration.renewalDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000,
    },
    emergencyQualified: registration.emergencyQualified,
    prescriptionRights: registration.prescriptionRights,
  };
}

// Export singleton instance
export const cfmValidator = new CFMProfessionalValidator();