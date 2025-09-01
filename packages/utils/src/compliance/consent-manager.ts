/**
 * LGPD Consent Manager
 * Manages user consent for data processing in compliance with Brazilian LGPD
 */

export interface ConsentRecord {
  userId: string;
  purpose: string;
  granted: boolean;
  timestamp: string; // ISO string for consistency with database
  ipAddress: string;
  version: string;
  id?: string; // Optional ID for database records
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
  private initialized = false;
  private consentRecords = new Map<string, ConsentRecord[]>(); // In-memory storage for demo

  private constructor() {
    this.initializeManager().catch(error => {
      console.error("LGPD Consent Manager initialization failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    });
  }

  static getInstance(): LGPDConsentManager {
    if (!LGPDConsentManager.instance) {
      LGPDConsentManager.instance = new LGPDConsentManager();
    }
    return LGPDConsentManager.instance;
  }

  private async initializeManager(): Promise<void> {
    try {
      // Initialize consent purposes
      this.validateConsentPurposes();

      // In production, this would initialize database connection
      await this.loadExistingConsents();

      this.initialized = true;
      console.log("LGPD Consent Manager initialized successfully");
    } catch (error) {
      console.error("LGPD Consent Manager initialization error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
      throw new Error("LGPD Consent Manager failed to initialize");
    }
  }

  private validateConsentPurposes(): void {
    const requiredCategories = ["essential", "functional", "analytics", "marketing"];
    const existingCategories = new Set(this.consentPurposes.map(p => p.category));

    for (const category of requiredCategories) {
      if (!existingCategories.has(category as any)) {
        console.warn(`Missing consent purpose category: ${category}`);
      }
    }
  }

  private async loadExistingConsents(): Promise<void> {
    try {
      // In production, this would load from database
      console.log("Loading existing consent records");
    } catch (error) {
      console.error("Failed to load existing consents:", error);
      throw error;
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("LGPD Consent Manager not properly initialized");
    }
  }

  // LGPD consent purposes for healthcare
  private readonly consentPurposes: ConsentPurpose[] = [
    {
      id: "essential",
      name: "Funcionamento Essencial",
      description: "Dados necessários para operação básica da plataforma médica",
      required: true,
      category: "essential",
    },
    {
      id: "medical_treatment",
      name: "Atendimento Médico",
      description: "Processamento de dados médicos para consultas e tratamentos",
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
    try {
      this.ensureInitialized();

      // Input validation
      if (!userId || !purposeId || !ipAddress) {
        throw new Error("User ID, purpose ID, and IP address are required");
      }

      if (!this.isValidIPAddress(ipAddress)) {
        throw new Error("Invalid IP address format");
      }

      const purpose = this.consentPurposes.find((p) => p.id === purposeId);
      if (!purpose) {
        throw new Error(`Consent purpose not found: ${purposeId}`);
      }

      const consent: ConsentRecord = {
        userId,
        purpose: purposeId,
        granted: true,
        timestamp: new Date().toISOString(),
        ipAddress,
        version,
        id: `${userId}_${purposeId}_${Date.now()}`,
      };

      // Store in database
      await this.storeConsentRecord(consent);

      console.log("Consent granted:", {
        userId,
        purposeId,
        ipAddress,
        timestamp: consent.timestamp,
      });

      return consent;
    } catch (error) {
      console.error("Failed to grant consent:", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        purposeId,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async revokeConsent(
    userId: string,
    purposeId: string,
    ipAddress: string,
  ): Promise<ConsentRecord> {
    try {
      this.ensureInitialized();

      // Input validation
      if (!userId || !purposeId || !ipAddress) {
        throw new Error("User ID, purpose ID, and IP address are required");
      }

      if (!this.isValidIPAddress(ipAddress)) {
        throw new Error("Invalid IP address format");
      }

      const purpose = this.consentPurposes.find((p) => p.id === purposeId);
      if (!purpose) {
        throw new Error(`Consent purpose not found: ${purposeId}`);
      }

      // Check if purpose is required
      if (purpose.required) {
        throw new Error("Cannot revoke consent for required purposes");
      }

      const consent: ConsentRecord = {
        userId,
        purpose: purposeId,
        granted: false,
        timestamp: new Date().toISOString(),
        ipAddress,
        version: "1.0",
        id: `${userId}_${purposeId}_${Date.now()}`,
      };

      await this.storeConsentRecord(consent);

      console.log("Consent revoked:", {
        userId,
        purposeId,
        ipAddress,
        timestamp: consent.timestamp,
      });

      return consent;
    } catch (error) {
      console.error("Failed to revoke consent:", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        purposeId,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async getUserConsents(userId: string): Promise<ConsentRecord[]> {
    try {
      this.ensureInitialized();

      if (!userId) {
        throw new Error("User ID is required");
      }

      // Get consents from in-memory storage (would be database in production)
      const userConsents = this.consentRecords.get(userId) || [];

      return userConsents.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error("Failed to get user consents:", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        timestamp: new Date().toISOString(),
      });
      return [];
    }
  }

  async isConsentGranted(userId: string, purposeId: string): Promise<boolean> {
    try {
      this.ensureInitialized();

      if (!userId || !purposeId) {
        return false;
      }

      const consents = await this.getUserConsents(userId);
      const latestConsent = consents
        .filter((c) => c.purpose === purposeId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      return latestConsent?.granted ?? false;
    } catch (error) {
      console.error("Failed to check consent status:", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        purposeId,
        timestamp: new Date().toISOString(),
      });
      return false;
    }
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
    try {
      this.ensureInitialized();

      if (!userId || !Array.isArray(requiredPurposes)) {
        return false;
      }

      if (requiredPurposes.length === 0) {
        return true;
      }

      for (const purposeId of requiredPurposes) {
        const granted = await this.isConsentGranted(userId, purposeId);
        if (!granted) {
          console.warn("Missing consent for processing:", {
            userId,
            purposeId,
            timestamp: new Date().toISOString(),
          });
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Failed to validate consents for processing:", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        requiredPurposes,
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  private async storeConsentRecord(consent: ConsentRecord): Promise<void> {
    try {
      // Store in in-memory map (would be database in production)
      const userConsents = this.consentRecords.get(consent.userId) || [];
      userConsents.push(consent);
      this.consentRecords.set(consent.userId, userConsents);

      console.log("Consent record stored:", {
        userId: consent.userId,
        purpose: consent.purpose,
        granted: consent.granted,
        timestamp: consent.timestamp,
      });
    } catch (error) {
      console.error("Failed to store consent record:", {
        error: error instanceof Error ? error.message : "Unknown error",
        consent,
        timestamp: new Date().toISOString(),
      });
      throw new Error("Failed to store consent record");
    }
  }

  private isValidIPAddress(ip: string): boolean {
    // IPv4 regex
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // IPv6 regex (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === "localhost" || ip === "127.0.0.1";
  }
}
