// ANVISA Controlled Substances Tracking System
// Complete system for managing controlled substances according to Brazilian regulations

import type {
  ControlledSubstance,
  PrescriptionRecord,
  StockEntry,
  ANVISAControlClass,
  PrescriptionType,
  AuditTrailEntry,
} from "../../types/compliance";

// =============================================================================
// ANVISA CONTROLLED SUBSTANCES DATABASE
// =============================================================================

const CONTROLLED_SUBSTANCES_DATABASE: ControlledSubstance[] = [
  // Class A1 - Narcóticos de alta dependência
  {
    id: "anvisa_morfina_001",
    anvisaCode: "1.07.01.001-9",
    name: "Morfina",
    activeIngredient: "Sulfato de Morfina",
    controlClass: "A1",
    prescriptionType: "receituario_amarelo",
    maxQuantity: 30, // comprimidos
    validityDays: 30,
    requiresNotification: true,
    restrictions: [
      "Uso hospitalar ou domiciliar sob supervisão",
      "Pacientes com dor crônica intratável",
      "Cuidados paliativos",
    ],
    contraindications: [
      "Insuficiência respiratória grave",
      "Íleo paralítico",
      "Trauma craniano com pressão intracraniana elevada",
    ],
    lastUpdated: "2024-01-15T00:00:00Z",
  },
  {
    id: "anvisa_fentanil_001",
    anvisaCode: "1.07.01.002-7",
    name: "Fentanil",
    activeIngredient: "Citrato de Fentanil",
    controlClass: "A1",
    prescriptionType: "receituario_amarelo",
    maxQuantity: 10, // adesivos
    validityDays: 30,
    requiresNotification: true,
    restrictions: [
      "Apenas para dor crônica severa",
      "Uso em pacientes opioides-tolerantes",
      "Monitorização rigorosa",
    ],
    contraindications: [
      "Dor aguda ou pós-operatória",
      "Depressão respiratória",
      "Uso concomitante com álcool",
    ],
    lastUpdated: "2024-01-15T00:00:00Z",
  },

  // Class A2 - Narcóticos de média dependência
  {
    id: "anvisa_codeina_001",
    anvisaCode: "1.07.02.001-5",
    name: "Codeína",
    activeIngredient: "Fosfato de Codeína",
    controlClass: "A2",
    prescriptionType: "receituario_amarelo",
    maxQuantity: 60, // comprimidos
    validityDays: 30,
    requiresNotification: false,
    restrictions: [
      "Não indicado para menores de 12 anos",
      "Uso limitado a 3 dias para dor aguda",
    ],
    contraindications: [
      "Insuficiência respiratória",
      "Asma aguda",
      "Uso concomitante com IMAO",
    ],
    lastUpdated: "2024-01-15T00:00:00Z",
  },

  // Class B1 - Psicotrópicos (anfetamínicos)
  {
    id: "anvisa_ritalina_001",
    anvisaCode: "2.01.01.001-1",
    name: "Ritalina",
    activeIngredient: "Cloridrato de Metilfenidato",
    controlClass: "B1",
    prescriptionType: "receituario_azul",
    maxQuantity: 30, // comprimidos
    validityDays: 30,
    requiresNotification: true,
    restrictions: [
      "TDAH confirmado por especialista",
      "Monitorização do crescimento em crianças",
      "Avaliação cardiovascular prévia",
    ],
    contraindications: [
      "Glaucoma",
      "Hipertensão arterial grave",
      "Hipertireoidismo",
      "Estados de ansiedade grave",
    ],
    lastUpdated: "2024-01-15T00:00:00Z",
  },
  {
    id: "anvisa_venvanse_001",
    anvisaCode: "2.01.01.002-0",
    name: "Venvanse",
    activeIngredient: "Dimesilato de Lisdexanfetamina",
    controlClass: "B1",
    prescriptionType: "receituario_azul",
    maxQuantity: 30, // cápsulas
    validityDays: 30,
    requiresNotification: true,
    restrictions: [
      "TDAH em crianças acima de 6 anos",
      "Transtorno da compulsão alimentar em adultos",
      "Dose única matinal",
    ],
    contraindications: [
      "Doença cardiovascular grave",
      "Hipertensão arterial não controlada",
      "Hipertireoidismo",
      "Uso de IMAO",
    ],
    lastUpdated: "2024-01-15T00:00:00Z",
  },

  // Class B2 - Psicotrópicos (benzodiazepínicos)
  {
    id: "anvisa_rivotril_001",
    anvisaCode: "2.02.01.001-8",
    name: "Rivotril",
    activeIngredient: "Clonazepam",
    controlClass: "B1",
    prescriptionType: "receituario_azul",
    maxQuantity: 60, // comprimidos
    validityDays: 30,
    requiresNotification: false,
    restrictions: [
      "Epilepsia e transtornos de ansiedade",
      "Redução gradual para descontinuação",
      "Evitar uso prolongado",
    ],
    contraindications: [
      "Miastenia grave",
      "Insuficiência respiratória grave",
      "Dependência ao álcool ou drogas",
    ],
    lastUpdated: "2024-01-15T00:00:00Z",
  },
  {
    id: "anvisa_alprazolam_001",
    anvisaCode: "2.02.01.002-6",
    name: "Frontal",
    activeIngredient: "Alprazolam",
    controlClass: "B1",
    prescriptionType: "receituario_azul",
    maxQuantity: 60, // comprimidos
    validityDays: 30,
    requiresNotification: false,
    restrictions: [
      "Transtorno de ansiedade e síndrome do pânico",
      "Uso por curto período",
      "Risco de dependência",
    ],
    contraindications: [
      "Glaucoma de ângulo fechado",
      "Miastenia grave",
      "Insuficiência respiratória",
    ],
    lastUpdated: "2024-01-15T00:00:00Z",
  },

  // Class C1 - Outras substâncias controladas
  {
    id: "anvisa_sibutramina_001",
    anvisaCode: "3.01.01.001-4",
    name: "Sibutramina",
    activeIngredient: "Cloridrato de Sibutramina",
    controlClass: "C1",
    prescriptionType: "receituario_branco",
    maxQuantity: 30, // cápsulas
    validityDays: 30,
    requiresNotification: false,
    restrictions: [
      "Obesidade com IMC > 30",
      "Acompanhamento médico mensal",
      "Avaliação cardiovascular",
    ],
    contraindications: [
      "Doença cardiovascular",
      "AVC prévio",
      "Transtornos alimentares",
      "Uso de antidepressivos",
    ],
    lastUpdated: "2024-01-15T00:00:00Z",
  },
];

