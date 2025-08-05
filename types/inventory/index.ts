/**
 * NeonPro Inventory Management System Types
 *
 * Complete TypeScript definitions for Brazilian healthcare-compliant
 * inventory management system with ANVISA, CFM, and LGPD compliance.
 *
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA, CFM, LGPD, Brazilian Tax Regulations
 */

// ===============================
// CORE PRODUCT TYPES
// ===============================

export type ProductCategory = "botox" | "fillers" | "skincare" | "equipment" | "consumables";

export type ProductStatus = "active" | "inactive" | "discontinued";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string;
  ncmCode: string; // Nomenclatura Comum do Mercosul
  anvisaRegistration?: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  unitCost: number;
  unit: string;
  location: string;
  temperatureControlled: boolean;
  controlledSubstance: boolean;
  expirationDate?: string;
  batchNumber?: string;
  supplier: string;
  supplierCnpj: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;

  // Healthcare compliance
  medicalDeviceClass?: "I" | "II" | "III" | "IV"; // ANVISA classification
  sterile: boolean;
  singleUse: boolean;
  requiresPrescription: boolean;

  // Storage requirements
  storageConditions: {
    temperature: {
      min: number;
      max: number;
      unit: "celsius" | "fahrenheit";
    };
    humidity?: {
      min: number;
      max: number;
    };
    lightSensitive: boolean;
    requiresRefrigeration: boolean;
  };

  // Regulatory information
  regulatory: {
    cfmApproval?: string; // CFM approval number
    invoiceRequired: boolean;
    prescriptionRequired: boolean;
    controlledSubstanceSchedule?:
      | "A1"
      | "A2"
      | "A3"
      | "B1"
      | "B2"
      | "C1"
      | "C2"
      | "C3"
      | "C4"
      | "C5";
  };
}

// ===============================
// SUPPLIER TYPES
// ===============================

export type TaxRegime = "simples_nacional" | "lucro_presumido" | "lucro_real";

export type SupplierStatus = "active" | "inactive" | "suspended";

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  tradeName?: string;
  email: string;
  phone: string;
  address: Address;
  categories: ProductCategory[];
  status: SupplierStatus;
  taxRegime: TaxRegime;
  anvisaAuthorization?: string;
  certificates: string[];
  paymentTerms: string;
  deliveryTime: number; // in days
  minOrderValue: number;
  contactPerson: string;
  contactPhone: string;
  createdAt: string;
  lastOrderDate?: string;
  totalOrders: number;
  averageRating: number;

  // LGPD Compliance
  lgpdConsent: boolean;
  lgpdConsentDate?: string;
  dataRetentionPeriod: number; // in months

  // Performance metrics
  performance: {
    onTimeDeliveryRate: number; // percentage
    qualityRating: number; // 1-5 scale
    priceCompetitiveness: number; // 1-5 scale
    responsiveness: number; // 1-5 scale
    lastEvaluationDate: string;
  };

  // Banking information (encrypted)
  bankingInfo?: {
    bankCode: string;
    agencyNumber: string;
    accountNumber: string;
    accountType: "checking" | "savings";
    pixKey?: string;
  };
}

// ===============================
// BATCH TRACKING TYPES
// ===============================

export type BatchStatus = "quarantine" | "available" | "in_use" | "expired" | "recalled";

export type QualityControlStatus = "pending" | "approved" | "rejected";

export interface TraceabilityEntry {
  id: string;
  date: string;
  action: string;
  user: string;
  location: string;
  details: string;
  temperature?: number;
  validated: boolean;
  digitalSignature?: string;
}

export interface UtilizationEntry {
  id: string;
  date: string;
  patientId?: string; // LGPD protected
  procedureType: string;
  quantityUsed: number;
  professionalId: string;
  professionalName: string;
  professionalCrm: string;
  notes?: string;

  // Patient safety tracking
  adverseEvents?: {
    reported: boolean;
    severity?: "mild" | "moderate" | "severe";
    description?: string;
    reportedToAnvisa: boolean;
  };
}

