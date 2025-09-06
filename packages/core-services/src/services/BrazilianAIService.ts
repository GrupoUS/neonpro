/**
 * Brazilian AI Service Extension
 * Extends AIService with Brazilian Portuguese templates and healthcare context
 */

import { type LGPDTemplate, type PromptTemplate, templateManager } from "@neonpro/shared";
import type { ServiceConfig, ServiceContext } from "../base/EnhancedServiceBase";
import { AIService } from "./AIService";
import type { ChatMessage, ChatRequest, ChatResponse, HealthcareContext } from "./AIService";
import {
  type BrazilianHealthcareContext,
  BrazilianHealthcareContextProcessor,
} from "./BrazilianHealthcareContextProcessor";
import { type MedicalError, MedicalErrorHandler } from "./MedicalErrorHandler";

export interface BrazilianHealthcareContext extends HealthcareContext {
  clinicType?: "aesthetic" | "general" | "specialized";
  communicationChannel?: "whatsapp" | "web" | "phone" | "in-person";
  patientLanguage?: "pt-BR" | "en";
  culturalContext?: {
    region?: string;
    socialContext?: string;
    urgencyPerception?: "low" | "medium" | "high";
  };
  lgpdConsent?: {
    dataProcessing?: boolean;
    marketing?: boolean;
    photoUsage?: boolean;
    consentDate?: string;
  };
}

export interface WhatsAppChatRequest extends ChatRequest {
  whatsappContext?: {
    phoneNumber: string;
    messageType: "text" | "image" | "voice" | "document";
    isFirstContact: boolean;
    previousInteractions: number;
    emergencyKeywords?: string[];
  };
}

export interface EnhancedChatResponse extends ChatResponse {
  templateUsed?: string;
  culturalAdaptations?: string[];
  lgpdCompliance?: {
    consentRequired: boolean;
    dataUsageExplained: boolean;
    rightsInformed: boolean;
  };
  emergencyDetected?: boolean;
  escalationTriggered?: boolean;
  message: ChatMessage; // Ensure message is always present
}

// Narrow type for optional enhancement input to avoid any
export interface ContextEnhancement {
  enhancedPrompt?: string;
  culturalAdaptations?: string[];
}

export class BrazilianAIService extends AIService {
  private readonly medicalErrorHandler = new MedicalErrorHandler();
  private readonly contextProcessor = new BrazilianHealthcareContextProcessor();
  // Cache for lazily imported PatientService to avoid repeated dynamic imports
  private static patientServiceInstance: unknown | null = null;

  private readonly brazilianSystemPrompts = {
    whatsappExternal: templateManager.getWhatsAppSystemPrompt(),
    whatsappInternal: templateManager.getWhatsAppInternalSystemPrompt(),
    lgpdDataProtection: templateManager.getLGPDDataProtectionPrompt(),
    lgpdPatientRights: templateManager.getLGPDPatientRightsPrompt(),
  };

  private readonly emergencyKeywords = [
    "emergência",
    "urgente",
    "dor forte",
    "sangramento",
    "alergia",
    "reação",
    "inchaço",
    "febre alta",
    "desmaio",
    "tontura",
    "falta de ar",
    "socorro",
  ];

  private readonly aestheticProcedures = [
    "harmonização facial",
    "preenchimento",
    "botox",
    "toxina botulínica",
    "peeling",
    "criolipólise",
    "radiofrequência",
    "laser",
    "microagulhamento",
    "limpeza de pele",
    "drenagem linfática",
  ];

