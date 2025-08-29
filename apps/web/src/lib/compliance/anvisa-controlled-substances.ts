/**
 * ANVISA Controlled Substances Service
 * Comprehensive tracking system for controlled substances in Brazil
 * Handles classes A1, A2, A3, B1, B2, C1, C2 according to ANVISA regulations
 */

import type {
  ANVISAControlledClass,
  ANVISASubstance,
  AuditTrailEntry,
  ComplianceAPIResponse,
  ControlledPrescription,
  PrescriptionType,
  ValidationResponse,
} from "../../types/compliance";

// ANVISA controlled substance classifications
const ANVISA_CLASSIFICATIONS = {
  A1: {
    name: "Lista A1 - Entorpecentes",
    prescriptionType: "receituario-a" as PrescriptionType,
    color: "#dc2626", // Red
    maxDays: 30,
    specialRequirements: [
      "Receituário Amarelo",
      "Notificação de Receita A",
      "Controle rigoroso",
    ],
    examples: ["Morfina", "Heroína", "Cocaína"],
  },
  A2: {
    name: "Lista A2 - Entorpecentes permitidos",
    prescriptionType: "receituario-a" as PrescriptionType,
    color: "#ea580c", // Orange
    maxDays: 30,
    specialRequirements: ["Receituário Amarelo", "Notificação de Receita A"],
    examples: ["Codeína", "Tramadol", "Oximorfona"],
  },
  A3: {
    name: "Lista A3 - Psicotrópicos",
    prescriptionType: "receituario-a" as PrescriptionType,
    color: "#d97706", // Amber
    maxDays: 30,
    specialRequirements: ["Receituário Amarelo", "Notificação de Receita A"],
    examples: ["Anfetamina", "LSD", "Ecstasy"],
  },
  B1: {
    name: "Lista B1 - Psicotrópicos",
    prescriptionType: "receituario-b" as PrescriptionType,
    color: "#2563eb", // Blue
    maxDays: 60,
    specialRequirements: ["Receituário Azul", "Notificação de Receita B1"],
    examples: ["Diazepam", "Alprazolam", "Clonazepam"],
  },
  B2: {
    name: "Lista B2 - Psicotrópicos anorexígenos",
    prescriptionType: "receituario-b" as PrescriptionType,
    color: "#1d4ed8", // Blue (darker)
    maxDays: 30,
    specialRequirements: ["Receituário Azul", "Notificação de Receita B2"],
    examples: ["Sibutramina", "Femproporex", "Mazindol"],
  },
  C1: {
    name: "Lista C1 - Outras substâncias sujeitas a controle especial",
    prescriptionType: "receituario-c" as PrescriptionType,
    color: "#059669", // Green
    maxDays: 60,
    specialRequirements: ["Receituário Branco", "Retenção da receita"],
    examples: ["Anticonvulsivantes", "Antidepressivos"],
  },
  C2: {
    name: "Lista C2 - Retinóides de uso sistêmico e imunossupressores",
    prescriptionType: "receituario-c" as PrescriptionType,
    color: "#047857", // Green (darker)
    maxDays: 30,
    specialRequirements: [
      "Receituário Branco",
      "Notificação de Receita Especial",
    ],
    examples: ["Isotretinoína", "Talidomida", "Micofenolato"],
  },
} as const;