export interface Batch {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  brand: string;
  quantity: number;
  unit: string;
  manufactureDate: string;
  expirationDate: string;
  supplierName: string;
  supplierCnpj: string;
  receivedDate: string;
  receivedBy: string;
  currentLocation: string;
  temperatureControlled: boolean;
  storageTemperature?: string;
  anvisaRegistration?: string;
  ncmCode: string;
  invoiceNumber: string;
  unitCost: number;
  totalCost: number;

  qualityControl: {
    status: QualityControlStatus;
    inspector: string;
    inspectionDate?: string;
    notes?: string;
    certificates: string[];
    testResults?: {
      sterility?: boolean;
      potency?: number;
      purity?: number;
      endotoxin?: number;
    };
  };

  traceabilityChain: TraceabilityEntry[];
  status: BatchStatus;
  utilizationTracking: UtilizationEntry[];

  // Recall information
  recallInfo?: {
    recallNumber: string;
    recallDate: string;
    reason: string;
    anvisaNotified: boolean;
    customersNotified: boolean;
    unitsReturned: number;
  };
}

// ===============================
// STOCK MOVEMENT TYPES
// ===============================

export type MovementType = "entry" | "exit" | "adjustment" | "transfer" | "return" | "disposal";

export type MovementStatus = "pending" | "approved" | "rejected" | "completed";

export interface ANVISACompliance {
  required: boolean;
  validated: boolean;
  validatedBy?: string;
  validatedAt?: string;
  registrationNumber?: string;
  complianceNotes?: string;
}

export interface AuditTrail {
  ipAddress: string;
  deviceInfo: string;
  geolocation?: string;
  verified: boolean;
  digitalSignature?: string;
  encryptionMethod?: string;
}

export interface StockMovement {
  id: string;
  type: MovementType;
  productId: string;
  productName: string;
  category: ProductCategory;
  batchNumber?: string;
  quantity: number;
  unit: string;
  unitCost?: number;
  totalValue?: number;
  reason: string;
  reference?: string; // invoice, order, prescription, etc.
  userId: string;
  userName: string;
  userRole: string;
  userCrm?: string; // for medical professionals
  timestamp: string;

  location: {
    from?: string;
    to: string;
  };

  // Patient tracking (LGPD compliant)
  patientId?: string;
  procedureId?: string;

  // Supplier information
  supplierId?: string;
  supplierName?: string;
  invoiceNumber?: string;

  // Compliance
  anvisaCompliance: ANVISACompliance;
  auditTrail: AuditTrail;

  // Additional information
  notes?: string;
  attachments?: string[];
  status: MovementStatus;

  // Approval workflow
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;

  // Temperature monitoring (for controlled substances)
  temperatureLog?: {
    readings: Array<{
      timestamp: string;
      temperature: number;
      location: string;
      withinRange: boolean;
    }>;
    averageTemperature: number;
    temperatureExcursions: number;
  };
}

// ===============================
// COST ANALYSIS TYPES
// ===============================

export interface BrazilianTaxes {
  icms: { rate: number; value: number }; // ICMS - Imposto sobre Circulação de Mercadorias
  ipi: { rate: number; value: number }; // IPI - Imposto sobre Produtos Industrializados
  pis: { rate: number; value: number }; // PIS - Programa de Integração Social
  cofins: { rate: number; value: number }; // COFINS - Contribuição para Financiamento da Seguridade Social
  iss: { rate: number; value: number }; // ISS - Imposto sobre Serviços
}

export interface AdditionalCosts {
  freight: number;
  insurance: number;
  handling: number;
  storage: number;
  depreciation: number;
  customsFees?: number;
  certificationCosts?: number;
}

export type Profitability = "high" | "medium" | "low" | "negative";

export interface ProductCostAnalysis {
  productId: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  unit: string;

  // Custo base
  unitCostBase: number;
  totalCostBase: number;