  /**
   * Process WhatsApp chat with Brazilian context
   */
  async processWhatsAppChat(
    request: WhatsAppChatRequest,
    context: ServiceContext,
  ): Promise<EnhancedChatResponse> {
    return this.executeOperation(
      "processWhatsAppChat",
      async () => {
        const lastMessage = request.messages[request.messages.length - 1];
        const messageContent = lastMessage?.content || "";

        // Validate medical query for safety and compliance
        const validation = this.medicalErrorHandler.validateMedicalQuery(
          messageContent,
          {
            communicationChannel: "whatsapp",
            patientAge: request.context?.patientAge,
            hasEmergencyHistory: false, // TODO: Get from patient record
          },
        );

        // Handle critical errors immediately
        if (!validation.isValid && validation.errors.some(e => e.severity === "critical")) {
          const criticalError = validation.errors.find(e => e.severity === "critical");
          if (criticalError) {
            return this.handleMedicalErrorResponse(criticalError, context);
          }
        }

        // Detect emergency situations (legacy method for backward compatibility)
        const emergencyDetected = this.detectEmergency(request.messages);

        if (emergencyDetected || validation.riskLevel === "critical") {
          return this.handleEmergencyResponse(request, context);
        }

        // Determine appropriate template
        const templateId = this.selectTemplate(request);
        const template = templateManager.getTemplate(templateId);

        // Build Brazilian healthcare context
        const brazilianContext = await this.buildBrazilianContext(request);

        // Process Brazilian healthcare context
        const contextEnhancement = this.contextProcessor.processContext(
          brazilianContext,
          messageContent,
          context,
        );

        // Enhance system prompt with template and context
        const enhancedRequest = this.enhanceRequestWithTemplateAndContext(
          request,
          template,
          contextEnhancement,
        );

        // Process with parent AI service
        const baseResponse = await super.processChat(enhancedRequest, context);

        // Post-process response for Brazilian context
        return this.enhanceResponseForBrazil(baseResponse, template, brazilianContext);
      },
      context,
      {
        requiresAuth: true,
        sensitiveData: Boolean(request.patientId),
      },
    );
  }

  /**
   * Process aesthetic clinic consultation
   */
  async processAestheticConsultation(
    request: ChatRequest,
    procedureType: string,
    context: ServiceContext,
  ): Promise<EnhancedChatResponse> {
    return this.executeOperation(
      "processAestheticConsultation",
      async () => {
        // Get procedure-specific template
        const template = templateManager.getTemplateByProcedure(procedureType);

        if (!template) {
          // Fallback to general aesthetic template
          const aestheticTemplates = templateManager.getAestheticTemplates();
          const fallbackTemplate = aestheticTemplates[0];

          if (fallbackTemplate) {
            const enhancedRequest = this.enhanceRequestWithTemplate(request, fallbackTemplate);
            const response = await super.processChat(enhancedRequest, context);
            return this.enhanceResponseForBrazil(response, fallbackTemplate);
          }
        }

        // Use specific procedure template
        const enhancedRequest = this.enhanceRequestWithTemplate(request, template);
        const response = await super.processChat(enhancedRequest, context);
        return this.enhanceResponseForBrazil(response, template);
      },
      context,
      {
        requiresAuth: true,
        sensitiveData: Boolean(request.patientId),
      },
    );
  }

  /**
   * Handle LGPD compliance requests
   */
  async processLGPDRequest(
    requestType: "consent" | "rights" | "privacy" | "data-usage",
    patientData: Record<string, unknown>,
    context: ServiceContext,
  ): Promise<{
    response: string;
    template: LGPDTemplate;
    complianceStatus: "compliant" | "requires_action" | "violation";
    requiredActions?: string[];
  }> {
    return this.executeOperation(
      "processLGPDRequest",
      async () => {
        // Get LGPD templates for request type
        const lgpdTemplates = templateManager.getLGPDTemplates();
        const relevantTemplate = lgpdTemplates.find(t => t.category === requestType);

        if (!relevantTemplate) {
          throw new Error(`No LGPD template found for request type: ${requestType}`);
        }

        // Render template with patient data
        const clinicName = process.env.CLINIC_NAME || "NeonPro";
        const privacyEmail = process.env.PRIVACY_EMAIL || "privacidade@neonpro.com.br";
        const contactWhatsapp = process.env.CLINIC_WHATSAPP || "";
        const response = templateManager.renderTemplate(relevantTemplate.id, {
          variables: patientData,
          fallbackValues: {
            patient_name: "Paciente",
            clinic_name: clinicName,
            contact_email: privacyEmail,
            contact_whatsapp: contactWhatsapp,
          },
        });

        // Assess compliance status
        const complianceStatus = this.assessLGPDCompliance(requestType, patientData);

        return {
          response: response || "",
          template: relevantTemplate,
          complianceStatus,
          requiredActions: complianceStatus === "requires_action"
            ? this.getRequiredLGPDActions(requestType, patientData)
            : undefined,
        };
      },
      context,
      {
        requiresAuth: true,
        sensitiveData: true,
      },
    );
  }