// Mock controlled substances database
const MOCK_SUBSTANCES_DATABASE: ANVISASubstance[] = [
  {
    id: "anvisa-001",
    substanceName: "Diazepam",
    commercialName: "Valium",
    controlledClass: "B1",
    prescriptionType: "receituario-b",
    activeIngredient: "Diazepam",
    concentration: "5mg, 10mg",
    pharmaceuticalForm: "Comprimido",
    restrictions: ["Uso adulto", "Contraindicado na gravidez"],
    maxDailyDose: 40,
    maxTreatmentDays: 60,
    requiresSpecialHandling: true,
    storageRequirements: [
      "Local seco",
      "Temperatura ambiente",
      "Cofre para medicamentos controlados",
    ],
    disposalRequirements: ["Incineração controlada", "Registro de descarte"],
  },
  {
    id: "anvisa-002",
    substanceName: "Morfina",
    commercialName: "Dimorf",
    controlledClass: "A1",
    prescriptionType: "receituario-a",
    activeIngredient: "Sulfato de Morfina",
    concentration: "10mg/ml, 30mg",
    pharmaceuticalForm: "Solução injetável, Comprimido",
    restrictions: ["Uso hospitalar preferencial", "Alta dependência"],
    maxDailyDose: 200,
    maxTreatmentDays: 30,
    requiresSpecialHandling: true,
    storageRequirements: ["Cofre blindado", "Dupla chave", "Controle rigoroso"],
    disposalRequirements: [
      "Incineração controlada com testemunhas",
      "Ata de destruição",
    ],
  },
  {
    id: "anvisa-003",
    substanceName: "Isotretinoína",
    commercialName: "Roacutan",
    controlledClass: "C2",
    prescriptionType: "receituario-c",
    activeIngredient: "Isotretinoína",
    concentration: "10mg, 20mg",
    pharmaceuticalForm: "Cápsula",
    restrictions: [
      "Mulheres em idade fértil requerem teste de gravidez",
      "Acompanhamento médico mensal",
    ],
    maxDailyDose: 80,
    maxTreatmentDays: 180,
    requiresSpecialHandling: false,
    storageRequirements: [
      "Local seco",
      "Proteger da luz",
      "Temperatura ambiente",
    ],
    disposalRequirements: ["Descarte conforme RDC 222/2018"],
  },
];

/**
 * ANVISA Controlled Substances Tracking Service
 */
export class ANVISAControlledSubstancesService {
  private static instance: ANVISAControlledSubstancesService;
  private substances: Map<string, ANVISASubstance> = new Map();
  private prescriptions: Map<string, ControlledPrescription> = new Map();
  private auditTrail: AuditTrailEntry[] = [];

  private constructor() {
    this.loadSubstancesDatabase();
  }

  public static getInstance(): ANVISAControlledSubstancesService {
    if (!ANVISAControlledSubstancesService.instance) {
      ANVISAControlledSubstancesService.instance = new ANVISAControlledSubstancesService();
    }
    return ANVISAControlledSubstancesService.instance;
  }

  /**
   * Load substances database (mock data)
   */
  private loadSubstancesDatabase(): void {
    MOCK_SUBSTANCES_DATABASE.forEach((substance) => {
      this.substances.set(substance.id, substance);
    });
  }

  /**
   * Search controlled substances
   */
  public searchSubstances(query: string): ANVISASubstance[] {
    const searchTerm = query.toLowerCase();
    const results: ANVISASubstance[] = [];

    for (const substance of this.substances.values()) {
      if (
        substance.substanceName.toLowerCase().includes(searchTerm)
        || substance.commercialName.toLowerCase().includes(searchTerm)
        || substance.activeIngredient.toLowerCase().includes(searchTerm)
      ) {
        results.push(substance);
      }
    }

    return results.sort((a, b) => a.substanceName.localeCompare(b.substanceName));
  }

  /**
   * Get substance by ID
   */
  public getSubstance(id: string): ANVISASubstance | null {
    return this.substances.get(id) || null;
  }

  /**
   * Get substances by controlled class
   */
  public getSubstancesByClass(
    controlledClass: ANVISAControlledClass,
  ): ANVISASubstance[] {
    const results: ANVISASubstance[] = [];

    for (const substance of this.substances.values()) {
      if (substance.controlledClass === controlledClass) {
        results.push(substance);
      }
    }

    return results.sort((a, b) => a.substanceName.localeCompare(b.substanceName));
  }

  /**
   * Get all controlled classes information
   */
  public getControlledClassesInfo() {
    return ANVISA_CLASSIFICATIONS;
  }