  // Impostos brasileiros
  taxes: BrazilianTaxes;

  // Custos adicionais
  additionalCosts: AdditionalCosts;

  // Cálculos finais
  totalTaxes: number;
  totalAdditionalCosts: number;
  finalUnitCost: number;
  finalTotalCost: number;

  // Preços e margens
  salePrice: number;
  grossMargin: number;
  grossMarginPercent: number;
  netMargin: number;
  netMarginPercent: number;

  // Análise de rentabilidade
  breakEvenQuantity: number;
  profitability: Profitability;

  // Classificação fiscal
  ncmCode: string;
  cfop: string; // Código Fiscal de Operações e Prestações
  cst: string; // Código de Situação Tributária

  // Market analysis
  marketPrice?: {
    average: number;
    minimum: number;
    maximum: number;
    competitivePosition: "above" | "average" | "below";
  };
}

// ===============================
// ALERT TYPES
// ===============================

export type AlertType =
  | "low_stock"
  | "expiring"
  | "expired"
  | "temperature"
  | "anvisa_compliance"
  | "maintenance";

export type AlertSeverity = "critical" | "warning" | "info";

export interface StockAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  productId: string;
  productName: string;
  category: ProductCategory;
  message: string;
  details: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  actionRequired: boolean;
  anvisaRegistration?: string;
  batchNumber?: string;
  location?: string;
  temperatureReading?: number;
  targetTemperatureRange?: string;

  // Alert escalation
  escalated: boolean;
  escalationLevel: number;
  notificationsSent: string[]; // email addresses

  // Resolution tracking
  resolutionActions?: Array<{
    action: string;
    performedBy: string;
    performedAt: string;
    notes?: string;
  }>;
}

// ===============================
// REORDER MANAGEMENT TYPES
// ===============================

export type ConsumptionTrend = "increasing" | "stable" | "decreasing";

export type ReorderUrgency = "critical" | "high" | "medium" | "low";

export type ReorderStatus = "suggested" | "approved" | "ordered" | "received" | "rejected";

export interface BulkDiscountTier {
  quantity: number;
  discount: number;
  validUntil?: string;
}

export interface ReorderSuggestion {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;

  // Análise preditiva
  averageConsumption: number; // per month
  consumptionTrend: ConsumptionTrend;
  seasonalFactor: number;
  leadTime: number;
  safetyStock: number;

  // Sugestão de pedido
  suggestedQuantity: number;
  suggestedOrderDate: string;
  urgency: ReorderUrgency;

  // Fornecedor e custos
  preferredSupplierId: string;
  preferredSupplierName: string;
  unitCost: number;
  totalCost: number;
  minOrderQuantity: number;
  bulkDiscountAvailable: boolean;
  bulkDiscountTiers?: BulkDiscountTier[];

  // Histórico e análise
  lastOrderDate?: string;
  lastOrderQuantity?: number;
  stockoutRisk: number; // 0-100%
  daysUntilStockout: number;

  // Compliance
  temperatureControlled: boolean;
  anvisaRegistration?: string;
  shelfLife: number; // months

  // Status
  status: ReorderStatus;
  approvedBy?: string;
  approvedAt?: string;
  orderNumber?: string;
  rejectionReason?: string;

  // AI insights
  aiConfidence: number; // 0-100%
  recommendationReason: string;
  alternativeSuppliers?: Array<{
    supplierId: string;
    supplierName: string;
    unitCost: number;
    leadTime: number;
    rating: number;
  }>;
}

// ===============================
// BARCODE INTEGRATION TYPES
// ===============================

export type BarcodeFormat = "CODE128" | "EAN13" | "QR_CODE" | "DATA_MATRIX";

export interface BarcodeData {
  productId: string;
  batchNumber?: string;
  expirationDate?: string;
  serialNumber?: string;
  anvisaCode?: string;
  gtin?: string; // Global Trade Item Number
}