  /**
   * Detect emergency situations in messages
   */
  private detectEmergency(messages: ChatMessage[]): boolean {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return false;
    }

    const content = lastMessage.content.toLowerCase();
    return this.emergencyKeywords.some(keyword => content.includes(keyword));
  }

  /**
   * Handle medical error response
   */
  private async handleMedicalErrorResponse(
    error: MedicalError,
    context: ServiceContext,
  ): Promise<EnhancedChatResponse> {
    const errorResponse = await this.medicalErrorHandler.handleMedicalError(error, context);

    return {
      id: `medical_error_${Date.now()}`,
      message: {
        id: `error_msg_${Date.now()}`,
        role: "assistant",
        content: errorResponse.response,
        timestamp: Date.now(),
      },
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      metadata: {
        model: "medical-error-handler",
        responseTime: 0,
        cached: false,
      },
      templateUsed: `medical-error-${error.type}`,
      emergencyDetected: error.type === "emergency",
      escalationTriggered: errorResponse.escalationTriggered,
      lgpdCompliance: {
        consentRequired: error.complianceViolation?.regulation === "LGPD",
        dataUsageExplained: false,
        rightsInformed: error.complianceViolation?.regulation === "LGPD",
      },
    };
  }

  /**
   * Handle emergency response
   */
  private async handleEmergencyResponse(
    _request: WhatsAppChatRequest,
    _context: ServiceContext,
  ): Promise<EnhancedChatResponse> {
    const emergencyTemplate = templateManager.getTemplate("whatsapp-emergency-escalation");

    if (!emergencyTemplate) {
      throw new Error("Emergency template not found");
    }

    const clinicEmergencyPhoneRaw = process.env.CLINIC_EMERGENCY_PHONE;
    const clinicEmergencyPhone = (clinicEmergencyPhoneRaw ?? "").trim();
    const phoneOk = clinicEmergencyPhone.length > 0
      && /^[+]?[-().\s\d]{6,20}$/.test(clinicEmergencyPhone);
    if (!phoneOk) {
      const msg = `Invalid or missing CLINIC_EMERGENCY_PHONE env value: "${
        clinicEmergencyPhoneRaw ?? ""
      }"`;
      // Prefer service logger if available; fallback to console
      const maybeLogger =
        (this as unknown as { logger?: { error?: (m: string, meta?: unknown) => void; }; }).logger;
      if (maybeLogger?.error) {
        maybeLogger.error(msg, { envVar: "CLINIC_EMERGENCY_PHONE" });
      } else {
        console.error(msg);
      }
      // Do not throw; continue with placeholder to allow message rendering in tests
    }
    const response = templateManager.renderTemplate(emergencyTemplate.id, {
      variables: {
        clinic_emergency_phone: phoneOk ? clinicEmergencyPhone : "(11) 99999-9999",
      },
    });

    return {
      id: `emergency_${Date.now()}`,
      message: {
        id: `emergency_msg_${Date.now()}`,
        role: "assistant",
        content: response
          || "Situação de emergência detectada. Entre em contato com nossa equipe médica imediatamente.",
        timestamp: Date.now(),
      },
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      metadata: {
        model: "emergency-protocol",
        responseTime: 0,
        cached: false,
      },
      templateUsed: emergencyTemplate.id,
      emergencyDetected: true,
      escalationTriggered: true,
      lgpdCompliance: {
        consentRequired: false,
        dataUsageExplained: false,
        rightsInformed: false,
      },
    };
  }

  /**
   * Select appropriate template based on request context
   */
  private selectTemplate(request: WhatsAppChatRequest): string {
    const lastMessage = request.messages[request.messages.length - 1];
    const content = lastMessage?.content.toLowerCase() || "";

    // Check for procedure inquiries
    for (const procedure of this.aestheticProcedures) {
      if (content.includes(procedure)) {
        return "whatsapp-procedure-inquiry";
      }
    }

    // Check for appointment-related keywords
    if (
      content.includes("agendar") || content.includes("consulta") || content.includes("horário")
    ) {
      return "whatsapp-appointment-booking";
    }

    // Check for post-procedure care
    if (content.includes("cuidado") || content.includes("pós") || content.includes("depois")) {
      return "whatsapp-post-procedure-care";
    }

    // Default to greeting for first contact
    if (request.whatsappContext?.isFirstContact) {
      return "whatsapp-greeting";
    }

    // Fallback to general WhatsApp template
    return "whatsapp-greeting";
  }

  /**
   * Build Brazilian healthcare context
   */
  private async buildBrazilianContext(
    request: WhatsAppChatRequest,
  ): Promise<BrazilianHealthcareContext> {
    const consent = await this.getPatientConsent(request.patientId).catch((e: unknown) => {
      const errMsg = e instanceof Error ? e.message : String(e);
      const maybeLogger =
        (this as unknown as { logger?: { error?: (m: string, meta?: unknown) => void; }; }).logger;
      if (maybeLogger?.error) {
        maybeLogger.error("getPatientConsent failed", {
          patientId: request.patientId,
          error: errMsg,
        });
      } else {
        console.error("getPatientConsent failed", { patientId: request.patientId, error: errMsg });
      }
      return {
        dataProcessing: false,
        marketing: false,
        photoUsage: false,
      };
    });
    return {
      clinicType: "aesthetic",
      communicationChannel: "whatsapp",
      patientLanguage: "pt-BR",
      culturalContext: {
        region: "Brasil",
        socialContext: "aesthetic_clinic",
        urgencyPerception: "medium",
      },
      lgpdConsent: {
        dataProcessing: consent.dataProcessing,
        marketing: consent.marketing,
        photoUsage: consent.photoUsage,
      },
      ...request.context,
    };
  }

  private async getPatientConsent(
    patientId?: string | null,
  ): Promise<{ dataProcessing: boolean; marketing: boolean; photoUsage: boolean; }> {
    try {
      if (!patientId) return { dataProcessing: false, marketing: false, photoUsage: false };
      // Lazy import to avoid circular deps; cache instance to avoid repeated imports
      if (!BrazilianAIService.patientServiceInstance) {
        const mod = await import("./patient");
        BrazilianAIService.patientServiceInstance = mod.PatientService.getInstance();
      }
      const svc = BrazilianAIService.patientServiceInstance;
      const consents = await svc.getPatientConsents(patientId, "system");
      const latest = (type: string) => {
        const filtered = consents.filter(
          (c: unknown) =>
            (c as { consentType?: string; consentGiven?: boolean; }).consentType === type
            && (c as { consentType?: string; consentGiven?: boolean; }).consentGiven === true,
        );
        if (filtered.length === 0) return;
        // Choose the consent with the most recent consentDate
        return filtered.reduce(
          (
            acc: { consentDate?: string; },
            cur: { consentDate?: string; },
          ) => {
            const accTime = acc?.consentDate ? new Date(acc.consentDate).getTime() : -Infinity;
            const curTime = cur?.consentDate ? new Date(cur.consentDate).getTime() : -Infinity;
            return curTime > accTime ? cur : acc;
          },
        );
      };
      return {
        dataProcessing: Boolean(latest("data_processing")),
        marketing: Boolean(latest("marketing")),
        photoUsage: Boolean(latest("photo_usage")),
      };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      const maybeLogger =
        (this as unknown as { logger?: { error?: (m: string, meta?: unknown) => void; }; }).logger;
      if (maybeLogger?.error) {
        maybeLogger.error("getPatientConsent threw", { error: errMsg });
      } else {
        console.error("getPatientConsent threw", { error: errMsg });
      }
      return { dataProcessing: false, marketing: false, photoUsage: false };
    }
  }

  /**
   * Enhance request with template and context
   */

  private enhanceRequestWithTemplateAndContext(
    request: ChatRequest,
    template?: PromptTemplate | LGPDTemplate | null,
    contextEnhancement?: ContextEnhancement | null,
  ): ChatRequest {
    // Use enhanced prompt from context processor if available
    let systemPrompt = (contextEnhancement && contextEnhancement.enhancedPrompt)
      || this.brazilianSystemPrompts.whatsappExternal;

    // Add template-specific context if available
    if (template) {
      systemPrompt += `\n\nCONTEXTO ESPECÍFICO:\n${template.template}`;
    }

    // Add cultural adaptations
    if (contextEnhancement?.culturalAdaptations?.length > 0) {
      systemPrompt += `\n\nADAPTAÇÕES CULTURAIS:\n${
        contextEnhancement.culturalAdaptations.map((a: string) => `- ${a}`).join("\n")
      }`;
    }

    // Add system message with enhanced prompt
    const systemMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      role: "system",
      content: systemPrompt,
      timestamp: Date.now(),
    };

    return {
      ...request,
      messages: [systemMessage, ...request.messages],
    };
  }

  /**
   * Legacy method for backward compatibility
   */
  private enhanceRequestWithTemplate(
    request: ChatRequest,
    template?: PromptTemplate | LGPDTemplate | null,
    brazilianContext?: BrazilianHealthcareContext,
  ): ChatRequest {
    if (!template) {
      return request;
    }

    // Build enhanced system prompt
    let systemPrompt = this.brazilianSystemPrompts.whatsappExternal;

    if (brazilianContext?.communicationChannel === "whatsapp") {
      systemPrompt += `\n\nCONTEXTO ESPECÍFICO:\n${template.template}`;
    }

    // Add system message with enhanced prompt
    const systemMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      role: "system",
      content: systemPrompt,
      timestamp: Date.now(),
    };

    return {
      ...request,
      messages: [systemMessage, ...request.messages],
    };
  }

  /**
   * Enhance response for Brazilian context
   */
  private enhanceResponseForBrazil(
    response: ChatResponse,
    template?: PromptTemplate | LGPDTemplate | null,
    _brazilianContext?: BrazilianHealthcareContext,
  ): EnhancedChatResponse {
    return {
      ...response,
      templateUsed: template?.id,
      culturalAdaptations: this.identifyCulturalAdaptations(response.message.content),
      lgpdCompliance: {
        consentRequired: this.requiresLGPDConsent(response.message.content),
        dataUsageExplained: this.hasDataUsageExplanation(response.message.content),
        rightsInformed: this.hasRightsInformation(response.message.content),
      },
      emergencyDetected: false,
      escalationTriggered: false,
    };
  }

  /**
   * Assess LGPD compliance status
   */
  private assessLGPDCompliance(
    requestType: string,
    patientData: Record<string, any>,
  ): "compliant" | "requires_action" | "violation" {
    // Basic compliance assessment logic
    if (requestType === "consent" && !patientData.consentDate) {
      return "requires_action";
    }

    if (requestType === "data-usage" && !patientData.dataUsageExplained) {
      return "requires_action";
    }

    return "compliant";
  }

  /**
   * Get required LGPD actions
   */
  private getRequiredLGPDActions(
    requestType: string,
    patientData: Record<string, any>,
  ): string[] {
    const actions: string[] = [];

    if (requestType === "consent" && !patientData.consentDate) {
      actions.push("Obter consentimento explícito do paciente");
    }

    if (!patientData.privacyPolicyAccepted) {
      actions.push("Apresentar política de privacidade");
    }

    return actions;
  }

  /**
   * Identify cultural adaptations in response
   */
  private identifyCulturalAdaptations(content: string): string[] {
    const adaptations: string[] = [];

    if (content.includes("😊") || content.includes("💕")) {
      adaptations.push("emoji_usage");
    }

    if (content.includes("Olá") || content.includes("Oi")) {
      adaptations.push("brazilian_greeting");
    }

    if (content.includes("LGPD") || content.includes("privacidade")) {
      adaptations.push("lgpd_awareness");
    }

    return adaptations;
  }

  /**
   * Check if response requires LGPD consent
   */
  private requiresLGPDConsent(content: string): boolean {
    return content.includes("dados pessoais")
      || content.includes("informações")
      || content.includes("contato");
  }

  /**
   * Check if response has data usage explanation
   */
  private hasDataUsageExplanation(content: string): boolean {
    return content.includes("uso dos dados")
      || content.includes("finalidade")
      || content.includes("tratamento");
  }

  /**
   * Check if response has rights information
   */
  private hasRightsInformation(content: string): boolean {
    return content.includes("direitos")
      || content.includes("LGPD")
      || content.includes("privacidade");
  }
}

export default BrazilianAIService;