  /**
   * Create controlled prescription
   */
  public async createControlledPrescription(
    prescriptionData: Omit<
      ControlledPrescription,
      "id" | "prescriptionDate" | "status" | "validUntil"
    >,
  ): Promise<ValidationResponse<ControlledPrescription>> {
    try {
      // Validate substance exists
      const substance = this.getSubstance(prescriptionData.substanceId);
      if (!substance) {
        return {
          isValid: false,
          errors: ["Substância não encontrada na base de dados ANVISA"],
          warnings: [],
          timestamp: new Date(),
          source: "anvisa-controlled-substances",
        };
      }

      // Validate prescription type matches substance class
      if (substance.prescriptionType !== prescriptionData.prescriptionType) {
        return {
          isValid: false,
          errors: [
            `Tipo de receituário incorreto. ${substance.substanceName} requer ${substance.prescriptionType}`,
          ],
          warnings: [],
          timestamp: new Date(),
          source: "anvisa-controlled-substances",
        };
      }

      // Validate treatment duration
      const classInfo = ANVISA_CLASSIFICATIONS[substance.controlledClass];
      if (prescriptionData.treatmentDays > classInfo.maxDays) {
        return {
          isValid: false,
          errors: [
            `Duração do tratamento excede o máximo permitido de ${classInfo.maxDays} dias para classe ${substance.controlledClass}`,
          ],
          warnings: [],
          timestamp: new Date(),
          source: "anvisa-controlled-substances",
        };
      }

      // Generate prescription ID and dates
      const prescriptionId = `ANV-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const prescriptionDate = new Date();
      const validUntil = new Date(
        prescriptionDate.getTime() + 30 * 24 * 60 * 60 * 1000,
      ); // 30 days validity

      const prescription: ControlledPrescription = {
        id: prescriptionId,
        prescriptionDate,
        status: "prescribed",
        validUntil,
        ...prescriptionData,
      };

      // Store prescription
      this.prescriptions.set(prescriptionId, prescription);

      // Add audit trail
      this.addAuditEntry({
        timestamp: new Date(),
        userId: "system",
        userRole: "system",
        action: "substance-prescribed",
        entityType: "prescription",
        entityId: prescriptionId,
        ipAddress: "127.0.0.1",
        userAgent: "ANVISA Tracking Service",
        sessionId: `anvisa-${Date.now()}`,
        complianceType: "anvisa",
        riskLevel: substance.controlledClass.startsWith("A")
          ? "high"
          : "medium",
        description:
          `Prescribed ${substance.substanceName} (${substance.controlledClass}) - ${prescriptionData.quantity} units`,
      });

      return {
        isValid: true,
        data: prescription,
        errors: [],
        warnings: substance.restrictions,
        timestamp: new Date(),
        source: "anvisa-controlled-substances",
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          "Erro interno ao criar prescrição: "
          + (error instanceof Error ? error.message : "Erro desconhecido"),
        ],
        warnings: [],
        timestamp: new Date(),
        source: "anvisa-controlled-substances",
      };
    }
  }

  /**
   * Record prescription dispensation
   */
  public async recordDispensation(
    prescriptionId: string,
    dispensedQuantity: number,
    pharmacyId: string,
  ): Promise<ValidationResponse<ControlledPrescription>> {
    const prescription = this.prescriptions.get(prescriptionId);

    if (!prescription) {
      return {
        isValid: false,
        errors: ["Prescrição não encontrada"],
        warnings: [],
        timestamp: new Date(),
        source: "anvisa-dispensation",
      };
    }

    if (
      prescription.status !== "prescribed"
      && prescription.status !== "partially-dispensed"
    ) {
      return {
        isValid: false,
        errors: [
          "Prescrição não pode ser dispensada no status atual: "
          + prescription.status,
        ],
        warnings: [],
        timestamp: new Date(),
        source: "anvisa-dispensation",
      };
    }

    if (prescription.validUntil < new Date()) {
      return {
        isValid: false,
        errors: ["Prescrição expirada"],
        warnings: [],
        timestamp: new Date(),
        source: "anvisa-dispensation",
      };
    }

    const totalDispensed = (prescription.dispensedQuantity || 0) + dispensedQuantity;
    if (totalDispensed > prescription.quantity) {
      return {
        isValid: false,
        errors: ["Quantidade a dispensar excede o prescrito"],
        warnings: [],
        timestamp: new Date(),
        source: "anvisa-dispensation",
      };
    }

    // Update prescription
    const updatedPrescription: ControlledPrescription = {
      ...prescription,
      dispensedQuantity: totalDispensed,
      dispensedDate: new Date(),
      pharmacyId,
      status: totalDispensed === prescription.quantity
        ? "dispensed"
        : "partially-dispensed",
    };

    this.prescriptions.set(prescriptionId, updatedPrescription);

    // Add audit trail
    this.addAuditEntry({
      timestamp: new Date(),
      userId: "pharmacy-system",
      userRole: "pharmacy",
      action: "update",
      entityType: "prescription",
      entityId: prescriptionId,
      oldValue: prescription,
      newValue: updatedPrescription,
      ipAddress: "127.0.0.1",
      userAgent: "ANVISA Tracking Service",
      sessionId: `anvisa-disp-${Date.now()}`,
      complianceType: "anvisa",
      riskLevel: "medium",
      description: `Dispensed ${dispensedQuantity} units at pharmacy ${pharmacyId}`,
    });

    return {
      isValid: true,
      data: updatedPrescription,
      errors: [],
      warnings: [],
      timestamp: new Date(),
      source: "anvisa-dispensation",
    };
  }

  /**
   * Get prescriptions by patient
   */
  public getPrescriptionsByPatient(
    patientId: string,
  ): ControlledPrescription[] {
    const results: ControlledPrescription[] = [];

    for (const prescription of this.prescriptions.values()) {
      if (prescription.patientId === patientId) {
        results.push(prescription);
      }
    }

    return results.sort(
      (a, b) => b.prescriptionDate.getTime() - a.prescriptionDate.getTime(),
    );
  }

  /**
   * Get prescriptions by doctor
   */
  public getPrescriptionsByDoctor(doctorCRM: string): ControlledPrescription[] {
    const results: ControlledPrescription[] = [];

    for (const prescription of this.prescriptions.values()) {
      if (prescription.doctorCRM === doctorCRM) {
        results.push(prescription);
      }
    }

    return results.sort(
      (a, b) => b.prescriptionDate.getTime() - a.prescriptionDate.getTime(),
    );
  }

  /**
   * Get expiring prescriptions
   */
  public getExpiringPrescriptions(days = 7): ControlledPrescription[] {
    const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const results: ControlledPrescription[] = [];

    for (const prescription of this.prescriptions.values()) {
      if (
        prescription.validUntil <= cutoffDate
        && (prescription.status === "prescribed"
          || prescription.status === "partially-dispensed")
      ) {
        results.push(prescription);
      }
    }

    return results.sort(
      (a, b) => a.validUntil.getTime() - b.validUntil.getTime(),
    );
  }

  /**
   * Get tracking statistics
   */
  public getTrackingStatistics(): {
    totalPrescriptions: number;
    prescriptionsPerClass: Record<ANVISAControlledClass, number>;
    dispensedPrescriptions: number;
    expiredPrescriptions: number;
    totalSubstances: number;
    substancesPerClass: Record<ANVISAControlledClass, number>;
  } {
    const stats = {
      totalPrescriptions: this.prescriptions.size,
      prescriptionsPerClass: {} as Record<ANVISAControlledClass, number>,
      dispensedPrescriptions: 0,
      expiredPrescriptions: 0,
      totalSubstances: this.substances.size,
      substancesPerClass: {} as Record<ANVISAControlledClass, number>,
    };

    // Initialize class counters
    const classes: ANVISAControlledClass[] = [
      "A1",
      "A2",
      "A3",
      "B1",
      "B2",
      "C1",
      "C2",
    ];
    classes.forEach((cls) => {
      stats.prescriptionsPerClass[cls] = 0;
      stats.substancesPerClass[cls] = 0;
    });

    // Count prescriptions by class and status
    for (const prescription of this.prescriptions.values()) {
      const substance = this.getSubstance(prescription.substanceId);
      if (substance) {
        stats.prescriptionsPerClass[substance.controlledClass]++;
      }

      if (prescription.status === "dispensed") {
        stats.dispensedPrescriptions++;
      }

      if (prescription.status === "expired") {
        stats.expiredPrescriptions++;
      }
    }

    // Count substances by class
    for (const substance of this.substances.values()) {
      stats.substancesPerClass[substance.controlledClass]++;
    }

    return stats;
  }

  /**
   * Generate compliance report
   */
  public generateComplianceReport(): ComplianceAPIResponse<{
    reportId: string;
    generatedAt: Date;
    statistics: ReturnType<
      ANVISAControlledSubstancesService["getTrackingStatistics"]
    >;
    expiringPrescriptions: ControlledPrescription[];
    recentAuditEntries: AuditTrailEntry[];
    complianceScore: number;
  }> {
    const statistics = this.getTrackingStatistics();
    const expiringPrescriptions = this.getExpiringPrescriptions();
    const recentAuditEntries = this.getAuditTrail(50);

    // Calculate compliance score based on various factors
    const complianceScore = this.calculateComplianceScore();

    return {
      success: true,
      data: {
        reportId: `anvisa-report-${Date.now()}`,
        generatedAt: new Date(),
        statistics,
        expiringPrescriptions,
        recentAuditEntries,
        complianceScore,
      },
      message: "Relatório de conformidade ANVISA gerado com sucesso",
      metadata: {
        requestId: `req-${Date.now()}`,
        processedAt: new Date(),
        source: "anvisa-controlled-substances",
        version: "1.0.0",
      },
    };
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(): number {
    const stats = this.getTrackingStatistics();
    const expiringCount = this.getExpiringPrescriptions().length;

    let score = 100;

    // Deduct points for expired prescriptions
    if (stats.expiredPrescriptions > 0) {
      score -= Math.min(20, stats.expiredPrescriptions * 2);
    }

    // Deduct points for expiring prescriptions
    if (expiringCount > 0) {
      score -= Math.min(10, expiringCount);
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Add audit trail entry
   */
  private addAuditEntry(entry: AuditTrailEntry): void {
    this.auditTrail.push(entry);

    // Keep only last 1000 entries
    if (this.auditTrail.length > 1000) {
      this.auditTrail = this.auditTrail.slice(-1000);
    }
  }

  /**
   * Get audit trail
   */
  public getAuditTrail(limit = 100): AuditTrailEntry[] {
    return this.auditTrail
      .filter((entry) => entry.complianceType === "anvisa")
      .slice(-limit)
      .reverse();
  }

  /**
   * Clear all data (for testing)
   */
  public clearData(): void {
    this.prescriptions.clear();
    this.auditTrail = [];
    this.loadSubstancesDatabase(); // Reload substances
  }
}

// Export singleton instance
export const anvisaControlledSubstancesService = ANVISAControlledSubstancesService.getInstance();

// Utility functions
export const anvisaUtils = {
  /**
   * Get class information
   */
  getClassInfo: (controlledClass: ANVISAControlledClass) => {
    return ANVISA_CLASSIFICATIONS[controlledClass];
  },

  /**
   * Get prescription type color
   */
  getPrescriptionTypeColor: (prescriptionType: PrescriptionType): string => {
    const colors = {
      "receituario-a": "#fef3c7", // Yellow background
      "receituario-b": "#dbeafe", // Blue background
      "receituario-c": "#f3f4f6", // White/gray background
      "receituario-especial": "#fce7f3", // Pink background
      "notificacao-receita": "#ecfdf5", // Green background
    };
    return colors[prescriptionType] || colors["receituario-c"];
  },

  /**
   * Format prescription number
   */
  formatPrescriptionNumber: (prescriptionNumber: string): string => {
    return prescriptionNumber.replace(/(\w{3})-(\d+)-(\w+)/, "$1-$2-$3");
  },

  /**
   * Check if prescription is expiring soon
   */
  isPrescriptionExpiringSoon: (validUntil: Date, days = 7): boolean => {
    const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return validUntil <= cutoffDate;
  },

  /**
   * Get controlled class risk level
   */
  getClassRiskLevel: (
    controlledClass: ANVISAControlledClass,
  ): "low" | "medium" | "high" => {
    const highRisk: ANVISAControlledClass[] = ["A1", "A2", "A3"];
    const mediumRisk: ANVISAControlledClass[] = ["B1", "B2"];
    const lowRisk: ANVISAControlledClass[] = ["C1", "C2"];

    if (highRisk.includes(controlledClass)) {
      return "high";
    }
    if (mediumRisk.includes(controlledClass)) {
      return "medium";
    }
    return "low";
  },
};

export default ANVISAControlledSubstancesService;