// =============================================================================
// ANVISA CONTROLLED SUBSTANCES MANAGER
// =============================================================================

export class ANVISAControlledSubstancesManager {
  private substancesDatabase: Map<string, ControlledSubstance>;
  private prescriptionCache: Map<string, PrescriptionRecord>;
  private stockCache: Map<string, StockEntry>;

  constructor() {
    this.substancesDatabase = new Map();
    this.prescriptionCache = new Map();
    this.stockCache = new Map();

    // Initialize database
    this.loadControlledSubstances();
  }

  // =============================================================================
  // CONTROLLED SUBSTANCES MANAGEMENT
  // =============================================================================

  /**
   * Get all controlled substances by class
   */
  getControlledSubstancesByClass(
    controlClass?: ANVISAControlClass
  ): ControlledSubstance[] {
    const substances = Array.from(this.substancesDatabase.values());
    
    if (controlClass) {
      return substances.filter(s => s.controlClass === controlClass);
    }
    
    return substances;
  }

  /**
   * Search controlled substances
   */
  searchControlledSubstances(
    query: string,
    filters?: {
      controlClass?: ANVISAControlClass;
      prescriptionType?: PrescriptionType;
      requiresNotification?: boolean;
    }
  ): ControlledSubstance[] {
    let results = Array.from(this.substancesDatabase.values());

    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(substance => 
        substance.name.toLowerCase().includes(searchTerm) ||
        substance.activeIngredient.toLowerCase().includes(searchTerm) ||
        substance.anvisaCode.includes(searchTerm)
      );
    }

    // Apply filters
    if (filters?.controlClass) {
      results = results.filter(s => s.controlClass === filters.controlClass);
    }

    if (filters?.prescriptionType) {
      results = results.filter(s => s.prescriptionType === filters.prescriptionType);
    }

