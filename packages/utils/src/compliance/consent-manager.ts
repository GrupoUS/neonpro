/**
 * LGPD Consent Manager
 * Manages user consent for data processing in compliance with Brazilian LGPD
 */

export interface ConsentRecord {
  userId: string;
  purpose: string;
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  version: string;
}

export interface ConsentPurpose {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: "essential" | "functional" | "analytics" | "marketing";
}

export class LGPDConsentManager {
  private static instance: LGPDConsentManager;

  static getInstance(): LGPDConsentManager {
    if (!LGPDConsentManager.instance) {
      LGPDConsentManager.instance = new LGPDConsentManager();
    }
    return LGPDConsentManager.instance;
  }

  // LGPD consent purposes for healthcare
  private readonly consentPurposes: ConsentPurpose[] = [
    {
      id: "essential",
      name: "Funcionamento Essencial",
      description:
        "Dados necessários para operação básica da plataforma médica",
      required: true,
      category: "essential",
    },
    {
      id: "medical_treatment",
      name: "Atendimento Médico",
      description:
        "Processamento de dados médicos para consultas e tratamentos",
      required: true,
      category: "essential",
    },
    {
      id: "appointment_management",
      name: "Gestão de Consultas",
      description: "Agendamento e gerenciamento de consultas médicas",
      required: false,
      category: "functional",
    },
    {
      id: "analytics",
      name: "Análises e Melhorias",
      description: "Análise de uso para melhorar a experiência e qualidade",
      required: false,
      category: "analytics",
    },
    {
      id: "marketing",
      name: "Comunicação e Marketing",
      description: "Envio de informativos sobre tratamentos e promoções",
      required: false,
      category: "marketing",
    },
  ];

  async grantConsent(
    userId: string,
    purposeId: string,
    ipAddress: string,
    version = "1.0",
  ): Promise<ConsentRecord> {
    const purpose = this.consentPurposes.find((p) => p.id === purposeId);
    if (!purpose) {
      throw new Error(`Consent purpose not found: ${purposeId}`);
    }

    const consent: ConsentRecord = {
      userId,
      purpose: purposeId,
      granted: true,
      timestamp: new Date(),
      ipAddress,
      version,
    };

    // Store in database
    await this.storeConsentRecord(consent);

    return consent;
  }

  async revokeConsent(
    userId: string,
    purposeId: string,
    ipAddress: string,
  ): Promise<ConsentRecord> {
    const consent: ConsentRecord = {
      userId,
      purpose: purposeId,
      granted: false,
      timestamp: new Date(),
      ipAddress,
      version: "1.0",
    };

    await this.storeConsentRecord(consent);

    return consent;
  }

  async getUserConsents(_userId: string): Promise<ConsentRecord[]> {
    // This would query the database
    // For now, return mock data
    return [];
  }

  async isConsentGranted(userId: string, purposeId: string): Promise<boolean> {
    const consents = await this.getUserConsents(userId);
    const latestConsent = consents
      .filter((c) => c.purpose === purposeId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    return latestConsent?.granted;
  }

  getConsentPurposes(): ConsentPurpose[] {
    return [...this.consentPurposes];
  }

  getRequiredPurposes(): ConsentPurpose[] {
    return this.consentPurposes.filter((p) => p.required);
  }

  async validateConsentsForProcessing(
    userId: string,
    requiredPurposes: string[],
  ): Promise<boolean> {
    for (const purposeId of requiredPurposes) {
      const granted = await this.isConsentGranted(userId, purposeId);
      if (!granted) {
        return false;
      }
    }
    return true;
  }

  private async storeConsentRecord(_consent: ConsentRecord): Promise<void> {}
}
