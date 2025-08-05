import type { z } from "zod";

/**
 * LGPD Consent Management System
 * Implements consent collection, storage, and management according to Brazilian LGPD requirements
 */

// Types of consent required for healthcare operations
export enum ConsentType {
  DATA_PROCESSING = "data_processing", // Basic data processing consent
  SENSITIVE_DATA = "sensitive_data", // Medical/health data consent
  MARKETING = "marketing", // Marketing communications
  DATA_SHARING = "data_sharing", // Sharing with third parties
  PHOTO_VIDEO = "photo_video", // Photo/video for treatments
  RESEARCH = "research", // Anonymous research participation
  COOKIES = "cookies", // Website cookies and tracking
  BIOMETRIC = "biometric", // Biometric data collection
}

// Consent status enum
export enum ConsentStatus {
  GRANTED = "granted",
  DENIED = "denied",
  REVOKED = "revoked",
  EXPIRED = "expired",
}

// Legal basis for data processing under LGPD
export enum LegalBasis {
  CONSENT = "consent", // Article 7, I
  CONTRACT = "contract", // Article 7, V
  LEGAL_OBLIGATION = "legal_obligation", // Article 7, II
  VITAL_INTERESTS = "vital_interests", // Article 7, IV
  PUBLIC_INTEREST = "public_interest", // Article 7, III
  LEGITIMATE_INTERESTS = "legitimate_interests", // Article 7, IX
}

// Consent record schema
export const consentRecordSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  consentType: z.nativeEnum(ConsentType),
  status: z.nativeEnum(ConsentStatus),
  legalBasis: z.nativeEnum(LegalBasis),

  // Consent metadata
  grantedAt: z.date().optional(),
  revokedAt: z.date().optional(),
  expiresAt: z.date().optional(),

  // Collection context
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "IP inválido"),
  userAgent: z.string(),
  source: z.enum(["web", "mobile", "clinic", "phone", "email"]),

  // Purpose specification (LGPD requirement)
  purpose: z.string().min(10, "Finalidade deve ser específica e clara"),
  dataCategories: z.array(z.string()).min(1, "Categorias de dados são obrigatórias"),

  // Data subject information
  language: z.enum(["pt-BR", "en-US"]).default("pt-BR"),
  version: z.string().default("1.0"), // Consent form version

  // Third party sharing details (if applicable)
  thirdParties: z
    .array(
      z.object({
        name: z.string(),
        purpose: z.string(),
        country: z.string().default("Brasil"),
        adequacyDecision: z.boolean().default(false), // For international transfers
      }),
    )
    .optional(),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type ConsentRecord = z.infer<typeof consentRecordSchema>;

export class ConsentManager {
  /**
   * Collect consent from data subject
   */
  static async collectConsent(params: {
    userId: string;
    consentType: ConsentType;
    granted: boolean;
    purpose: string;
    dataCategories: string[];
    ipAddress: string;
    userAgent: string;
    source: "web" | "mobile" | "clinic" | "phone" | "email";
    legalBasis?: LegalBasis;
    expiresInDays?: number;
    thirdParties?: Array<{
      name: string;
      purpose: string;
      country?: string;
      adequacyDecision?: boolean;
    }>;
  }): Promise<ConsentRecord> {
    const now = new Date();
    const expiresAt = params.expiresInDays
      ? new Date(now.getTime() + params.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const consentRecord: ConsentRecord = {
      id: crypto.randomUUID(),
      userId: params.userId,
      consentType: params.consentType,
      status: params.granted ? ConsentStatus.GRANTED : ConsentStatus.DENIED,
      legalBasis: params.legalBasis || LegalBasis.CONSENT,
      grantedAt: params.granted ? now : undefined,
      expiresAt,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      source: params.source,
      purpose: params.purpose,
      dataCategories: params.dataCategories,
      language: "pt-BR",
      version: "1.0",
      thirdParties: params.thirdParties?.map((tp) => ({
        name: tp.name,
        purpose: tp.purpose,
        country: tp.country || "Brasil",
        adequacyDecision: tp.adequacyDecision || false,
      })),
      createdAt: now,
      updatedAt: now,
    };

    // Validate the consent record
    const validated = consentRecordSchema.parse(consentRecord);

    // TODO: Store in database
    console.log("Consent collected:", validated);

    return validated;
  }

  /**
   * Check if user has valid consent for specific data processing
   */
  static async hasValidConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    // TODO: Query database for latest consent record
    // This is a placeholder implementation
    const consentRecord = await ConsentManager.getLatestConsent(userId, consentType);

    if (!consentRecord) return false;

    // Check if consent is granted and not expired
    if (consentRecord.status !== ConsentStatus.GRANTED) return false;

    if (consentRecord.expiresAt && consentRecord.expiresAt < new Date()) {
      // Mark as expired
      await ConsentManager.expireConsent(consentRecord.id!);
      return false;
    }

    return true;
  }