    if (filters?.requiresNotification !== undefined) {
      results = results.filter(s => s.requiresNotification === filters.requiresNotification);
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get controlled substance by ID
   */
  getControlledSubstanceById(id: string): ControlledSubstance | null {
    return this.substancesDatabase.get(id) || null;
  }

  /**
   * Validate prescription parameters
   */
  validatePrescriptionParameters(
    substanceId: string,
    quantity: number,
    patientAge?: number
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    maxAllowedQuantity: number;
  } {
    const substance = this.getControlledSubstanceById(substanceId);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!substance) {
      return {
        valid: false,
        errors: ["Substância controlada não encontrada"],
        warnings: [],
        maxAllowedQuantity: 0,
      };
    }

    // Check maximum quantity
    if (quantity > substance.maxQuantity) {
      errors.push(
        `Quantidade excede o máximo permitido (${substance.maxQuantity} unidades)`
      );
    }

    // Age-specific validations
    if (patientAge !== undefined) {
      if (substance.name === "Codeína" && patientAge < 12) {
        errors.push("Codeína não indicada para menores de 12 anos");
      }

      if (substance.activeIngredient.includes("Metilfenidato") && patientAge < 6) {
        errors.push("Metilfenidato não indicado para menores de 6 anos");
      }

      if (patientAge >= 65) {
        warnings.push("Atenção: paciente idoso - considerar redução da dose");
      }
    }

    // Class-specific validations
    switch (substance.controlClass) {
      case "A1":
        warnings.push("Classe A1: Risco elevado de dependência - monitorização rigorosa");
        break;
      case "B1":
        warnings.push("Classe B1: Psicotrópico - avaliação neurológica necessária");
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      maxAllowedQuantity: substance.maxQuantity,
    };
  }

  // =============================================================================
  // PRESCRIPTION MANAGEMENT
  // =============================================================================

