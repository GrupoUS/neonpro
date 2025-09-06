/**
 * Medical Error Handler for Brazilian Healthcare
 * Specialized error handling for medical queries with compliance and safety protocols
 */

import { templateManager } from "@neonpro/shared/templates";
import type { ServiceContext } from "../base/EnhancedServiceBase";

export interface MedicalError {
  type: "emergency" | "compliance" | "safety" | "scope" | "technical";
  severity: "low" | "medium" | "high" | "critical";
  code: string;
  message: string;
  userMessage: string;
  escalationRequired: boolean;
  complianceViolation?: {
    regulation: "LGPD" | "CFM" | "ANVISA";
    violation: string;
    requiredAction: string;
  };
  emergencyProtocol?: {
    immediateAction: string;
    contactInfo: string;
    escalationLevel: "clinic" | "emergency_services" | "regulatory";
  };
}

export interface MedicalQueryValidation {
  isValid: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  errors: MedicalError[];
  warnings: string[];
  recommendations: string[];
  requiresEscalation: boolean;
}

export class MedicalErrorHandler {
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}+/gu, "");
  }

  private readonly emergencyKeywords = [
    "emergencia",
    "urgente",
    "dor forte",
    "sangramento",
    "alergia severa",
    "reacao alergica",
    "inchaco excessivo",
    "febre alta",
    "desmaio",
    "tontura severa",
    "falta de ar",
    "socorro",
    "ajuda urgente",
    "nao consigo respirar",
    "dor no peito",
    "convulsao",
  ];

  private readonly prohibitedMedicalAdvice = [
    "diagnóstico",
    "prescrever",
    "receitar",
    "medicamento",
    "dosagem",
    "tratamento específico",
    "cirurgia",
    "procedimento invasivo",
    "anestesia",
    "internação",
  ];

  private readonly complianceKeywords = {
    lgpd: ["dados pessoais", "informações privadas", "compartilhar dados"],
    cfm: ["diagnóstico médico", "prescrição", "tratamento médico"],
    anvisa: ["medicamento", "produto médico", "dispositivo médico"],
  };

  /**
   * Validate medical query for safety and compliance
   */
  validateMedicalQuery(
    query: string,
    context: {
      patientAge?: number;
      hasEmergencyHistory?: boolean;
      communicationChannel: "whatsapp" | "web" | "phone";
    },
  ): MedicalQueryValidation {
    const errors: MedicalError[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const queryLower = query.toLowerCase();

    // Check for emergency situations
    const emergencyDetected = this.detectEmergency(queryLower);
    if (emergencyDetected) {
      errors.push(this.createEmergencyError(query, context));
    }

    // Check for prohibited medical advice requests
    const prohibitedAdvice = this.detectProhibitedAdvice(queryLower);
    if (prohibitedAdvice.length > 0) {
      errors.push(this.createScopeError(prohibitedAdvice));
      warnings.push("Consulta requer avaliação médica presencial");
    }

    // Check for compliance violations
    const complianceViolations = this.detectComplianceViolations(queryLower);
    complianceViolations.forEach(violation => {
      errors.push(this.createComplianceError(violation));
    });

    // Assess risk level
    const riskLevel = this.assessRiskLevel(errors, context);

    // Generate recommendations
    if (riskLevel === "high" || riskLevel === "critical") {
      recommendations.push("Consulta médica presencial recomendada");
    }

    if (context.communicationChannel === "whatsapp" && riskLevel !== "low") {
      recommendations.push("Agendar consulta para avaliação detalhada");
    }

    return {
      isValid: errors.filter(e => e.severity === "critical").length === 0,
      riskLevel,
      errors,
      warnings,
      recommendations,
      requiresEscalation: errors.some(e => e.escalationRequired),
    };
  }

  /**
   * Handle medical error with appropriate response
   */
  async handleMedicalError(
    error: MedicalError,
    context: ServiceContext,
  ): Promise<{
    response: string;
    escalationTriggered: boolean;
    complianceActions: string[];
  }> {
    const escalationTriggered = error.escalationRequired;
    const complianceActions: string[] = [];

    let response = error.userMessage;

    // Handle emergency situations
    if (error.type === "emergency") {
      const emergencyTemplate = templateManager.getTemplate("whatsapp-emergency-escalation");
      if (emergencyTemplate) {
        const clinicEmergencyPhone = process.env.CLINIC_EMERGENCY_PHONE || "";
        response = templateManager.renderTemplate(emergencyTemplate.id, {
          variables: {
            clinic_emergency_phone: clinicEmergencyPhone,
          },
        }) || response;
      }

      // Log emergency for immediate attention
      console.error("MEDICAL EMERGENCY DETECTED", {
        requestId: context.requestId,
        timestamp: new Date().toISOString(),
        severity: error.severity,
        escalationLevel: error.emergencyProtocol?.escalationLevel,
      });
    }

    // Handle compliance violations
    if (error.complianceViolation) {
      const lgpdTemplate = templateManager.getTemplate("lgpd-data-rights-info");
      if (lgpdTemplate && error.complianceViolation.regulation === "LGPD") {
        const whatsappContact = process.env.CLINIC_WHATSAPP || "";
        const privacyEmail = process.env.PRIVACY_EMAIL || "";
        const dpoName = process.env.DPO_NAME || "Encarregado de Dados";
        const dpoContact = process.env.DPO_CONTACT || "";
        const lgpdResponse = templateManager.renderTemplate(lgpdTemplate.id, {
          variables: {
            whatsapp_contact: whatsappContact,
            privacy_email: privacyEmail,
            data_protection_officer: dpoName,
            dpo_contact: dpoContact,
          },
        });

        if (lgpdResponse) {
          response += "\n\n" + lgpdResponse;
        }
      }

      complianceActions.push(error.complianceViolation.requiredAction);
    }

    return {
      response,
      escalationTriggered,
      complianceActions,
    };
  }

  /**
   * Detect emergency situations
   */
  private detectEmergency(query: string): boolean {
    const q = this.normalize(query);
    return this.emergencyKeywords.some(keyword => q.includes(keyword));
  }

  /**
   * Detect prohibited medical advice requests
   */
  private detectProhibitedAdvice(query: string): string[] {
    const q = this.normalize(query);
    return this.prohibitedMedicalAdvice.map(k => this.normalize(k)).filter(advice =>
      q.includes(advice)
    );
  }

  /**
   * Detect compliance violations
   */
  private detectComplianceViolations(query: string): {
    regulation: "LGPD" | "CFM" | "ANVISA";
    keywords: string[];
  }[] {
    const violations: {
      regulation: "LGPD" | "CFM" | "ANVISA";
      keywords: string[];
    }[] = [];

    Object.entries(this.complianceKeywords).forEach(([regulation, keywords]) => {
      const norm = keywords.map(k => this.normalize(k));
      const foundKeywords = norm.filter(keyword => this.normalize(query).includes(keyword));
      if (foundKeywords.length > 0) {
        violations.push({
          regulation: regulation.toUpperCase() as "LGPD" | "CFM" | "ANVISA",
          keywords: foundKeywords,
        });
      }
    });

    return violations;
  }

  /**
   * Assess overall risk level
   */
  private assessRiskLevel(
    errors: MedicalError[],
    context: { patientAge?: number; hasEmergencyHistory?: boolean; },
  ): "low" | "medium" | "high" | "critical" {
    // Critical if any emergency detected
    if (errors.some(e => e.type === "emergency")) {
      return "critical";
    }

    // High if compliance violations or safety concerns
    if (errors.some(e => e.type === "compliance" || e.type === "safety")) {
      return "high";
    }

    // Medium if scope issues or elderly patient
    if (errors.some(e => e.type === "scope") || (context.patientAge && context.patientAge > 65)) {
      return "medium";
    }

    return "low";
  }

  /**
   * Create emergency error
   */
  private createEmergencyError(
    query: string,
    context: { communicationChannel: string; },
  ): MedicalError {
    return {
      type: "emergency",
      severity: "critical",
      code: "EMERGENCY_DETECTED",
      message: `Emergency situation detected in query: ${query.substring(0, 50)}...`,
      userMessage:
        "🚨 Situação de emergência detectada. Entre em contato com nossa equipe médica imediatamente ou ligue para o SAMU (192).",
      escalationRequired: true,
      emergencyProtocol: {
        immediateAction: "Contact emergency services",
        contactInfo: `SAMU: ${process.env.EMERGENCY_SAMU || "192"}, Clínica: ${
          process.env.CLINIC_EMERGENCY_PHONE || ""
        }`,
        escalationLevel: "emergency_services",
      },
    };
  }

  /**
   * Create scope error for prohibited advice
   */
  private createScopeError(prohibitedAdvice: string[]): MedicalError {
    return {
      type: "scope",
      severity: "high",
      code: "PROHIBITED_MEDICAL_ADVICE",
      message: `Prohibited medical advice requested: ${prohibitedAdvice.join(", ")}`,
      userMessage:
        "Esta consulta requer avaliação médica presencial. Não posso fornecer diagnósticos ou prescrições por mensagem. Agende uma consulta para atendimento adequado.",
      escalationRequired: true,
    };
  }

  /**
   * Create compliance error
   */
  private createComplianceError(violation: {
    regulation: "LGPD" | "CFM" | "ANVISA";
    keywords: string[];
  }): MedicalError {
    const messages = {
      LGPD:
        "Questão relacionada à proteção de dados pessoais. Consulte nossa política de privacidade.",
      CFM:
        "Esta consulta envolve prática médica regulamentada pelo CFM. Consulta presencial necessária.",
      ANVISA:
        "Questão sobre produtos regulamentados pela ANVISA. Consulte profissional habilitado.",
    };

    return {
      type: "compliance",
      severity: "medium",
      code: `${violation.regulation}_VIOLATION`,
      message: `${violation.regulation} compliance violation: ${violation.keywords.join(", ")}`,
      userMessage: messages[violation.regulation],
      escalationRequired: false,
      complianceViolation: {
        regulation: violation.regulation,
        violation: `Keywords detected: ${violation.keywords.join(", ")}`,
        requiredAction: `Follow ${violation.regulation} protocols`,
      },
    };
  }
}

export default MedicalErrorHandler;
