import { z } from 'zod';
import {
  type BaseEntity,
  DateSchema,
  type InventoryStatus,
  NonNegativeNumberSchema,
  PositiveNumberSchema,
  UUIDSchema,
} from '../types';

// Product and inventory interfaces for aesthetic clinic
export interface Product extends BaseEntity {
  name: string;
  brand: string;
  category: ProductCategory;
  type: ProductType;
  description: string;
  sku: string;
  unitOfMeasure: UnitOfMeasure;
  unitCost: number;
  sellingPrice: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  storageRequirements: StorageRequirements;
  shelfLifeDays: number;
  requiresBatch: boolean;
  requiresSerial: boolean;
  isActive: boolean;
  supplier: Supplier;
  regulatoryInfo?: RegulatoryInfo;
  contraindications?: string[];
  usageInstructions?: string;
}

export interface StockItem extends BaseEntity {
  productId: string;
  batchNumber?: string;
  serialNumber?: string;
  quantity: number;
  unitCost: number;
  expiryDate?: Date;
  receivedDate: Date;
  supplier: Supplier;
  location: StorageLocation;
  status: InventoryStatus;
  notes?: string;
}

export interface StockMovement extends BaseEntity {
  stockItemId: string;
  movementType: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: string; // appointment ID, treatment session ID, etc.
  performedBy: string;
}
export interface Supplier extends BaseEntity {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: SupplierAddress;
  paymentTerms: string;
  deliveryDays: number;
  minimumOrder?: number;
  isActive: boolean;
  rating: number; // 1-5 scale
  notes?: string;
}

export type SupplierAddress = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export interface PurchaseOrder extends BaseEntity {
  orderNumber: string;
  supplierId: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  status: OrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  approvedBy?: string;
  receivedBy?: string;
}

export type PurchaseOrderItem = {
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity?: number;
};

export type StorageLocation = {
  id: string;
  name: string;
  zone: string; // refrigerated, room temperature, controlled
  capacity: number;
  currentOccupancy: number;
  temperature?: TemperatureRange;
  humidity?: HumidityRange;
};

export type StorageRequirements = {
  temperatureMin?: number;
  temperatureMax?: number;
  humidityMin?: number;
  humidityMax?: number;
  lightSensitive: boolean;
  requiresRefrigeration: boolean;
  requiresFreezing: boolean;
  specialInstructions?: string;
};
export type RegulatoryInfo = {
  fdaApproved: boolean;
  anvisaApproved: boolean;
  ceMarking: boolean;
  lotNumber?: string;
  manufactureDate?: Date;
  regulatoryNotes?: string;
};

export type TemperatureRange = {
  min: number;
  max: number;
  unit: 'celsius' | 'fahrenheit';
};

export type HumidityRange = {
  min: number; // percentage
  max: number; // percentage
};

export type InventoryAlert = {
  id: string;
  type: AlertType;
  productId: string;
  stockItemId?: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
};

// Enums
export enum ProductCategory {
  INJECTABLES = 'injectables',
  DERMAL_FILLERS = 'dermal_fillers',
  SKINCARE = 'skincare',
  LASER_CONSUMABLES = 'laser_consumables',
  MEDICAL_DEVICES = 'medical_devices',
  SAFETY_EQUIPMENT = 'safety_equipment',
  CLEANING_SUPPLIES = 'cleaning_supplies',
  OFFICE_SUPPLIES = 'office_supplies',
}

export enum ProductType {
  // Injectables
  BOTULINUM_TOXIN = 'botulinum_toxin',
  HYALURONIC_ACID = 'hyaluronic_acid',
  CALCIUM_HYDROXYLAPATITE = 'calcium_hydroxylapatite',
  POLY_L_LACTIC_ACID = 'poly_l_lactic_acid',

  // Skincare
  CLEANSER = 'cleanser',
  MOISTURIZER = 'moisturizer',
  SERUM = 'serum',
  SUNSCREEN = 'sunscreen',
  CHEMICAL_PEEL = 'chemical_peel',

  // Equipment
  LASER_TIP = 'laser_tip',
  CANNULA = 'cannula',
  NEEDLE = 'needle',
  SYRINGE = 'syringe',

  // Other
  CONSUMABLE = 'consumable',
  EQUIPMENT = 'equipment',
  MEDICATION = 'medication',
}

export enum UnitOfMeasure {
  UNITS = 'units',
  ML = 'ml',
  MG = 'mg',
  GRAMS = 'grams',
  PIECES = 'pieces',
  BOTTLES = 'bottles',
  BOXES = 'boxes',
  VIALS = 'vials',
}
export enum MovementType {
  RECEIVED = 'received',
  USED = 'used',
  EXPIRED = 'expired',
  DAMAGED = 'damaged',
  RETURNED = 'returned',
  TRANSFERRED = 'transferred',
  ADJUSTMENT = 'adjustment',
  DISPOSED = 'disposed',
}

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  SENT = 'sent',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired',
  TEMPERATURE_ALERT = 'temperature_alert',
  HUMIDITY_ALERT = 'humidity_alert',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Validation schemas
export const CreateProductSchema = z.object({
  name: z.string().min(1).max(100),
  brand: z.string().min(1).max(50),
  category: z.nativeEnum(ProductCategory),
  type: z.nativeEnum(ProductType),
  description: z.string().min(1),
  sku: z.string().min(1).max(50),
  unitOfMeasure: z.nativeEnum(UnitOfMeasure),
  unitCost: PositiveNumberSchema,
  sellingPrice: PositiveNumberSchema,
  minimumStock: NonNegativeNumberSchema,
  maximumStock: PositiveNumberSchema,
  reorderPoint: NonNegativeNumberSchema,
  reorderQuantity: PositiveNumberSchema,
  shelfLifeDays: PositiveNumberSchema,
  requiresBatch: z.boolean().default(false),
  requiresSerial: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const CreateStockItemSchema = z.object({
  productId: UUIDSchema,
  batchNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  quantity: PositiveNumberSchema,
  unitCost: PositiveNumberSchema,
  expiryDate: DateSchema.optional(),
  receivedDate: DateSchema,
  supplierId: UUIDSchema,
  locationId: z.string(),
  notes: z.string().optional(),
});

export const CreateSupplierSchema = z.object({
  name: z.string().min(1).max(100),
  contactPerson: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }),
  paymentTerms: z.string().min(1),
  deliveryDays: z.number().min(1).max(365),
  minimumOrder: PositiveNumberSchema.optional(),
  isActive: z.boolean().default(true),
  rating: z.number().min(1).max(5).default(3),
  notes: z.string().optional(),
});

export type CreateProductData = z.infer<typeof CreateProductSchema>;
export type CreateStockItemData = z.infer<typeof CreateStockItemSchema>;
export type CreateSupplierData = z.infer<typeof CreateSupplierSchema>;