  /**
   * Create prescription record
   */
  async createPrescriptionRecord(
    prescription: Omit<PrescriptionRecord, 'id' | 'auditTrail'>
  ): Promise<{ success: boolean; prescriptionId?: string; errors?: string[] }> {
    try {
      const substance = this.getControlledSubstanceById(prescription.substanceId);
      if (!substance) {
        return {
          success: false,
          errors: ["Substância controlada não encontrada"],
        };
      }

      // Validate prescription
      const validation = this.validatePrescriptionParameters(
        prescription.substanceId,
        prescription.quantity
      );

      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      // Generate prescription ID
      const prescriptionId = `presc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create prescription record
      const prescriptionRecord: PrescriptionRecord = {
        ...prescription,
        id: prescriptionId,
        validUntil: this.calculateValidityDate(substance.validityDays),
        status: 'prescribed',
        auditTrail: [{
          id: `audit_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: prescription.doctorId,
          userType: 'staff',
          action: 'prescription_created',
          resource: 'controlled_substance',
          resourceId: prescription.substanceId,
          details: {
            substanceName: substance.name,
            quantity: prescription.quantity,
            prescriptionType: substance.prescriptionType,
          },
          success: true,
          legalBasis: 'legal_obligation',
          dataCategories: ['health_data', 'personal_identification'],
        }],
      };

      // Cache prescription
      this.prescriptionCache.set(prescriptionId, prescriptionRecord);

      // Update stock if applicable
      if (prescription.pharmacyId) {
        await this.updateStockAfterPrescription(
          prescription.substanceId,
          prescription.pharmacyId,
          prescription.quantity
        );
      }

      return {
        success: true,
        prescriptionId,
      };

    } catch (error) {
      console.error("Error creating prescription:", error);
      return {
        success: false,
        errors: [`Erro interno: ${error.message}`],
      };
    }
  }

  /**
   * Dispense prescription
   */
  async dispensePrescription(
    prescriptionId: string,
    pharmacyId: string,
    dispensingPharmacist: string
  ): Promise<{ success: boolean; errors?: string[] }> {
    const prescription = this.prescriptionCache.get(prescriptionId);
    if (!prescription) {
      return {
        success: false,
        errors: ["Prescrição não encontrada"],
      };
    }

    if (prescription.status !== 'prescribed') {
      return {
        success: false,
        errors: [`Prescrição já ${prescription.status}`],
      };
    }

    if (new Date() > new Date(prescription.validUntil)) {
      return {
        success: false,
        errors: ["Prescrição expirada"],
      };
    }

    // Update prescription status
    prescription.status = 'dispensed';
    prescription.dispensedAt = new Date().toISOString();
    prescription.pharmacyId = pharmacyId;

    // Add audit trail entry
    prescription.auditTrail.push({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: dispensingPharmacist,
      userType: 'staff',
      action: 'prescription_dispensed',
      resource: 'controlled_substance',
      resourceId: prescription.substanceId,
      details: {
        pharmacyId,
        dispensingPharmacist,
        quantity: prescription.quantity,
      },
      success: true,
      legalBasis: 'legal_obligation',
      dataCategories: ['health_data'],
    });

    return { success: true };
  }

  /**
   * Get prescription history for a patient
   */
  getPrescriptionHistory(
    patientId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      substanceId?: string;
      limit?: number;
    }
  ): PrescriptionRecord[] {
    let prescriptions = Array.from(this.prescriptionCache.values())
      .filter(p => p.patientId === patientId);

    if (options?.startDate) {
      prescriptions = prescriptions.filter(p => 
        p.prescribedAt >= options.startDate!
      );
    }

    if (options?.endDate) {
      prescriptions = prescriptions.filter(p => 
        p.prescribedAt <= options.endDate!
      );
    }

    if (options?.substanceId) {
      prescriptions = prescriptions.filter(p => 
        p.substanceId === options.substanceId
      );
    }

    // Sort by date (most recent first)
    prescriptions.sort((a, b) => 
      new Date(b.prescribedAt).getTime() - new Date(a.prescribedAt).getTime()
    );

    if (options?.limit) {
      prescriptions = prescriptions.slice(0, options.limit);
    }

    return prescriptions;
  }

  // =============================================================================
  // STOCK MANAGEMENT
  // =============================================================================

  /**
   * Update stock entry
   */
  async updateStockEntry(
    substanceId: string,
    clinicId: string,
    stockUpdate: {
      quantity: number;
      operation: 'add' | 'remove' | 'set';
      reason: string;
      batchNumber?: string;
      expirationDate?: string;
      supplierId?: string;
    }
  ): Promise<{ success: boolean; newStockLevel?: number; errors?: string[] }> {
    const stockKey = `${substanceId}_${clinicId}`;
    let stockEntry = this.stockCache.get(stockKey);

    if (!stockEntry) {
      // Create new stock entry
      stockEntry = {
        id: `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        substanceId,
        clinicId,
        currentStock: 0,
        minimumStock: 10, // Default minimum
        lastRestocked: new Date().toISOString(),
        expirationDate: stockUpdate.expirationDate || this.calculateDefaultExpiration(),
        batchNumber: stockUpdate.batchNumber || `BATCH_${Date.now()}`,
        supplierId: stockUpdate.supplierId || 'default_supplier',
        anvisaLicense: `ANV_${clinicId}_${substanceId}`,
        auditTrail: [],
      };
    }

    // Calculate new stock level
    let newStockLevel = stockEntry.currentStock;
    switch (stockUpdate.operation) {
      case 'add':
        newStockLevel += stockUpdate.quantity;
        break;
      case 'remove':
        newStockLevel -= stockUpdate.quantity;
        break;
      case 'set':
        newStockLevel = stockUpdate.quantity;
        break;
    }

    if (newStockLevel < 0) {
      return {
        success: false,
        errors: ["Estoque insuficiente para a operação"],
      };
    }

    // Update stock entry
    stockEntry.currentStock = newStockLevel;
    if (stockUpdate.operation === 'add') {
      stockEntry.lastRestocked = new Date().toISOString();
    }

    // Add audit trail
    stockEntry.auditTrail.push({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'system', // Would be actual user ID
      userType: 'system',
      action: `stock_${stockUpdate.operation}`,
      resource: 'controlled_substance_stock',
      resourceId: substanceId,
      details: {
        operation: stockUpdate.operation,
        quantity: stockUpdate.quantity,
        reason: stockUpdate.reason,
        previousStock: stockEntry.currentStock - (newStockLevel - stockEntry.currentStock),
        newStock: newStockLevel,
      },
      success: true,
      legalBasis: 'legal_obligation',
      dataCategories: ['health_data'],
    });

    // Cache updated entry
    this.stockCache.set(stockKey, stockEntry);

    return {
      success: true,
      newStockLevel,
    };
  }

  /**
   * Get stock alerts (low stock, expired, etc.)
   */
  getStockAlerts(clinicId?: string): {
    lowStock: StockEntry[];
    expired: StockEntry[];
    expiringSoon: StockEntry[];
  } {
    const stockEntries = Array.from(this.stockCache.values());
    const filteredEntries = clinicId 
      ? stockEntries.filter(s => s.clinicId === clinicId)
      : stockEntries;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      lowStock: filteredEntries.filter(s => s.currentStock <= s.minimumStock),
      expired: filteredEntries.filter(s => new Date(s.expirationDate) < now),
      expiringSoon: filteredEntries.filter(s => {
        const expDate = new Date(s.expirationDate);
        return expDate >= now && expDate <= thirtyDaysFromNow;
      }),
    };
  }

  // =============================================================================
  // REPORTING & COMPLIANCE
  // =============================================================================

  /**
   * Generate ANVISA compliance report
   */
  generateANVISAReport(
    clinicId: string,
    period: { startDate: string; endDate: string }
  ): {
    summary: {
      totalPrescriptions: number;
      totalDispensed: number;
      byControlClass: Record<ANVISAControlClass, number>;
      stockMovements: number;
    };
    prescriptions: PrescriptionRecord[];
    stockMovements: StockEntry[];
    alerts: {
      expiredPrescriptions: number;
      lowStockItems: number;
      expiredStock: number;
    };
  } {
    const prescriptions = Array.from(this.prescriptionCache.values())
      .filter(p => 
        p.prescribedAt >= period.startDate &&
        p.prescribedAt <= period.endDate
      );

    const stockEntries = Array.from(this.stockCache.values())
      .filter(s => s.clinicId === clinicId);

    // Calculate summary
    const byControlClass: Record<ANVISAControlClass, number> = {
      A1: 0, A2: 0, A3: 0,
      B1: 0, B2: 0,
      C1: 0, C2: 0, C3: 0, C4: 0, C5: 0,
    };

    prescriptions.forEach(p => {
      const substance = this.getControlledSubstanceById(p.substanceId);
      if (substance) {
        byControlClass[substance.controlClass]++;
      }
    });

    const alerts = this.getStockAlerts(clinicId);

    return {
      summary: {
        totalPrescriptions: prescriptions.length,
        totalDispensed: prescriptions.filter(p => p.status === 'dispensed').length,
        byControlClass,
        stockMovements: stockEntries.reduce((sum, s) => sum + s.auditTrail.length, 0),
      },
      prescriptions,
      stockMovements: stockEntries,
      alerts: {
        expiredPrescriptions: prescriptions.filter(p => 
          new Date(p.validUntil) < new Date()
        ).length,
        lowStockItems: alerts.lowStock.length,
        expiredStock: alerts.expired.length,
      },
    };
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private loadControlledSubstances(): void {
    CONTROLLED_SUBSTANCES_DATABASE.forEach(substance => {
      this.substancesDatabase.set(substance.id, substance);
    });
  }

  private calculateValidityDate(validityDays: number): string {
    const date = new Date();
    date.setDate(date.getDate() + validityDays);
    return date.toISOString();
  }

  private calculateDefaultExpiration(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2); // 2 years default
    return date.toISOString();
  }

  private async updateStockAfterPrescription(
    substanceId: string,
    pharmacyId: string,
    quantity: number
  ): Promise<void> {
    await this.updateStockEntry(substanceId, pharmacyId, {
      quantity,
      operation: 'remove',
      reason: 'Prescription dispensed',
    });
  }
}

// Export singleton instance
export const anvisaManager = new ANVISAControlledSubstancesManager();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get prescription type description in Portuguese
 */
export function getPrescriptionTypeDescription(type: PrescriptionType): string {
  const descriptions: Record<PrescriptionType, string> = {
    receituario_amarelo: "Receituário Amarelo (A1, A2, A3)",
    receituario_azul: "Receituário Azul (B1, B2)",
    receituario_branco: "Receituário Branco (C1-C5)",
    notificacao_receita: "Receita de Notificação",
  };
  return descriptions[type];
}

/**
 * Get control class description in Portuguese
 */
export function getControlClassDescription(controlClass: ANVISAControlClass): string {
  const descriptions: Record<ANVISAControlClass, string> = {
    A1: "A1 - Narcóticos (alta dependência)",
    A2: "A2 - Narcóticos (média dependência)", 
    A3: "A3 - Narcóticos (baixa dependência)",
    B1: "B1 - Psicotrópicos (anfetamínicos)",
    B2: "B2 - Psicotrópicos (barbitúricos)",
    C1: "C1 - Outras substâncias controladas",
    C2: "C2 - Retinóides",
    C3: "C3 - Imunossupressores",
    C4: "C4 - Antidepressivos",
    C5: "C5 - Anorexígenos",
  };
  return descriptions[controlClass];
}