export interface BarcodeScanResult {
  success: boolean;
  format: BarcodeFormat;
  rawData: string;
  parsedData?: BarcodeData;
  confidence: number;
  timestamp: string;
  deviceId: string;
  userId: string;

  // Validation results
  validation: {
    productExists: boolean;
    batchValid: boolean;
    notExpired: boolean;
    anvisaValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

// ===============================
// ANVISA COMPLIANCE TYPES
// ===============================

export type ANVISADeviceClass = "I" | "II" | "III" | "IV";

export type MaintenanceStatus = "scheduled" | "overdue" | "completed" | "skipped";

export interface ANVISADevice {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  anvisaRegistration: string;
  deviceClass: ANVISADeviceClass;
  location: string;
  installationDate: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate: string;
  calibrationDueDate?: string;

  // Maintenance tracking
  maintenanceSchedule: Array<{
    id: string;
    type: "preventive" | "corrective" | "calibration";
    scheduledDate: string;
    completedDate?: string;
    performedBy?: string;
    status: MaintenanceStatus;
    notes?: string;
    certificateNumber?: string;
    nextScheduledDate?: string;
    cost?: number;
  }>;

  // Compliance status
  compliance: {
    current: boolean;
    lastAuditDate?: string;
    nextAuditDate?: string;
    complianceNotes?: string;
    certifications: Array<{
      type: string;
      number: string;
      issueDate: string;
      expiryDate: string;
      issuingBody: string;
    }>;
  };

  // Usage tracking
  usageLog: Array<{
    date: string;
    userId: string;
    patientId?: string;
    procedureType: string;
    duration: number; // minutes
    notes?: string;
  }>;
}

// ===============================
// DASHBOARD TYPES
// ===============================

export interface InventoryMetrics {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  expiredItems: number;
  expiringItems: number;
  temperatureAlerts: number;
  anvisaCompliantItems: number;
  totalSuppliers: number;
  activeSuppliers: number;
  averageOrderValue: number;
  monthlyTurnoverRate: number;
}

export interface InventoryDashboardData {
  metrics: InventoryMetrics;
  recentMovements: StockMovement[];
  criticalAlerts: StockAlert[];
  reorderSuggestions: ReorderSuggestion[];
  topProducts: Product[];
  supplierPerformance: Array<{
    supplier: Supplier;
    metrics: {
      onTimeDelivery: number;
      qualityScore: number;
      totalOrders: number;
      totalValue: number;
    };
  }>;
}

// ===============================
// API RESPONSE TYPES
// ===============================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, any>;
}

// ===============================
// FORM TYPES
// ===============================

export interface ProductFormData {
  name: string;
  category: ProductCategory;
  brand: string;
  ncmCode: string;
  anvisaRegistration?: string;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  unitCost: number;
  unit: string;
  location: string;
  temperatureControlled: boolean;
  controlledSubstance: boolean;
  supplierId: string;
}

export interface SupplierFormData {
  name: string;
  cnpj: string;
  tradeName?: string;
  email: string;
  phone: string;
  address: Address;
  categories: ProductCategory[];
  taxRegime: TaxRegime;
  anvisaAuthorization?: string;
  paymentTerms: string;
  deliveryTime: number;
  minOrderValue: number;
  contactPerson: string;
  contactPhone: string;
  lgpdConsent: boolean;
}

export interface StockMovementFormData {
  type: MovementType;
  productId: string;
  batchNumber?: string;
  quantity: number;
  reason: string;
  reference?: string;
  locationFrom?: string;
  locationTo: string;
  patientId?: string;
  procedureId?: string;
  notes?: string;
}

// ===============================
// EXPORT TYPES
// ===============================

export interface ExportOptions {
  format: "csv" | "excel" | "pdf";
  dateRange?: {
    start: string;
    end: string;
  };
  includeImages: boolean;
  includeCompliance: boolean;
  template?: "inventory" | "movements" | "suppliers" | "cost_analysis";
}

export interface ExportResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  expiresAt?: string;
  error?: string;
}
