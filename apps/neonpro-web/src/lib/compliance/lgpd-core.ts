/**
 * LGPD Compliance Framework - Core System
 * Sistema principal de conformidade com LGPD
 *
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 7º, 8º, 9º, 18º, 46º
 */

import type { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import type {
  ConsentType,
  ConsentStatus,
  LegalBasis,
  ConsentRecord,
  DataSubjectRight,
  DataSubjectRequest,
  RequestStatus,
  AuditEventType,
  LGPDAuditLog,
  SensitiveDataType,
  EncryptedData,
  EncryptionConfig,
  LGPDContext,
  ConsentCheckResult,
  LGPDApiResponse,
} from "../../types/lgpd";

// ============================================================================
// ENCRYPTION SERVICE
// ============================================================================

export class LGPDEncryptionService {
  private static readonly DEFAULT_CONFIG: EncryptionConfig = {
    algorithm: "aes-256-gcm",
    keySize: 32,
    ivSize: 16,
    saltSize: 32,
    iterations: 100000,
  };

  private static getEncryptionKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      password,
      salt,
      this.DEFAULT_CONFIG.iterations,
      this.DEFAULT_CONFIG.keySize,
      "sha512",
    );
  }

  /**
   * Criptografa dados sensíveis conforme LGPD Art. 46º
   */
  static encrypt(data: string, masterKey: string): EncryptedData {
    try {
      const salt = crypto.randomBytes(this.DEFAULT_CONFIG.saltSize);
      const iv = crypto.randomBytes(this.DEFAULT_CONFIG.ivSize);
      const key = this.getEncryptionKey(masterKey, salt);

      const cipher = crypto.createCipher(this.DEFAULT_CONFIG.algorithm, key);
      cipher.setAAD(Buffer.from("lgpd-compliance"));

      let encrypted = cipher.update(data, "utf8", "hex");
      encrypted += cipher.final("hex");

      const authTag = cipher.getAuthTag();

      return {
        data: encrypted + ":" + authTag.toString("hex"),
        iv: iv.toString("hex"),
        salt: salt.toString("hex"),
        algorithm: this.DEFAULT_CONFIG.algorithm,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Descriptografa dados sensíveis
   */
  static decrypt(encryptedData: EncryptedData, masterKey: string): string {
    try {
      const salt = Buffer.from(encryptedData.salt, "hex");
      const iv = Buffer.from(encryptedData.iv, "hex");
      const key = this.getEncryptionKey(masterKey, salt);

      const [encrypted, authTagHex] = encryptedData.data.split(":");
      const authTag = Buffer.from(authTagHex, "hex");

      const decipher = crypto.createDecipher(encryptedData.algorithm, key);
      decipher.setAAD(Buffer.from("lgpd-compliance"));
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Verifica se dados estão criptografados
   */
  static isEncrypted(data: any): data is EncryptedData {
    return (
      typeof data === "object" &&
      data !== null &&
      "data" in data &&
      "iv" in data &&
      "salt" in data &&
      "algorithm" in data
    );
  }
}

// ============================================================================
// CONSENT MANAGEMENT SERVICE
// ============================================================================

export class LGPDConsentService {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Registra consentimento granular (Art. 8º LGPD)
   */
  async grantConsent(
    context: LGPDContext,
    consentType: ConsentType,
    legalBasis: LegalBasis,
    purpose: string,
    description: string,
    expiresAt?: Date,
  ): Promise<ConsentRecord> {
    const consentRecord: Omit<ConsentRecord, "id" | "createdAt" | "updatedAt"> = {
      userId: context.userId,
      clinicId: context.clinicId,
      consentType,
      status: ConsentStatus.GRANTED,
      legalBasis,
      purpose,
      description,
      grantedAt: context.timestamp,
      expiresAt,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      version: "1.0.0",
    };

    const { data, error } = await this.supabase
      .from("lgpd_consent_records")
      .insert(consentRecord)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to grant consent: ${error.message}`);
    }

    // Log auditoria
    await this.logAuditEvent({
      eventType: AuditEventType.CONSENT_GRANTED,
      userId: context.userId,
      clinicId: context.clinicId,
      dataSubject: context.userId,
      description: `Consent granted for ${consentType}: ${purpose}`,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      timestamp: context.timestamp,
      riskLevel: "low",
      processed: true,
    });

    return data;
  }

  /**
   * Revoga consentimento (Art. 8º §5º LGPD)
   */
  async withdrawConsent(context: LGPDContext, consentId: string): Promise<ConsentRecord> {
    const { data, error } = await this.supabase
      .from("lgpd_consent_records")
      .update({
        status: ConsentStatus.WITHDRAWN,
        withdrawnAt: context.timestamp,
        updatedAt: context.timestamp,
      })
      .eq("id", consentId)
      .eq("userId", context.userId)
      .eq("clinicId", context.clinicId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to withdraw consent: ${error.message}`);
    }

    // Log auditoria
    await this.logAuditEvent({
      eventType: AuditEventType.CONSENT_WITHDRAWN,
      userId: context.userId,
      clinicId: context.clinicId,
      dataSubject: context.userId,
      description: `Consent withdrawn for ID: ${consentId}`,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      timestamp: context.timestamp,
      riskLevel: "medium",
      processed: true,
    });

    return data;
  }

  /**
   * Verifica consentimento válido
   */
  async checkConsent(
    userId: string,
    clinicId: string,
    consentType: ConsentType,
  ): Promise<ConsentCheckResult> {
    const { data, error } = await this.supabase
      .from("lgpd_consent_records")
      .select("*")
      .eq("userId", userId)
      .eq("clinicId", clinicId)
      .eq("consentType", consentType)
      .eq("status", ConsentStatus.GRANTED)
      .order("grantedAt", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return {
        hasConsent: false,
        consentType,
        legalBasis: LegalBasis.CONSENT,
        canProcess: false,
        warnings: ["No valid consent found"],
      };
    }

    const now = new Date();
    const isExpired = data.expiresAt && new Date(data.expiresAt) < now;

    return {
      hasConsent: !isExpired,
      consentType,
      grantedAt: new Date(data.grantedAt),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      legalBasis: data.legalBasis,
      canProcess: !isExpired,
      warnings: isExpired ? ["Consent has expired"] : undefined,
    };
  }

  /**
   * Lista consentimentos do usuário
   */
  async getUserConsents(userId: string, clinicId: string): Promise<ConsentRecord[]> {
    const { data, error } = await this.supabase
      .from("lgpd_consent_records")
      .select("*")
      .eq("userId", userId)
      .eq("clinicId", clinicId)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new Error(`Failed to get user consents: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Registra evento de auditoria
   */
  private async logAuditEvent(auditLog: Omit<LGPDAuditLog, "id" | "createdAt">): Promise<void> {
    const { error } = await this.supabase.from("lgpd_audit_logs").insert(auditLog);

    if (error) {
      console.error("Failed to log audit event:", error);
    }
  }
}

// ============================================================================
// DATA SUBJECT RIGHTS SERVICE
// ============================================================================

export class LGPDDataSubjectService {
  private supabase: any;
  private encryptionService: typeof LGPDEncryptionService;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    this.encryptionService = LGPDEncryptionService;
  }

  /**
   * Processa solicitação de direito do titular (Art. 18º LGPD)
   */
  async submitRequest(
    context: LGPDContext,
    requestType: DataSubjectRight,
    description: string,
  ): Promise<DataSubjectRequest> {
    const request: Omit<DataSubjectRequest, "id" | "createdAt" | "updatedAt"> = {
      userId: context.userId,
      clinicId: context.clinicId,
      requestType,
      status: RequestStatus.PENDING,
      description,
      requestedAt: context.timestamp,
    };

    const { data, error } = await this.supabase
      .from("lgpd_data_subject_requests")
      .insert(request)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit request: ${error.message}`);
    }

    return data;
  }

  /**
   * Implementa direito ao esquecimento (Art. 18º III LGPD)
   */
  async processErasureRequest(requestId: string, processorId: string): Promise<void> {
    // Buscar solicitação
    const { data: request, error: requestError } = await this.supabase
      .from("lgpd_data_subject_requests")
      .select("*")
      .eq("id", requestId)
      .eq("requestType", DataSubjectRight.ELIMINATION)
      .single();

    if (requestError || !request) {
      throw new Error("Erasure request not found");
    }

    // Anonimizar dados do usuário
    await this.anonymizeUserData(request.userId, request.clinicId);

    // Atualizar status da solicitação
    await this.supabase
      .from("lgpd_data_subject_requests")
      .update({
        status: RequestStatus.COMPLETED,
        processorId,
        processedAt: new Date(),
        completedAt: new Date(),
      })
      .eq("id", requestId);
  }

  /**
   * Anonimiza dados do usuário
   */
  private async anonymizeUserData(userId: string, clinicId: string): Promise<void> {
    const anonymizedData = {
      name: "ANONIMIZADO",
      email: `anonimizado_${Date.now()}@example.com`,
      cpf: null,
      phone: null,
      address: null,
      anonymized: true,
      anonymizedAt: new Date(),
    };

    // Anonimizar na tabela de usuários
    await this.supabase
      .from("users")
      .update(anonymizedData)
      .eq("id", userId)
      .eq("clinic_id", clinicId);

    // Anonimizar dados médicos
    await this.supabase
      .from("medical_records")
      .update({
        notes: "DADOS ANONIMIZADOS",
        anonymized: true,
        anonymizedAt: new Date(),
      })
      .eq("patient_id", userId)
      .eq("clinic_id", clinicId);
  }

  /**
   * Exporta dados do usuário (portabilidade - Art. 18º V LGPD)
   */
  async exportUserData(userId: string, clinicId: string): Promise<Record<string, any>> {
    const userData: Record<string, any> = {};

    // Dados pessoais
    const { data: user } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .eq("clinic_id", clinicId)
      .single();

    if (user) {
      userData.personal = user;
    }

    // Histórico médico
    const { data: medicalRecords } = await this.supabase
      .from("medical_records")
      .select("*")
      .eq("patient_id", userId)
      .eq("clinic_id", clinicId);

    if (medicalRecords) {
      userData.medical = medicalRecords;
    }

    // Consentimentos
    const { data: consents } = await this.supabase
      .from("lgpd_consent_records")
      .select("*")
      .eq("userId", userId)
      .eq("clinicId", clinicId);

    if (consents) {
      userData.consents = consents;
    }

    return userData;
  }
}

// ============================================================================
// MAIN LGPD SERVICE
// ============================================================================

export class LGPDComplianceService {
  public consent: LGPDConsentService;
  public dataSubject: LGPDDataSubjectService;
  public encryption: typeof LGPDEncryptionService;

  constructor() {
    this.consent = new LGPDConsentService();
    this.dataSubject = new LGPDDataSubjectService();
    this.encryption = LGPDEncryptionService;
  }

  /**
   * Valida contexto LGPD
   */
  static validateContext(context: Partial<LGPDContext>): LGPDContext {
    if (!context.userId || !context.clinicId) {
      throw new Error("User ID and Clinic ID are required");
    }

    return {
      userId: context.userId,
      clinicId: context.clinicId,
      ipAddress: context.ipAddress || "unknown",
      userAgent: context.userAgent || "unknown",
      timestamp: context.timestamp || new Date(),
    };
  }

  /**
   * Cria resposta padronizada da API
   */
  static createApiResponse<T>(
    data: T,
    compliance: {
      processed: boolean;
      auditLogged: boolean;
      consentVerified: boolean;
    },
  ): LGPDApiResponse<T> {
    return {
      success: true,
      data,
      compliance,
      timestamp: new Date(),
    };
  }

  /**
   * Cria resposta de erro padronizada
   */
  static createErrorResponse(error: string): LGPDApiResponse {
    return {
      success: false,
      error,
      compliance: {
        processed: false,
        auditLogged: true,
        consentVerified: false,
      },
      timestamp: new Date(),
    };
  }
}

// Export aliases for compatibility
export { LGPDComplianceService as LGPDCore };

// Export types that are being imported
export type {
  ConsentType,
  ConsentStatus,
  LegalBasis,
  AuditEventType,
} from "../../types/lgpd";

// Export DataSubjectRight as DataSubjectRequestType for compatibility
export { DataSubjectRight as DataSubjectRequestType } from "../../types/lgpd";

// Export RequestStatus as DataSubjectRequestStatus for compatibility
export { RequestStatus as DataSubjectRequestStatus } from "../../types/lgpd";

// Export the main LGPDManager class
export { LGPDComplianceService as LGPDManager };

export default LGPDComplianceService;