  /**
   * Revoke consent (user right under LGPD)
   */
  static async revokeConsent(params: {
    userId: string;
    consentType: ConsentType;
    reason?: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<ConsentRecord> {
    const existingConsent = await ConsentManager.getLatestConsent(
      params.userId,
      params.consentType,
    );

    if (!existingConsent) {
      throw new Error("No consent found to revoke");
    }

    const updatedConsent: ConsentRecord = {
      ...existingConsent,
      status: ConsentStatus.REVOKED,
      revokedAt: new Date(),
      updatedAt: new Date(),
    };

    // TODO: Update in database
    console.log("Consent revoked:", updatedConsent);

    // Audit log for revocation
    await ConsentManager.logConsentEvent({
      userId: params.userId,
      action: "revoke",
      consentType: params.consentType,
      details: { reason: params.reason },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return updatedConsent;
  }

  /**
   * Get consent history for a user (right to access under LGPD)
   */
  static async getConsentHistory(
    userId: string,
    consentType?: ConsentType,
  ): Promise<ConsentRecord[]> {
    // TODO: Query database for all consent records
    // Placeholder implementation
    return [];
  }

  /**
   * Generate consent report for data subject access request
   */
  static async generateConsentReport(userId: string): Promise<{
    userId: string;
    generatedAt: Date;
    consents: Array<{
      type: ConsentType;
      status: ConsentStatus;
      grantedAt?: Date;
      revokedAt?: Date;
      expiresAt?: Date;
      purpose: string;
      dataCategories: string[];
      legalBasis: LegalBasis;
    }>;
    dataProcessingActivities: string[];
    thirdPartySharing: Array<{
      partner: string;
      purpose: string;
      dataShared: string[];
      consentStatus: ConsentStatus;
    }>;
  }> {
    const consents = await ConsentManager.getConsentHistory(userId);

    return {
      userId,
      generatedAt: new Date(),
      consents: consents.map((c) => ({
        type: c.consentType,
        status: c.status,
        grantedAt: c.grantedAt,
        revokedAt: c.revokedAt,
        expiresAt: c.expiresAt,
        purpose: c.purpose,
        dataCategories: c.dataCategories,
        legalBasis: c.legalBasis,
      })),
      dataProcessingActivities: [
        "Agendamento de consultas",
        "Histórico médico",
        "Comunicações de marketing (se consentido)",
        "Análise de qualidade do serviço",
      ],
      thirdPartySharing: consents
        .filter((c) => c.thirdParties && c.thirdParties.length > 0)
        .flatMap((c) =>
          c.thirdParties!.map((tp) => ({
            partner: tp.name,
            purpose: tp.purpose,
            dataShared: c.dataCategories,
            consentStatus: c.status,
          })),
        ),
    };
  }

  /**
   * Check if consent is about to expire and send renewal notification
   */
  static async checkExpiringConsents(daysBeforeExpiry: number = 30): Promise<
    Array<{
      userId: string;
      consentType: ConsentType;
      expiresAt: Date;
      daysUntilExpiry: number;
    }>
  > {
    // TODO: Query database for consents expiring soon
    // Placeholder implementation
    return [];
  }

  // Private helper methods
  private static async getLatestConsent(
    userId: string,
    consentType: ConsentType,
  ): Promise<ConsentRecord | null> {
    // TODO: Query database for latest consent record
    // Placeholder implementation
    return null;
  }

  private static async expireConsent(consentId: string): Promise<void> {
    // TODO: Update consent status to expired in database
    console.log("Consent expired:", consentId);
  }

  private static async logConsentEvent(params: {
    userId: string;
    action: string;
    consentType: ConsentType;
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    // TODO: Log to audit trail
    console.log("Consent event logged:", params);
  }
}

/**
 * Standard consent purposes for healthcare clinics
 */
export const HEALTHCARE_CONSENT_PURPOSES = {
  [ConsentType.DATA_PROCESSING]:
    "Processamento de dados pessoais para prestação de serviços médicos e administrativos",
  [ConsentType.SENSITIVE_DATA]:
    "Tratamento de dados sensíveis de saúde para diagnóstico, tratamento e acompanhamento médico",
  [ConsentType.MARKETING]:
    "Envio de comunicações promocionais sobre tratamentos e serviços da clínica",
  [ConsentType.DATA_SHARING]:
    "Compartilhamento de dados com laboratórios, outros profissionais de saúde e planos de saúde",
  [ConsentType.PHOTO_VIDEO]:
    "Captação e uso de imagens fotográficas ou videogrficas para documentação de tratamentos",
  [ConsentType.RESEARCH]:
    "Uso de dados anonimizados para pesquisas científicas e melhoria de tratamentos",
  [ConsentType.COOKIES]: "Uso de cookies e tecnologias similares no website da clínica",
  [ConsentType.BIOMETRIC]:
    "Coleta e processamento de dados biométricos para identificação e segurança",
};

/**
 * Standard data categories for healthcare
 */
export const HEALTHCARE_DATA_CATEGORIES = {
  IDENTIFICATION: "Dados de identificação (nome, CPF, RG)",
  CONTACT: "Dados de contato (telefone, email, endereço)",
  HEALTH: "Dados de saúde (histórico médico, exames, tratamentos)",
  FINANCIAL: "Dados financeiros (forma de pagamento, faturas)",
  BEHAVIORAL: "Dados comportamentais (preferências, histórico de uso)",
  BIOMETRIC: "Dados biométricos (impressões digitais, reconhecimento facial)",
  PHOTOGRAPHIC: "Imagens fotográficas e videogrficas",
  LOCATION: "Dados de localização",
};
